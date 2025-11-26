import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrecioService {

  // Ajusta tu URL base si es necesario (ej: http://localhost:3000)
  private apiUrl = 'http://localhost:3000/precios'; 

  constructor(private http: HttpClient) { }

  // 1. Obtener todos (Get /precios/all)
  obtenerPrecios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/all`);
  }

  // 2. Obtener uno (Get /precios/:id)
  obtenerPrecio(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 3. Crear (Post /precios)
  crearPrecio(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  // 4. Actualizar (Patch /precios/:id)
  actualizarPrecio(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  // 5. Eliminar (Delete /precios/:id)
  eliminarPrecio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}