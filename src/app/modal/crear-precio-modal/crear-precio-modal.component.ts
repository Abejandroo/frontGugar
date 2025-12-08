import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ImportService } from '../../service/import';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-crear-precio-modal',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>💰 Crear Nuevo Precio</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p>Este precio será usado por <strong>{{ cantidad }}</strong> cliente(s)</p>

      <ion-item>
        <ion-label position="stacked">Precio por garrafón</ion-label>
        <ion-input 
          type="number" 
          [(ngModel)]="precio" 
          readonly>
        </ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Tipo de precio</ion-label>
        <ion-input 
          type="text" 
          [(ngModel)]="tipoCompra" 
          placeholder="Ej: Contado">
        </ion-input>
      </ion-item>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-button expand="block" (click)="crear()" [disabled]="loading">
          @if(loading){
            <ion-spinner></ion-spinner>
          }
          @if(!loading){
            <ion-icon name="checkmark" slot="start"></ion-icon>
          }
          {{ loading ? 'Creando...' : 'Crear Precio' }}
        </ion-button>
      </ion-toolbar>
    </ion-footer>
  `,
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule, FormsModule],
  providers: [...IonicControllers]
})
export class CrearPrecioModalComponent {
  @Input() precio: number = 0;
  @Input() cantidad: number = 0;

  tipoCompra: string = 'Contado';
  loading: boolean = false;

  constructor(
    private modalController: ModalController,
    private importService: ImportService
  ) { }

  async crear() {
    if (!this.tipoCompra.trim()) {
      alert('Ingresa el tipo de compra');
      return;
    }

    this.loading = true;

    try {
      await this.importService.crearPrecio(this.precio, this.tipoCompra).toPromise();
      this.modalController.dismiss({ creado: true });
    } catch (error) {
      console.error('Error creando precio:', error);
      alert('Error al crear el precio');
      this.loading = false;
    }
  }

  cerrar() {
    this.modalController.dismiss({ creado: false });
  }
}