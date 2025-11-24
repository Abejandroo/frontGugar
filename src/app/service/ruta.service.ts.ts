import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';


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

  iniciarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.post(`${this.url}/rutas/dia-ruta/${diaRutaId}/iniciar`, {});
  }

  finalizarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.post(`${this.url}/rutas/dia-ruta/${diaRutaId}/finalizar`, {});
  }

  pausarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.post(`${this.url}/rutas/dia-ruta/${diaRutaId}/pausar`, {});
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
}
