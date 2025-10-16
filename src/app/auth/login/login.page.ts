import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonCardSubtitle, IonButtons, IonBackButton, IonItem, IonLabel, IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, lockOpenOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonInput, IonIcon, IonButton, IonLabel, IonItem, IonBackButton, IonButtons, IonCol, IonRow, IonGrid, IonContent, IonHeader,IonToolbar, CommonModule, FormsModule]
})
export class LoginPage {
  correo: string = '';
  contrasena: string = '';
  rol: string = '';
  email: string = ''; 
  mostrarContrasena: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
 //   private readonly apiService: ApiService
  ) {
    this.route.queryParams.subscribe(params => {
      this.rol = params['rol'];
    });
    addIcons({
      personOutline,
      'lock-open-outline': lockOpenOutline,
      eyeOutline,
      'eye-off-outline': eyeOffOutline
    });
  }
onSubmit() {
  if (!this.correo || !this.contrasena) {
    alert('Por favor completa todos los campos');
    return;
  }

  let loginObservable;

 if (this.rol === 'admin') {
//  loginObservable = this.apiService.loginAdmin(this.correo, this.contrasena);
} else if (this.rol === 'supervisor') {
  //loginObservable = this.apiService.loginSupervisor(this.correo, this.contrasena);
} else if (this.rol === 'repartidor') {
 // loginObservable = this.apiService.loginRepartidor(this.correo, this.contrasena);
} else {
  alert('Rol desconocido');
  return;
}


 /* loginObservable.subscribe({
    next: (res: any) => {
      let usuario;

      if (this.rol === 'admin') {
        usuario = {
          correo: res.admin.correo,
          nombre: res.admin.nombre,
          rol: this.rol
        };
        this.router.navigate(['/admin']);
      } else if (this.rol === 'maestro') {
        usuario = {
          correo: res.maestro.correo,
          nombre: res.maestro.nombre,
          rol: this.rol
        };
        this.router.navigate(['/dashboard']);
      } else if (this.rol === 'tutor') {
        
        usuario = {
          correo: res.tutor.correo,
          nombre: res.tutor.nombre,
          rol: this.rol,
          id: res.tutor.id
        };
        this.router.navigate(['/padres-home']);
        console.log('redirigido a tutores');
        
      }

      localStorage.setItem('usuario', JSON.stringify(usuario));
    },
    error: (err) => {
      alert('Correo o contraseña incorrectos');
      console.error(err);
    }
  });
}*/
}
}