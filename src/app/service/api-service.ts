import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly backendUrl = 'https://backescolar-production.up.railway.app';

  constructor(private readonly http: HttpClient) { }
login(correo: string, contrasena: string) {
  return this.http.post(this.backendUrl + '/administradores/login/admin', { correo, contrasena });
}

loginTutor(correo: string, contrasena: string) {
  return this.http.post(this.backendUrl + '/tutores/login/tutor', { correo, contrasena });
}

loginMaestro(correo: string, contrasena: string) {
  return this.http.post(this.backendUrl + '/maestros/login/maestro', { correo, contrasena });
}
getPerfilMaestroPorCorreo(correo: string) {
  return this.http.get<any>(`${this.backendUrl}/maestros/perfil/${correo}`);
}

getPerfilTutorPorCorreo(correo: string) {
  return this.http.get<any>(`${this.backendUrl}/tutores/perfil/${correo}`);
}

getAlumnosPorGrupo(idGrupo: number) {
  return this.http.get<any[]>(`${this.backendUrl}/alumnos/grupo/${idGrupo}`);
}
getHijosByTutorId(tutorId: number) {
  return this.http.get<any[]>(`https://backescolar-production.up.railway.app/alumnos/tutor/${tutorId}`);
}


}