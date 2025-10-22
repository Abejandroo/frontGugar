import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(private readonly router: Router,  private  readonly http: HttpClient) {}
  isAuthenticated(): boolean {
  const usuario = this.getUsuario();
  return !!usuario;
}
  getUsuario() {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/']);
  }

getAdminByCorreo(correo: string) {
  //return this.http.get(`https://backescolar-production.up.railway.app/administradores/perfil/${correo}`);
}
}