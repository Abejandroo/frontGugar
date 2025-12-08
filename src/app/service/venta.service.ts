import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  
  private url = 'https://backgugar-production.up.railway.app';

  constructor(private http: HttpClient) {}

  registrarVenta(venta: any): Observable<any> {
    return this.http.post(`${this.url}/ventas`, venta);
  }

  obtenerVentasPorDiaRuta(diaRutaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ventas/dia-ruta/${diaRutaId}`);
  }

  actualizarVenta(ventaId: number, datos: any): Observable<any> {
    return this.http.patch(`${this.url}/ventas/${ventaId}`, datos);
  }

  eliminarVenta(ventaId: number): Observable<any> {
    return this.http.delete(`${this.url}/ventas/${ventaId}`);
  }

  obtenerVentasPorFecha(fecha: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ventas/fecha/${fecha}`);
  }

  calcularTotalDelDia(fecha: string): Observable<any> {
    return this.http.get(`${this.url}/ventas/total/dia?fecha=${fecha}`);
  }
}