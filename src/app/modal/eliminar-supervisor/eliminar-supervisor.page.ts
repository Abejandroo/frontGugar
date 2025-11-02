import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-eliminar-supervisor',
  templateUrl: './eliminar-supervisor.page.html',
  styleUrls: ['./eliminar-supervisor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EliminarSupervisorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
