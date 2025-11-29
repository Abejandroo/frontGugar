import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Cliente {
    private apiUrl = 'http://localhost:3000'; 
      constructor(private http: HttpClient) { }


  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes/all`);
  }

  obtenerCliente(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clientes/${id}`);
  }

  crearCliente(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clientes`, data);
  }

  actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clientes/${id}`, data);
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clientes/${id}`);
  }

  verPedidosCliente(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes/${id}/pedidos`);
  }
}
