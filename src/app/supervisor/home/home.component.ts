import { Component, OnInit } from '@angular/core';
import { IonLabel, IonItem } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {
   today: Date = new Date();

  // Datos de ejemplo; sustitúyelos por los reales desde tu servicio
  activeRoutes = 23;
  totalRoutes = 50;
  pendingRoutes = 5;


  constructor() { }

  ngOnInit() {}

}
