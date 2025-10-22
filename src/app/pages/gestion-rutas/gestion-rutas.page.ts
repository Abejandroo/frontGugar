import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestion-rutas',
  templateUrl: './gestion-rutas.page.html',
  styleUrls: ['./gestion-rutas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestionRutasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
