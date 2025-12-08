import { Injectable } from '@angular/core';

declare var google: any;

export interface Step {
  instructions: string;
  distance: number;
  duration: number;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  maneuver?: string;
  polyline: string;
}

export interface Route {
  steps: Step[];
  totalDistance: number;
  totalDuration: number;
  polyline: string;
  bounds: any;
}

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {

  private directionsService: any;

  constructor() {
    this.initDirectionsService();
  }

  private async initDirectionsService() {
    while (!window['google']) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.directionsService = new google.maps.DirectionsService();
  }

  async calcularRuta(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number },
    waypoints: Array<{ lat: number; lng: number }> = []
  ): Promise<Route | null> {

    if (!this.directionsService) {
      await this.initDirectionsService();
    }

    try {
      // Limitar a 25 waypoints por request (límite de Google)
      const waypointsLimitados = waypoints.slice(0, 25);

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


  private procesarResultado(result: any): Route {
    const route = result.routes[0];

    let totalDistance = 0;
    let totalDuration = 0;
    const steps: Step[] = [];

    route.legs.forEach((leg: any) => {
      totalDistance += leg.distance.value;
      totalDuration += leg.duration.value;

      leg.steps.forEach((step: any) => {
        steps.push({
          instructions: this.limpiarInstrucciones(step.instructions),
          distance: step.distance.value,
          duration: step.duration.value,
          startLocation: {
            lat: step.start_location.lat(),
            lng: step.start_location.lng()
          },
          endLocation: {
            lat: step.end_location.lat(),
            lng: step.end_location.lng()
          },
          maneuver: step.maneuver,
          polyline: step.polyline.points
        });
      });
    });

    return {
      steps,
      totalDistance,
      totalDuration,
      polyline: route.overview_polyline,
      bounds: route.bounds
    };
  }


  private limpiarInstrucciones(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
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
}