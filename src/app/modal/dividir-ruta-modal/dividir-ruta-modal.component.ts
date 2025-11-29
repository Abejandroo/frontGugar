import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-dividir-ruta-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="warning">
        <ion-title>✂️ Dividir Ruta</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="info-section">
        <h3>{{ diaSemana }}</h3>
        <p>Total de clientes: <strong>{{ totalClientes }}</strong></p>
        <p class="descripcion">
          Divide la ruta en 2 sub-rutas. Ingresa el número del cliente donde deseas hacer el corte.
        </p>
      </div>

      <div class="input-section">
        <ion-item>
          <ion-label position="floating">Punto de corte (cliente #)</ion-label>
          <ion-input
            type="number"
            [(ngModel)]="puntoCorte"
            [min]="1"
            [max]="totalClientes - 1"
            placeholder="Ej: {{ puntoCorteDefault }}">
          </ion-input>
        </ion-item>
        
        <div class="preview">
          <div class="grupo">
            <ion-icon name="people-outline" color="primary"></ion-icon>
            <div>
              <strong>Grupo A</strong>
              <p>{{ puntoCorte || puntoCorteDefault }} clientes</p>
            </div>
          </div>
          
          <ion-icon name="cut-outline" color="warning"></ion-icon>
          
          <div class="grupo">
            <ion-icon name="people-outline" color="tertiary"></ion-icon>
            <div>
              <strong>Grupo B</strong>
              <p>{{ totalClientes - (puntoCorte || puntoCorteDefault) }} clientes</p>
            </div>
          </div>
        </div>
      </div>

      <ion-button 
        expand="block" 
        color="warning" 
        (click)="calcular()"
        [disabled]="!esValido()">
        Calcular Rutas Optimizadas
      </ion-button>
      
      <ion-button 
        expand="block" 
        fill="clear" 
        color="medium" 
        (click)="cerrar()">
        Cancelar
      </ion-button>
    </ion-content>
  `,
  styles: [`
    .info-section {
      text-align: center;
      margin-bottom: 24px;
      
      h3 {
        color: var(--ion-color-primary);
        margin: 0 0 8px 0;
      }
      
      p {
        margin: 4px 0;
        color: #666;
      }
      
      .descripcion {
        font-size: 14px;
        margin-top: 12px;
      }
    }
    
    .input-section {
      margin: 24px 0;
      
      ion-item {
        --background: #f5f5f5;
        --border-radius: 8px;
        margin-bottom: 16px;
      }
    }
    
    .preview {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 12px;
      margin-top: 16px;
      
      .grupo {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        
        ion-icon {
          font-size: 32px;
        }
        
        strong {
          display: block;
          margin-bottom: 4px;
        }
        
        p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
      }
      
      > ion-icon {
        font-size: 24px;
        margin: 0 8px;
      }
    }
  `]
})
export class DividirRutaModalComponent {
  @Input() totalClientes!: number;
  @Input() puntoCorteDefault!: number;
  @Input() diaSemana!: string;

  puntoCorte: number = 0;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.puntoCorte = this.puntoCorteDefault;
  }

  esValido(): boolean {
    return this.puntoCorte > 0 && this.puntoCorte < this.totalClientes;
  }

  calcular() {
    if (this.esValido()) {
      this.modalController.dismiss({
        confirmar: true,
        puntoCorte: this.puntoCorte
      });
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }
}