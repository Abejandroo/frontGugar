import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutaOptimizacionService {

  // TODO: Mover a environment
  private apiKey = 'AIzaSyBIYpgQpv7ihVaUH6leqM-rI3769lNuj6c';
  private routesUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  constructor(private http: HttpClient) {}

  /**
   * Optimizar ruta usando Google Routes API
   * @param origen Coordenadas de origen {lat, lng}
   * @param destinos Array de coordenadas de destinos [{lat, lng}, ...]
   * @returns Ruta optimizada con orden y polyline
   */
  async optimizarRuta(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): Promise<any> {
    
    if (destinos.length === 0) {
      return null;
    }

    // Si solo hay un destino, no hay que optimizar
    if (destinos.length === 1) {
      const ruta = await this.calcularRutaSimple(origen, destinos[0]);
      return {
        orden: [0],
        distanciaTotal: ruta.distanciaTotal,
        duracionTotal: ruta.duracionTotal,
        polyline: ruta.polyline
      };
    }

    // Calcular matriz de distancias
    const matriz = await this.calcularMatrizDistancias(origen, destinos);
    
    // Algoritmo del vecino más cercano
    const ordenOptimizado = this.algoritmoVecinoMasCercano(matriz);
    
    // Calcular ruta completa con el orden optimizado
    const rutaCompleta = await this.calcularRutaCompleta(
      origen,
      ordenOptimizado.map(idx => destinos[idx])
    );

    return {
      orden: ordenOptimizado,
      distanciaTotal: rutaCompleta.distanciaTotal,
      duracionTotal: rutaCompleta.duracionTotal,
      polyline: rutaCompleta.polyline
    };
  }

  /**
   * Calcular ruta simple entre dos puntos
   */
  private async calcularRutaSimple(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number }
  ): Promise<any> {
    
    const body = {
      origin: {
        location: {
          latLng: {
            latitude: origen.lat,
            longitude: origen.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: destino.lat,
            longitude: destino.lng
          }
        }
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: 'es-MX',
      units: 'METRIC'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    });

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.routesUrl, body, { headers })
      );

      if (response.routes && response.routes.length > 0) {
        const ruta = response.routes[0];
        return {
          distanciaTotal: ruta.distanceMeters,
          duracionTotal: ruta.duration,
          polyline: this.decodificarPolyline(ruta.polyline.encodedPolyline)
        };
      }

      return null;
    } catch (error) {
      console.error('Error calculando ruta:', error);
      return null;
    }
  }

  /**
   * Calcular matriz de distancias entre todos los puntos
   */
  private async calcularMatrizDistancias(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): Promise<number[][]> {
    
    const puntos = [origen, ...destinos];
    const n = puntos.length;
    const matriz: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    // Calcular distancia euclidiana (más rápido para optimización inicial)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matriz[i][j] = 0;
        } else {
          matriz[i][j] = this.calcularDistanciaEuclidiana(
            puntos[i].lat,
            puntos[i].lng,
            puntos[j].lat,
            puntos[j].lng
          );
        }
      }
    }

    return matriz;
  }

  /**
   * Algoritmo del vecino más cercano para optimizar orden
   */
  private algoritmoVecinoMasCercano(matriz: number[][]): number[] {
    const n = matriz.length;
    const visitados = new Set<number>();
    const orden: number[] = [];
    
    // Empezar desde el origen (índice 0)
    let actual = 0;
    visitados.add(0);
    
    // Visitar todos los destinos (índices 1 en adelante)
    while (visitados.size < n) {
      let minDistancia = Infinity;
      let siguiente = -1;
      
      // Buscar el vecino más cercano no visitado
      for (let i = 1; i < n; i++) {
        if (!visitados.has(i) && matriz[actual][i] < minDistancia) {
          minDistancia = matriz[actual][i];
          siguiente = i;
        }
      }
      
      if (siguiente === -1) break;
      
      visitados.add(siguiente);
      orden.push(siguiente - 1); // Restar 1 porque el índice 0 era el origen
      actual = siguiente;
    }
    
    return orden;
  }

  /**
   * Calcular ruta completa con múltiples waypoints
   */
  private async calcularRutaCompleta(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): Promise<any> {
    
    if (destinos.length === 0) return null;

    const ultimoDestino = destinos[destinos.length - 1];
    const waypoints = destinos.slice(0, -1);

    const body: any = {
      origin: {
        location: {
          latLng: {
            latitude: origen.lat,
            longitude: origen.lng
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: ultimoDestino.lat,
            longitude: ultimoDestino.lng
          }
        }
      },
      intermediates: waypoints.map(wp => ({
        location: {
          latLng: {
            latitude: wp.lat,
            longitude: wp.lng
          }
        }
      })),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      optimizeWaypointOrder: false, // Ya optimizamos el orden
      languageCode: 'es-MX',
      units: 'METRIC'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    });

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.routesUrl, body, { headers })
      );

      if (response.routes && response.routes.length > 0) {
        const ruta = response.routes[0];
        return {
          distanciaTotal: ruta.distanceMeters,
          duracionTotal: ruta.duration,
          polyline: this.decodificarPolyline(ruta.polyline.encodedPolyline)
        };
      }

      return null;
    } catch (error) {
      console.error('Error calculando ruta completa:', error);
      return null;
    }
  }

  /**
   * Decodificar polyline de Google
   */
  private decodificarPolyline(encoded: string): [number, number][] {
    const poly: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push([lat / 1e5, lng / 1e5]);
    }

    return poly;
  }

  /**
   * Calcular distancia euclidiana
   */
  private calcularDistanciaEuclidiana(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}