import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrecioService {
  private apiUrl = 'https://backgugar-production.up.railway.app/precios'; 

  constructor(private http: HttpClient) { }

  obtenerPrecios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  obtenerPrecio(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearPrecio(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  actualizarPrecio(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  eliminarPrecio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}