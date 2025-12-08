import { Injectable } from '@angular/core';

declare var google: any;

interface Waypoint {
  lat: number;
  lng: number;
  nombre?: string;
}

interface RutaOptimizada {
  waypoints: Waypoint[];
  ordenOptimizado: number[];
  distanciaTotal: number;
  duracionTotal: number;
  polyline: any;
  legs: Array<{
    distancia: number;
    duracion: number;
    inicio: string;
    fin: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleRoutesService {

  private directionsService: any;
  private geocoder: any;

  constructor() {
    this.inicializarServicios();
  }

  private async inicializarServicios() {
    while (!window['google']) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.directionsService = new google.maps.DirectionsService();
    this.geocoder = new google.maps.Geocoder();

  }

  async calcularRutaOptima(
    origen: Waypoint,
    destino: Waypoint,
    waypoints: Waypoint[]
  ): Promise<RutaOptimizada | null> {

    if (!this.directionsService) {
      await this.inicializarServicios();
    }

    try {
      const waypointsLimitados = waypoints.slice(0, 25);

      if (waypointsLimitados.length !== waypoints.length) {
        console.warn(`Se limitaron los waypoints de ${waypoints.length} a 25`);
      }

      const request = {
        origin: new google.maps.LatLng(origen.lat, origen.lng),
        destination: new google.maps.LatLng(destino.lat, destino.lng),
        waypoints: waypointsLimitados.map(wp => ({
          location: new google.maps.LatLng(wp.lat, wp.lng),
          stopover: true
        })),
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        region: 'MX',
        language: 'es'
      };


      const result = await this.directionsService.route(request);

      if (result.status === 'OK') {
        return this.procesarResultado(result);
      }

      console.error('Error en Directions:', result.status);
      return null;

    } catch (error) {
      console.error('Error calculando ruta:', error);
      return null;
    }
  }

  private procesarResultado(result: any): RutaOptimizada {
    const route = result.routes[0];

    let totalDistance = 0;
    let totalDuration = 0;
    const legs: Array<any> = [];

    route.legs.forEach((leg: any) => {
      totalDistance += leg.distance.value;
      totalDuration += leg.duration.value;

      legs.push({
        distancia: leg.distance.value,
        duracion: leg.duration.value,
        inicio: leg.start_address,
        fin: leg.end_address
      });
    });

    const ordenOptimizado = route.waypoint_order || [];

    console.log('Ruta calculada:', {
      distancia: this.formatearDistancia(totalDistance),
      duracion: this.formatearDuracion(totalDuration),
      orden: ordenOptimizado
    });

    return {
      waypoints: [],
      ordenOptimizado: ordenOptimizado,
      distanciaTotal: totalDistance,
      duracionTotal: totalDuration,
      polyline: route.overview_polyline,
      legs: legs
    };
  }

  async geocodificarDireccion(
    direccion: string,
    colonia: string,
    ciudad: string = 'Oaxaca'
  ): Promise<{ lat: number; lng: number } | null> {

    if (!this.geocoder) {
      await this.inicializarServicios();
    }

    const addressComplete = `${direccion}, ${colonia}, ${ciudad}, México`;

    try {
      console.log('Geocodificando:', addressComplete);

      const result = await this.geocoder.geocode({
        address: addressComplete,
        region: 'MX'
      });

      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;

        const coords = {
          lat: location.lat(),
          lng: location.lng()
        };

        console.log('Coordenadas:', coords);
        return coords;
      }

      console.warn(`No se encontró ubicación para: ${addressComplete}`);
      return null;

    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  }

  async geocodificarLote(
    direcciones: Array<{
      direccion: string;
      colonia: string;
      ciudad?: string;
      clienteId: number;
    }>,
    onProgress?: (current: number, total: number, cliente?: any) => void
  ): Promise<Map<number, { lat: number; lng: number }>> {

    if (!this.geocoder) {
      await this.inicializarServicios();
    }

    const resultados = new Map<number, { lat: number; lng: number }>();
    const total = direcciones.length;

    console.log(`Geocodificando ${total} direcciones...`);

    for (let i = 0; i < direcciones.length; i++) {
      const item = direcciones[i];

      if (onProgress) {
        onProgress(i + 1, total, item);
      }

      const coords = await this.geocodificarDireccion(
        item.direccion,
        item.colonia,
        item.ciudad || 'Oaxaca'
      );

      if (coords) {
        resultados.set(item.clienteId, coords);
      }

      if (i < direcciones.length - 1) {
        await this.delay(100);
      }
    }

    const exitosos = resultados.size;
    console.log(`Geocodificación completa: ${exitosos}/${total} exitosos`);

    return resultados;
  }

  generarCoordenadasSimuladas(baseLatitud: number = 17.0732, baseLongitud: number = -96.7266): { lat: number; lng: number } {
    const offsetLat = (Math.random() - 0.5) * 0.02;
    const offsetLng = (Math.random() - 0.5) * 0.02;

    return {
      lat: baseLatitud + offsetLat,
      lng: baseLongitud + offsetLng
    };
  }

  calcularDistancia(
    punto1: { lat: number; lng: number },
    punto2: { lat: number; lng: number }
  ): number {
    const R = 6371e3;
    const φ1 = punto1.lat * Math.PI / 180;
    const φ2 = punto2.lat * Math.PI / 180;
    const Δφ = (punto2.lat - punto1.lat) * Math.PI / 180;
    const Δλ = (punto2.lng - punto1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  formatearDistancia(metros: number): string {
    if (metros < 1000) {
      return `${Math.round(metros)} m`;
    }
    return `${(metros / 1000).toFixed(1)} km`;
  }

  formatearDuracion(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);

    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos} min`;
  }

  decodificarPolyline(encoded: string): Array<{ lat: number; lng: number }> {
    if (!encoded) return [];

    const poly: Array<{ lat: number; lng: number }> = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    return poly;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}