import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RutaService {
  private url = 'http://localhost:3000';

  constructor(private http: HttpClient) { }


  // ========================================
  // ASIGNACIÓN Y DESASIGNACIÓN DE CLIENTES
  // ========================================

  /**
   * Asignar un cliente a una ruta (día específico)
   */
  asignarClienteARuta(data: {
    clienteId: number;
    diaRutaId: number;
    precioId: number;
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/asignar-cliente`, data);
  }

  /**
   * Desasignar un cliente de una ruta
   */
  desasignarClienteDeRuta(clienteId: number, diaRutaId: number): Observable<any> {
    return this.http.delete(`${this.url}/rutas/desasignar-cliente/${clienteId}/${diaRutaId}`);
  }


  // ========================================
  // OBTENER (GET)
  // ========================================

  obtenerTodasLasRutas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/rutas`);
  }

  obtenerRutaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/rutas/${id}`);
  }



  obtenerRutasRepartidor(repartidorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/rutas/repartidor/${repartidorId}`);
  }

  obtenerClientesDisponibles(diaRutaId?: number): Observable<any[]> {
    const url = diaRutaId
      ? `${this.url}/rutas/clientes-disponibles/${diaRutaId}`
      : `${this.url}/rutas/clientes-disponibles`;

    return this.http.get<any[]>(url);
  }

  // // Cambiamos la URL para apuntar al controlador de Clientes
  // obtenerClientesDisponibles(): Observable<any[]> {
  //   // Usamos el endpoint que ya probamos ayer
  //   return this.http.get<any[]>(`${this.url}/clientes/all`);
  // }

  // ========================================
  // CREAR (POST)
  // ========================================

  crearRutaConDia(data: {
    nombre: string;
    supervisorId: number | null;
    repartidorId: number | null;
    diaSemana: string;
    clientesIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/crear-con-dia`, data);
  }

  agregarDiaARuta(data: {
    rutaId: number;
    diaSemana: string;
    clientesIds: number[];
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/agregar-dia`, data);
  }

  // ========================================
  // ACTUALIZAR (PATCH)
  // ========================================

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
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/iniciar`, {});
  }

  finalizarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/finalizar`, {});
  }

  pausarDiaRuta(diaRutaId: number): Observable<any> {
    return this.http.patch(`${this.url}/rutas/dia-ruta/${diaRutaId}/pausar`, {});
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

  // ========================================
  // ACTUALIZAR (PUT) - Para actualizaciones completas
  // ========================================

  actualizarRuta(id: number, data: any): Observable<any> {
    return this.http.put(`${this.url}/rutas/${id}`, data);
  }

  // ========================================
  // ELIMINAR (DELETE)
  // ========================================

  eliminarRuta(rutaId: number): Observable<any> {
    return this.http.delete(`${this.url}/rutas/${rutaId}`);
  }

  eliminarClienteDeRuta(diaRutaId: number, clienteId: number): Observable<any> {
    return this.http.delete(`${this.url}/rutas/${diaRutaId}/clientes/${clienteId}`);
  }

  dividirRuta(datos: {
    rutaId: number;
    diaRutaId: number;
    puntoCorte: number;
    diaSemana: string;
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/dividir`, datos);
  }

  confirmarDivisionRuta(datos: {
    rutaId: number;
    diaRutaId: number;
    puntoCorte: number;
    diaSemana: string;
  }): Observable<any> {
    return this.http.post(`${this.url}/rutas/dividir/confirmar`, datos);
  }

  obtenerSubRutasDe(diaRutaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/rutas/dia-ruta/${diaRutaId}/sub-rutas`);
  }

}

