import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Cliente {
    private apiUrl = 'http://localhost:3000'; 
      constructor(private http: HttpClient) { }


  // 1. Obtener todos los clientes
  obtenerClientes(): Observable<any[]> {
    // Fíjate que en tu controller es 'clientes/all'
    return this.http.get<any[]>(`${this.apiUrl}/clientes/all`);
  }

  // 2. Obtener un cliente específico (para editar)
  obtenerCliente(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clientes/${id}`);
  }

  // 3. Crear (POST)
  crearCliente(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, data);
  }

  // 4. Actualizar (PATCH)
  actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clientes/${id}`, data);
  }

  // 5. Eliminar (DELETE)
  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }

  // 6. Ver pedidos de un cliente (Extra que vi en tu controller)
  verPedidosCliente(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes/${id}/pedidos`);
  }
}
