import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  // Asegúrate que esta sea tu IP correcta (localhost o IP de red)
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) { }

  login(correo: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      email: correo,
      password: contrasena
    }).pipe(
      tap((res: any) => {
        if (res.user) {
          localStorage.setItem('usuario', JSON.stringify(res.user));
          localStorage.setItem('token', 'sesion-activa'); 
        }
      })
    );
  }
  registrar(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, data);
  }

  logout() {
    localStorage.clear();
  }
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios`);
  }
  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/usuarios/${id}`, data);
  }
   eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuarios/${id}`);
  }
}