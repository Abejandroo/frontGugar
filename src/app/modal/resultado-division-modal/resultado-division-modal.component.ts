// resultado-division-modal.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {close, trendingUpOutline, timeOutline, mapOutline, peopleOutline } from 'ionicons/icons';
// Importa la interfaz que definiste (si la creaste)
import { DividirRutaResponse, SubRutaResult } from '../../models/clientes-agrupados.interface'; 

addIcons({ close, trendingUpOutline, timeOutline, mapOutline, peopleOutline });

@Component({
  selector: 'app-resultado-division-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  template: `
    <ion-header>
      <ion-toolbar color="success">
        <ion-title>✅ Resultado de la División</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="resultado-container">
        <ion-card class="resumen-card">
          <ion-card-header>
            <ion-card-title>{{ resultado.rutaOriginal.nombre }}</ion-card-title>
            <ion-card-subtitle>Día: {{ resultado.rutaOriginal.diaSemana }} | Total Clientes: {{ resultado.rutaOriginal.totalClientes }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>{{ resultado.mensaje }}</p>
          </ion-card-content>
        </ion-card>
        
        <div class="subrutas-grid">
          <ion-card class="subruta-card" [ngClass]="{'grupo-a-card': true}">
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="people-outline"></ion-icon> Sub-Ruta A
              </ion-card-title>
              <ion-card-subtitle>{{ resultado.subRutaA.totalClientes }} Clientes</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="metric-item">
                <ion-icon name="map-outline"></ion-icon>
                <span>Distancia: <strong>{{ resultado.subRutaA.distanciaKm }} km</strong></span>
              </div>
              <div class="metric-item">
                <ion-icon name="time-outline"></ion-icon>
                <span>Tiempo Est.: <strong>{{ resultado.subRutaA.tiempoMinutos }} min</strong></span>
              </div>
              <ion-button expand="block" fill="clear" (click)="mostrarDetalle(resultado.subRutaA, 'Sub-Ruta A')">Ver Clientes ({{resultado.subRutaA.totalClientes}})</ion-button>
            </ion-card-content>
          </ion-card>

          <ion-card class="subruta-card" [ngClass]="{'grupo-b-card': true}">
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="people-outline"></ion-icon> Sub-Ruta B
              </ion-card-title>
              <ion-card-subtitle>{{ resultado.subRutaB.totalClientes }} Clientes</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="metric-item">
                <ion-icon name="map-outline"></ion-icon>
                <span>Distancia: <strong>{{ resultado.subRutaB.distanciaKm }} km</strong></span>
              </div>
              <div class="metric-item">
                <ion-icon name="time-outline"></ion-icon>
                <span>Tiempo Est.: <strong>{{ resultado.subRutaB.tiempoMinutos }} min</strong></span>
              </div>
              <ion-button expand="block" fill="clear" (click)="mostrarDetalle(resultado.subRutaB, 'Sub-Ruta B')">Ver Clientes ({{resultado.subRutaB.totalClientes}})</ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <ion-button expand="block" color="success" (click)="cerrar()" class="btn-cerrar">
          Aceptar
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f4f6fa;
    }

    .resultado-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .resumen-card {
      margin-bottom: 20px;
      text-align: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      
      ion-card-title {
        color: var(--ion-color-primary, #0099ff);
      }
    }
    
    .subrutas-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 20px;
      
      @media (min-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .subruta-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      
      ion-card-header {
        text-align: center;
        padding-bottom: 0;
      }
      
      ion-card-title {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 5px;
        
        ion-icon {
          font-size: 24px;
          margin-right: 8px;
        }
      }
      
      &.grupo-a-card {
        border-top: 4px solid var(--ion-color-primary, #0099ff);
        ion-card-title { color: var(--ion-color-primary, #0099ff); }
      }
      
      &.grupo-b-card {
        border-top: 4px solid var(--ion-color-warning, #ff9500);
        ion-card-title { color: var(--ion-color-warning, #ff9500); }
      }
      
      .metric-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        font-size: 15px;
        
        ion-icon {
          min-width: 24px;
          margin-right: 10px;
          color: var(--ion-color-medium);
        }
        
        strong {
          font-weight: 700;
          color: #1c1c1e;
        }
      }
      
      ion-button {
        margin-top: 10px;
        font-weight: 600;
      }
    }
    
    .btn-cerrar {
      height: 50px;
      font-weight: 600;
      --border-radius: 12px;
    }
  `]
})
export class ResultadoDivisionModalComponent {
  // Usar la interfaz si la definiste, si no, usa 'any'
  @Input() resultado!: DividirRutaResponse; 

  constructor(private modalController: ModalController, private alertController: AlertController) {}

  async mostrarDetalle(subRuta: SubRutaResult, nombre: string) {
    const clientesList = subRuta.clientes.map(c => 
      `<p><strong>${c.nombre}</strong><br>${c.direccion}</p>`
    ).join('');

    const alert = await this.alertController.create({
      header: nombre,
      subHeader: `${subRuta.totalClientes} Clientes`,
      message: `<div style="max-height: 300px; overflow-y: scroll; text-align: left;">${clientesList}</div>`,
      buttons: ['Cerrar'],
    });

    await alert.present();
  }

  cerrar() {
    this.modalController.dismiss();
  }
}