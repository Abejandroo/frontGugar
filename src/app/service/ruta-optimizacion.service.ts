// src/app/service/ruta-optimizacion.service.ts
// ✅ MEJORADO - Maneja más de 25 waypoints dividiendo en segmentos

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutaOptimizacionService {

  private apiKey = 'AIzaSyBIYpgQpv7ihVaUH6leqM-rI3769lNuj6c'; // TODO: Mover a environment
  private routesUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  
  // Límite de Google Routes API
  private readonly MAX_WAYPOINTS = 25;

  constructor(private http: HttpClient) {}

  /**
   * Optimizar ruta usando Google Routes API
   * ✅ MEJORADO: Maneja más de 25 waypoints dividiéndolos en segmentos
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
        distanciaTotal: ruta?.distanciaTotal || 0,
        duracionTotal: ruta?.duracionTotal || 0,
        polyline: ruta?.polyline || []
      };
    }

    // Si hay menos de 25 destinos, usar el método normal
    if (destinos.length <= this.MAX_WAYPOINTS) {
      return await this.optimizarRutaNormal(origen, destinos);
    }

    // ✅ NUEVO: Si hay más de 25 destinos, dividir en segmentos
    console.log(`⚠️ Ruta con ${destinos.length} clientes. Dividiendo en segmentos...`);
    return await this.optimizarRutaLarga(origen, destinos);
  }

  /**
   * Optimización normal para rutas con <= 25 waypoints
   */
  private async optimizarRutaNormal(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): Promise<any> {
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
      distanciaTotal: rutaCompleta?.distanciaTotal || 0,
      duracionTotal: rutaCompleta?.duracionTotal || 0,
      polyline: rutaCompleta?.polyline || []
    };
  }

  /**
   * ✅ NUEVO: Optimización para rutas con > 25 waypoints
   * Divide la ruta en segmentos y los optimiza individualmente
   */
  private async optimizarRutaLarga(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): Promise<any> {
    
    // Paso 1: Ordenar todos los destinos por proximidad usando el algoritmo del vecino más cercano
    // Esto no usa la API de Google, solo cálculos locales
    const matrizCompleta = this.calcularMatrizDistanciasLocal(origen, destinos);
    const ordenGlobal = this.algoritmoVecinoMasCercano(matrizCompleta);
    
    // Reordenar destinos según el orden optimizado localmente
    const destinosOrdenados = ordenGlobal.map(idx => ({
      original: destinos[idx],
      indexOriginal: idx
    }));

    // Paso 2: Dividir en segmentos de máximo 25 waypoints
    const segmentos: Array<{ lat: number; lng: number }[]> = [];
    for (let i = 0; i < destinosOrdenados.length; i += this.MAX_WAYPOINTS) {
      segmentos.push(
        destinosOrdenados.slice(i, i + this.MAX_WAYPOINTS).map(d => d.original)
      );
    }

    console.log(`📦 Dividido en ${segmentos.length} segmentos`);

    // Paso 3: Calcular rutas para cada segmento
    let polylineCompleta: [number, number][] = [];
    let distanciaTotal = 0;
    let duracionTotal = 0;
    let puntoActual = origen;

    for (let i = 0; i < segmentos.length; i++) {
      const segmento = segmentos[i];
      console.log(`🔄 Procesando segmento ${i + 1}/${segmentos.length} (${segmento.length} clientes)`);

      try {
        const rutaSegmento = await this.calcularRutaCompleta(puntoActual, segmento);
        
        if (rutaSegmento) {
          polylineCompleta = polylineCompleta.concat(rutaSegmento.polyline || []);
          distanciaTotal += rutaSegmento.distanciaTotal || 0;
          duracionTotal += parseInt(rutaSegmento.duracionTotal) || 0;
          
          // El siguiente segmento empieza donde terminó este
          puntoActual = segmento[segmento.length - 1];
        }
      } catch (error) {
        console.error(`Error en segmento ${i + 1}:`, error);
        // Continuar con el siguiente segmento
      }

      // Pequeño delay entre requests para no saturar la API
      if (i < segmentos.length - 1) {
        await this.delay(200);
      }
    }

    return {
      orden: ordenGlobal,
      distanciaTotal,
      duracionTotal,
      polyline: polylineCompleta,
      segmentos: segmentos.length
    };
  }

  /**
   * Calcular matriz de distancias localmente (sin API)
   */
  private calcularMatrizDistanciasLocal(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): number[][] {
    const puntos = [origen, ...destinos];
    const n = puntos.length;
    const matriz: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matriz[i][j] = 0;
        } else {
          matriz[i][j] = this.calcularDistanciaHaversine(
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

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matriz[i][j] = 0;
        } else {
          matriz[i][j] = this.calcularDistanciaHaversine(
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
    
    let actual = 0;
    visitados.add(0);
    
    while (visitados.size < n) {
      let minDistancia = Infinity;
      let siguiente = -1;
      
      for (let i = 1; i < n; i++) {
        if (!visitados.has(i) && matriz[actual][i] < minDistancia) {
          minDistancia = matriz[actual][i];
          siguiente = i;
        }
      }
      
      if (siguiente === -1) break;
      
      visitados.add(siguiente);
      orden.push(siguiente - 1);
      actual = siguiente;
    }
    
    return orden;
  }

  /**
   * Calcular ruta completa con múltiples waypoints (máximo 25)
   */
  private async calcularRutaCompleta(
    origen: { lat: number; lng: number },
    destinos: { lat: number; lng: number }[]
  ): Promise<any> {
    
    if (destinos.length === 0) return null;

    // Limitar a 25 waypoints
    const destinosLimitados = destinos.slice(0, this.MAX_WAYPOINTS);
    
    if (destinos.length > this.MAX_WAYPOINTS) {
      console.warn(`⚠️ Limitando de ${destinos.length} a ${this.MAX_WAYPOINTS} waypoints`);
    }

    const ultimoDestino = destinosLimitados[destinosLimitados.length - 1];
    const waypoints = destinosLimitados.slice(0, -1);

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
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      optimizeWaypointOrder: false,
      languageCode: 'es-MX',
      units: 'METRIC'
    };

    // Solo agregar intermediates si hay waypoints
    if (waypoints.length > 0) {
      body.intermediates = waypoints.map(wp => ({
        location: {
          latLng: {
            latitude: wp.lat,
            longitude: wp.lng
          }
        }
      }));
    }

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
    if (!encoded) return [];
    
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
   * Calcular distancia usando fórmula de Haversine
   */
  private calcularDistanciaHaversine(
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

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}