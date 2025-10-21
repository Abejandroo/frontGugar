import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCard, IonCol, IonCardHeader, IonCardContent, IonCardTitle} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { menu } from 'ionicons/icons';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [ IonCardTitle, IonCardContent, IonCardHeader, IonCol, IonCard, IonRow, IonGrid, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule]
})
export class AdminPage {
  constructor(private readonly router: Router,
  //private readonly authService: AuthService,
  //private readonly menu: MenuController,

  ) { 
   addIcons({
  menu,
});
  }
  logout() {
  //  this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
  toggleMenu() {
   // this.menu.toggle();
  }

  irATutores() {
    this.router.navigate(['/tutores/formulario']);
  }

  irAAlumnos() {
    this.router.navigate(['/alumnos/formulario']);
  }

  irAGrupos() {
    this.router.navigate(['/grupos']);
  }

  irAMaestros() {
    this.router.navigate(['/maestros/registro']);
  }

}