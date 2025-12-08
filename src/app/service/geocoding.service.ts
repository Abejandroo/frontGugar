import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  private geocoder: google.maps.Geocoder;

  constructor() {
    this.geocoder = new google.maps.Geocoder();
  }


  async geocodificarDireccion(
    direccion: string,
    colonia: string,
    ciudad: string = 'Oaxaca'
  ): Promise<{ lat: number; lng: number } | null> {

    const addressComplete = `${direccion}, ${colonia}, ${ciudad}, México`;

    try {
      const result = await this.geocoder.geocode({
        address: addressComplete,
        region: 'MX'
      });

      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;

        return {
          lat: location.lat(),
          lng: location.lng()
        };
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
      index: number;
    }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<Map<number, { lat: number; lng: number }>> {

    const resultados = new Map<number, { lat: number; lng: number }>();
    const total = direcciones.length;

    for (let i = 0; i < direcciones.length; i++) {
      const item = direcciones[i];

      if (onProgress) {
        onProgress(i + 1, total);
      }

      const coords = await this.geocodificarDireccion(
        item.direccion,
        item.colonia,
        item.ciudad
      );

      if (coords) {
        resultados.set(item.index, coords);
      }

      if (i < direcciones.length - 1) {
        await this.delay(100);
      }
    }

    return resultados;
  }


  generarCoordenadasSimuladas(): { lat: number; lng: number } {
    const baseLatitud = 17.0732;
    const baseLongitud = -96.7266;

    const offsetLat = (Math.random() - 0.5) * 0.05;
    const offsetLng = (Math.random() - 0.5) * 0.05;

    return {
      lat: baseLatitud + offsetLat,
      lng: baseLongitud + offsetLng
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}