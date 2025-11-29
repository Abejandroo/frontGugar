import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RutaServiceTs {
  private url = 'http://localhost:3000';
  
  constructor(private http: HttpClient) { }

  obtenerRutasPorEstado(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/rutas/dias-ruta/estado/${estado}`);
  }

  obtenerTodasLasRutas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/rutas`);
  }

  asignarPersonalARuta(rutaId: number, supervisorId?: number, repartidorId?: number): Observable<any> {
    return this.http.patch(`${this.url}/rutas/${rutaId}/asignar-personal`, {
      supervisorId,
      repartidorId
    });
  }

  cambiarEstadoDiaRuta(diaRutaId: number, estado: string): Observable<any> {
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/estado`, {
      estado
    });
  }

  // ✅ CORREGIDO: POST → PATCH
  iniciarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/iniciar`, {});
  }

  // ✅ CORREGIDO: POST → PATCH
  finalizarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/finalizar`, {});
  }

  // ✅ CORREGIDO: POST → PATCH
  pausarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/pausar`, {});
  }

  eliminarRuta(rutaId: number): Observable<any> {
    return this.http.delete(`${this.url}/rutas/${rutaId}`);
  }

  obtenerRutaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/rutas/${id}`);
  }

  actualizarRuta(id: number, data: any): Observable<any> {
    return this.http.put(`${this.url}/rutas/${id}`, data);
  }

  eliminarClienteDeRuta(diaRutaId: number, clienteId: number): Observable<any> {
    return this.http.delete(`${this.url}/rutas/dia-ruta/${diaRutaId}/cliente/${clienteId}`);
  }

  agregarDiaARuta(data: {
    rutaId: number;
    diaSemana: string;
    clientesIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/agregar-dia`, data);
  }

  crearRutaConDia(data: {
    nombre: string;
    supervisorId: number | null;
    repartidorId: number | null;
    diaSemana: string;
    clientesIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/crear-con-dia`, data);
  }

  obtenerClientesDisponibles(diaRutaId?: number): Observable<any[]> {
    const url = diaRutaId 
      ? `${this.url}/rutas/clientes-disponibles/${diaRutaId}`
      : `${this.url}/rutas/clientes-disponibles`;
    
    return this.http.get<any[]>(url);
  }

  obtenerRutasRepartidor(repartidorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/rutas/repartidor/${repartidorId}`);
  }

  marcarClienteVisitado(
    clienteRutaId: number, 
    visitado: boolean,
    garrafonesVendidos?: number
  ): Observable<any> {
    return this.http.patch(`${this.url}/rutas/cliente-ruta/${clienteRutaId}/visitado`, {
      visitado,
      garrafonesVendidos
    });
  }
}