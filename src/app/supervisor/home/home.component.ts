import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonLabel, IonItem } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
   today: Date = new Date();

  // Datos de ejemplo; sustitúyelos por los reales desde tu servicio
  activeRoutes = 23;
  totalRoutes = 50;
  pendingRoutes = 5;


  constructor(
 private router: Router ) { }
  goToRepartidores() {
    // Redirige al Home
    this.router.navigate(['/repartidores']);

  }

}
