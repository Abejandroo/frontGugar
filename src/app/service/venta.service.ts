import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  
  private url = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  registrarVenta(venta: any): Observable<any> {
    return this.http.post(`${this.url}/ventas`, venta);
  }

  obtenerVentasPorDiaRuta(diaRutaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/ventas/dia-ruta/${diaRutaId}`);
  }

  actualizarVenta(ventaId: number, datos: any): Observable<any> {
    return this.http.put(`${this.url}/ventas/${ventaId}`, datos);
  }

  eliminarVenta(ventaId: number): Observable<any> {
    return this.http.delete(`${this.url}/ventas/${ventaId}`);
  }
}