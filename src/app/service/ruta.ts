import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RutaService {

  private apiUrl = 'http://localhost:3000/rutas';

  constructor(private http: HttpClient) { }

  obtenerRutaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

}