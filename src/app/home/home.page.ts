import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonContent, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonIcon, IonCol, IonRow, IonGrid, IonHeader, IonToolbar, IonContent,RouterModule],
})
export class HomePage {
  constructor() {}
}
