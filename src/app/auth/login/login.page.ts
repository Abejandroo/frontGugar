import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonItem, IonLabel, IonButton, IonIcon, IonInput, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, lockOpenOutline, eyeOutline, eyeOffOutline, lockClosedOutline, arrowForwardOutline } from 'ionicons/icons';
import { Auth } from 'src/app/service/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonInput, IonIcon, IonButton,  IonItem, IonBackButton, IonButtons, IonContent, CommonModule, FormsModule]
})
export class LoginPage {
  correo: string = '';
  contrasena: string = '';
  rolSeleccionado: string = '';
  mostrarContrasena: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: Auth, 
    private readonly toastController: ToastController
  ) {
    this.route.queryParams.subscribe(params => {
      this.rolSeleccionado = params['rol'];
    });
    addIcons({personOutline,lockClosedOutline,arrowForwardOutline,'lockOpenOutline':lockOpenOutline,eyeOutline,'eyeOffOutline':eyeOffOutline});
  }

  async onSubmit() {
    if (!this.correo || !this.contrasena) {
      this.mostrarToast('Por favor completa todos los campos', 'warning');
      return;
    }
    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (res: any) => {
        const usuarioBD = res.user;
        if (usuarioBD.role === this.rolSeleccionado) {
          
          this.mostrarToast(`Bienvenido, ${usuarioBD.name}`, 'success');
          if (this.rolSeleccionado === 'admin') {
            this.router.navigate(['/usuario/admin']);
          } else if (this.rolSeleccionado === 'supervisor') {
            this.router.navigate(['/supervisores/home']);
          } else if (this.rolSeleccionado === 'repartidor') {
            this.router.navigate(['/repartidor/rutas']);
          }

        } else {
          this.mostrarToast('No tienes permisos para acceder en esta sección', 'danger');
          this.authService.logout();
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Correo o contraseña incorrectos', 'danger');
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }
}