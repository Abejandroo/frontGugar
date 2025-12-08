import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, trendingUpOutline, timeOutline, mapOutline, peopleOutline } from 'ionicons/icons';
import { DividirRutaResponse, SubRutaResult } from '../../models/clientes-agrupados.interface';
import { RutaService } from 'src/app/service/ruta.service';
import { Auth } from 'src/app/service/auth';
import { FormsModule } from '@angular/forms';

addIcons({ close, trendingUpOutline, timeOutline, mapOutline, peopleOutline });

@Component({
  selector: 'app-resultado-division-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  template: `
    <ion-header>
      <ion-toolbar color="success">
        <ion-title>Resultado de la División</ion-title>
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
            <ion-card-subtitle>
              Día: {{ resultado.rutaOriginal.diaSemana }} | Total Clientes: {{ resultado.rutaOriginal.totalClientes }}
            </ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>{{ resultado.mensaje }}</p>
            <ion-chip color="warning">
              <ion-icon name="information-circle"></ion-icon>
              <ion-label>Ruta original se marcará como "Dividida"</ion-label>
            </ion-chip>
          </ion-card-content>
        </ion-card>
        
        <div class="subrutas-grid">
          <ion-card class="subruta-card grupo-a-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="people-outline"></ion-icon> {{ resultado.subRutaA.nombre }}
              </ion-card-title>
              <ion-card-subtitle>{{ resultado.subRutaA.totalClientes }} Clientes</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-item lines="none">
            <ion-label position="stacked">Asignar Repartidor (A)</ion-label>
            <ion-select 
                placeholder="Ninguno"
                [(ngModel)]="idRepartidorASeleccionado"
            >
                <ion-select-option [value]="null">Sin asignar</ion-select-option>
                <ion-select-option *ngFor="let rep of repartidores" [value]="rep.id">
                    {{ rep.nombre }}
                </ion-select-option>
            </ion-select>
        </ion-item>
              <div class="metric-item">
                <ion-icon name="map-outline"></ion-icon>
                <span>Distancia: <strong>{{ resultado.subRutaA.distanciaKm }} km</strong></span>
              </div>
              <div class="metric-item">
                <ion-icon name="time-outline"></ion-icon>
                <span>Tiempo Est.: <strong>{{ resultado.subRutaA.tiempoMinutos }} min</strong></span>
              </div>
              <ion-button expand="block" fill="clear" (click)="mostrarDetalle(resultado.subRutaA, 'Sub-Ruta A')">
                Ver Clientes ({{resultado.subRutaA.totalClientes}})
              </ion-button>
            </ion-card-content>
          </ion-card>

          <ion-card class="subruta-card grupo-b-card">
            <ion-card-header>
              <ion-card-title>
                <ion-icon name="people-outline"></ion-icon> {{ resultado.subRutaB.nombre }}
              </ion-card-title>
              <ion-card-subtitle>{{ resultado.subRutaB.totalClientes }} Clientes</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-item lines="none">
            <ion-label position="stacked">Asignar Repartidor (B)</ion-label>
            <ion-select 
                placeholder="Ninguno"
                [(ngModel)]="idRepartidorBSeleccionado"
            >
                <ion-select-option [value]="null">Sin asignar</ion-select-option>
                <ion-select-option *ngFor="let rep of repartidores" [value]="rep.id">
                    {{ rep.nombre }}
                </ion-select-option>
            </ion-select>
        </ion-item>
              <div class="metric-item">
                <ion-icon name="map-outline"></ion-icon>
                <span>Distancia: <strong>{{ resultado.subRutaB.distanciaKm }} km</strong></span>
              </div>
              <div class="metric-item">
                <ion-icon name="time-outline"></ion-icon>
                <span>Tiempo Est.: <strong>{{ resultado.subRutaB.tiempoMinutos }} min</strong></span>
              </div>
              <ion-button expand="block" fill="clear" (click)="mostrarDetalle(resultado.subRutaB, 'Sub-Ruta B')">
                Ver Clientes ({{resultado.subRutaB.totalClientes}})
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <ion-button 
          expand="block" 
          color="success" 
          (click)="aceptarYGuardar()" 
          class="btn-aceptar"
        >
          <ion-icon name="checkmark-circle" slot="start"></ion-icon>
          Confirmar y Guardar Sub-Rutas
        </ion-button>

        <ion-button 
          expand="block" 
          color="medium" 
          fill="outline"
          (click)="cerrar()" 
          class="btn-cancelar"
        >
          Cancelar
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

      ion-chip {
        margin: 10px auto 0;
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
    }
    
    .btn-aceptar, .btn-cancelar {
      height: 50px;
      font-weight: 600;
      --border-radius: 12px;
      margin-bottom: 10px;
    }
  `]
})
export class ResultadoDivisionModalComponent implements OnInit {
  @Input() resultado!: DividirRutaResponse;
  @Input() datosOriginales!: any;

  repartidores: any[] = [];
  idRepartidorASeleccionado: number | null = null;
  idRepartidorBSeleccionado: number | null = null;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private rutaService: RutaService,
    private authService: Auth,

  ) { }

  ngOnInit() {

    this.authService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.repartidores = usuarios.filter(u => u.role === 'repartidor');
      }
    });
  }
  async mostrarDetalle(subRuta: SubRutaResult, titulo: string) {
    const listaClientes = subRuta.clientes
      .map((c, i) => `${i + 1}. ${c.nombre}<br><small>${c.direccion}</small>`)
      .join('<br><br>');

    const alert = await this.alertController.create({
      header: titulo,
      message: `
        <div style="text-align: left;">
          <strong>Total: ${subRuta.totalClientes} clientes</strong><br>
          <strong>Distancia: ${subRuta.distanciaKm} km</strong><br>
          <strong>Tiempo: ${subRuta.tiempoMinutos} min</strong><br><br>
          ${listaClientes}
        </div>
      `,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  async aceptarYGuardar() {
    if (this.idRepartidorASeleccionado === null || this.idRepartidorBSeleccionado === null) {
      const alert = await this.alertController.create({
        header: 'Asignación Requerida',
        message: 'Debes asignar un repartidor a la Sub-Ruta A y a la Sub-Ruta B antes de guardar.',
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando sub-rutas...',
    });
    await loading.present();

    const datosFinales = {
      ...this.datosOriginales,
      idRepartidorA: this.idRepartidorASeleccionado,
      idRepartidorB: this.idRepartidorBSeleccionado,
    };

    this.rutaService.confirmarDivisionRuta(datosFinales).subscribe({
      next: async (resultado) => {
        await loading.dismiss();

        const alert = await this.alertController.create({
          header: 'Sub-Rutas Guardadas',
          message: `
                    <strong>Las sub-rutas han sido creadas exitosamente:</strong><br><br>
                    📍 ${resultado.subRutaA.nombre} (${resultado.subRutaA.totalClientes} clientes)<br>
                    📍 ${resultado.subRutaB.nombre} (${resultado.subRutaB.totalClientes} clientes)<br><br>
                    La ruta original "${resultado.rutaOriginal.diaSemana}" ha sido marcada como "Dividida" y sus clientes fueron reasignados.<br><br>
                    <strong>Ahora puedes asignar estas sub-rutas a diferentes repartidores.</strong>
                `,
          buttons: [
            {
              text: 'Entendido',
              handler: () => {
                this.modalController.dismiss({
                  recargar: true,
                  cerrarTodos: true,
                  subRutaAId: resultado.subRutaA.id,
                  subRutaBId: resultado.subRutaB.id,
                });
              }
            }
          ]
        });

        await alert.present();
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error confirmando división:', err);

        const alert = await this.alertController.create({
          header: 'Error',
          message: err.error?.message || 'Ocurrió un error al guardar las sub-rutas',
          buttons: ['OK']
        });

        await alert.present();
      }
    });
  }

  cerrar() {
    this.modalController.dismiss({ recargar: false });
  }
}