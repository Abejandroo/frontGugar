import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menu } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.page.html',
  styleUrls: ['./supervisor.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonCol, IonRow, IonGrid, IonIcon, IonButton, IonButtons, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule]
})
export class SupervisorPage  {
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
