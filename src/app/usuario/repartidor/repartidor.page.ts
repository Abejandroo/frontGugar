import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { menu } from 'ionicons/icons';

@Component({
  selector: 'app-repartidor',
  templateUrl: './repartidor.page.html',
  styleUrls: ['./repartidor.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonCol, IonRow, IonGrid, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class RepartidorPage {
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
