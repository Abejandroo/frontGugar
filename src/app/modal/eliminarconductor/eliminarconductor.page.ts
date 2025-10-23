import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-eliminarconductor',
  templateUrl: './eliminarconductor.page.html',
  styleUrls: ['./eliminarconductor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EliminarconductorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
