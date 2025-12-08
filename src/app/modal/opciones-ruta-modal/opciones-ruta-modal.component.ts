import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

@Component({
  selector: 'app-opciones-ruta-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ ruta?.nombre }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item button (click)="seleccionar('ver')">
          <ion-icon name="eye-outline" slot="start" color="primary"></ion-icon>
          <ion-label>Ver Detalle</ion-label>
        </ion-item>

        <ion-item button (click)="seleccionar('eliminar')" lines="none">
          <ion-icon name="trash-outline" slot="start" color="danger"></ion-icon>
          <ion-label color="danger">Eliminar Ruta</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-item {
      --min-height: 56px;
    }
  `],
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule]
})
export class OpcionesRutaModalComponent {
  @Input() ruta: any;

  constructor(private modalController: ModalController) { }

  seleccionar(accion: string) {
    this.modalController.dismiss({ accion });
  }

  cerrar() {
    this.modalController.dismiss();
  }
}