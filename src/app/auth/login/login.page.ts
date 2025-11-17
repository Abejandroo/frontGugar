import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonGrid, IonRow, IonCol, IonButtons, IonBackButton, IonItem, IonLabel, IonButton, IonIcon, IonInput, ToastController } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, lockOpenOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Auth } from 'src/app/service/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonInput, IonIcon, IonButton, IonLabel, IonItem, IonBackButton, IonButtons, IonCol, IonRow, IonGrid, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule]
})
export class LoginPage {
  correo: string = '';
  contrasena: string = '';
  rolSeleccionado: string = ''; // El rol que viene del botón (query param)
  mostrarContrasena: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: Auth, // Inyectamos el servicio
    private readonly toastController: ToastController
  ) {
    this.route.queryParams.subscribe(params => {
      this.rolSeleccionado = params['rol'];
    });
    addIcons({ personOutline, 'lock-open-outline': lockOpenOutline, eyeOutline, 'eye-off-outline': eyeOffOutline });
  }

  async onSubmit() {
    if (!this.correo || !this.contrasena) {
      this.mostrarToast('Por favor completa todos los campos', 'warning');
      return;
    }

    // Llamamos al servicio único (ya no necesitamos if/else por rol aquí)
    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (res: any) => {
        const usuarioBD = res.user;
        
        // VALIDACIÓN DE SEGURIDAD 🛡️
        // Verificamos si el rol de la BD coincide con el botón que presionó
        // Nota: Asegúrate que en BD los roles sean 'admin', 'repartidor', etc. (o mapealos)
        if (usuarioBD.role === this.rolSeleccionado) {
          
          this.mostrarToast(`Bienvenido, ${usuarioBD.name}`, 'success');
          
          // Redirección según el rol
          if (this.rolSeleccionado === 'admin') {
            this.router.navigate(['/usuario/admin']);
          } else if (this.rolSeleccionado === 'supervisor') {
            this.router.navigate(['/supervisor']);
          } else if (this.rolSeleccionado === 'repartidor') {
            this.router.navigate(['/repartidor']);
          }

        } else {
          // Si intenta entrar como Admin siendo Repartidor
          this.mostrarToast('No tienes permisos para acceder en esta sección', 'danger');
          // Opcional: Limpiar storage si falló la validación de rol
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