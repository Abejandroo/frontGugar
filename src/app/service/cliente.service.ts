import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  
  private url = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  obtenerClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/clientes/all`);
  }

  obtenerClientePorId(id: number): Observable<any> {
    return this.http.get(`${this.url}/clientes/${id}`);
  }
actualizarCliente(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.url}/clientes/${id}`, data);
  }

  actualizarClientePorId(id: number, datos: any): Observable<any> {
    return this.http.patch(`${this.url}/clientes/${id}`, datos);
  }

  crearCliente(cliente: any): Observable<any> {
    return this.http.post(`${this.url}/clientes`, cliente);
  }

  eliminarCliente(id: number): Observable<any> {
    return this.http.delete(`${this.url}/clientes/${id}`);
  }

  verPedidosCliente(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/clientes/${id}/pedidos`);
  }
}
