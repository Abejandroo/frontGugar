import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-eliminar-cliente',
  templateUrl: './eliminar-cliente.page.html',
  styleUrls: ['./eliminar-cliente.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EliminarClientePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
