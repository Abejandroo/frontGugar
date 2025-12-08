import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import * as L from 'leaflet';
import { addIcons } from 'ionicons';
import {
  close, location, business, calendar, cash, document, trash,
  create, warning, card, documentText, person, listOutline
} from 'ionicons/icons';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-detalle-cliente-modal',
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule, FormsModule],
  providers: [...IonicControllers],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Detalle del Cliente</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrar()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- MAPA -->
      <div class="mapa-container">
        <div #miniMapa class="mini-mapa"></div>
        @if (!tieneUbicacion) {
          <div class="sin-ubicacion-overlay">
            <ion-icon name="warning"></ion-icon>
            <p>Sin ubicación GPS</p>
            <ion-button size="small" fill="outline" (click)="abrirEditorCompleto()">
              <ion-icon name="location" slot="start"></ion-icon>
              Agregar Ubicación
            </ion-button>
          </div>
        }
      </div>

      <!-- INFORMACIÓN DEL CLIENTE -->
      <div class="info-section">
        <!-- Nombre -->
        <div class="info-item">
          <ion-icon name="person" color="primary"></ion-icon>
          <div class="info-content">
            <label>Representante</label>
            <h3>{{ clienteRuta.cliente.representante || clienteRuta.cliente.nombre }}</h3>
          </div>
        </div>

        <!-- Negocio -->
        @if (clienteRuta.cliente.negocio) {
          <div class="info-item">
            <ion-icon name="business" color="primary"></ion-icon>
            <div class="info-content">
              <label>Negocio</label>
              <p>{{ clienteRuta.cliente.negocio }}</p>
            </div>
          </div>
        }

        <!-- Dirección -->
        <div class="info-item">
          <ion-icon name="location" color="primary"></ion-icon>
          <div class="info-content">
            <label>Dirección</label>
            <p>{{ clienteRuta.cliente.calle }}, {{ clienteRuta.cliente.colonia }}</p>
            @if (clienteRuta.cliente.referencia) {
              <small class="referencia">{{ clienteRuta.cliente.referencia }}</small>
            }
          </div>
        </div>

        <!-- Días de visita -->
        <div class="info-item">
          <ion-icon name="calendar" color="tertiary"></ion-icon>
          <div class="info-content">
            <label>Día de visita</label>
            <p>{{ diaSemana }}</p>
          </div>
        </div>

        <!-- Orden de visita -->
        <div class="info-item">
          <ion-icon name="list-outline" color="medium"></ion-icon>
          <div class="info-content">
            <label>Orden de visita</label>
            <p># {{ clienteRuta.ordenVisita }}</p>
          </div>
        </div>
      </div>

      <!-- CARACTERÍSTICAS -->
      <div class="caracteristicas-section">
        <h4>Características del Servicio</h4>
        
        <div class="caracteristica">
          <ion-icon name="cash" color="success"></ion-icon>
          <div>
            <strong>Precio por garrafón</strong>
            <p>\${{ clienteRuta.cliente.tipoPrecio?.precioPorGarrafon || clienteRuta.precio?.precioPorGarrafon || 0 }}</p>
          </div>
        </div>

        <div class="caracteristica">
          <ion-icon name="card" [color]="clienteRuta.es_credito ? 'warning' : 'medium'"></ion-icon>
          <div>
            <strong>Tipo de pago</strong>
            <p>{{ clienteRuta.es_credito ? 'CRÉDITO' : 'CONTADO' }}</p>
          </div>
        </div>

        <div class="caracteristica">
          <ion-icon name="document-text" [color]="clienteRuta.requiere_factura ? 'tertiary' : 'medium'"></ion-icon>
          <div>
            <strong>Facturación</strong>
            <p>{{ clienteRuta.requiere_factura ? 'SÍ requiere' : 'NO requiere' }}</p>
          </div>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN -->
      <div class="acciones-section">
        <ion-button expand="block" color="primary" (click)="abrirEditorCompleto()">
          <ion-icon name="create" slot="start"></ion-icon>
          Editar Cliente
        </ion-button>

        <ion-button expand="block" fill="outline" color="danger" (click)="eliminarDeRuta()">
          <ion-icon name="trash" slot="start"></ion-icon>
          Eliminar de esta Ruta
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: #f4f6fa;
    }
    
    // =====================================
    // MAPA
    // =====================================
    .mapa-container {
      height: 250px;
      position: relative;
      background: #e5e5ea;
      
      .mini-mapa {
        width: 100%;
        height: 100%;
      }
      
      .sin-ubicacion-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        padding: 20px;
        
        ion-icon {
          font-size: 64px;
          color: #ff9500;
          margin-bottom: 16px;
        }
        
        p {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
        }
        
        ion-button {
          --background: rgba(255,255,255,0.95);
          --color: #1c1c1e;
          --border-radius: 12px;
          font-weight: 600;
        }
      }
    }
    
    // =====================================
    // INFORMACIÓN
    // =====================================
    .info-section {
      background: white;
      padding: 0;
      margin-bottom: 12px;
      border-radius: 16px;
      margin: 12px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      
      .info-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        > ion-icon {
          font-size: 24px;
          margin-top: 2px;
          flex-shrink: 0;
        }
        
        .info-content {
          flex: 1;
          min-width: 0;
          
          label {
            display: block;
            font-size: 11px;
            color: #8e8e93;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
            font-weight: 600;
          }
          
          h3 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            color: #1c1c1e;
            word-wrap: break-word;
          }
          
          p {
            margin: 0;
            font-size: 15px;
            color: #3c3c43;
            word-wrap: break-word;
            line-height: 1.4;
          }
          
          .referencia {
            display: block;
            margin-top: 6px;
            font-size: 13px;
            color: #8e8e93;
            font-style: italic;
          }
        }
      }
    }
    
    // =====================================
    // CARACTERÍSTICAS
    // =====================================
    .caracteristicas-section {
      background: white;
      padding: 20px;
      margin: 0 16px 12px 16px;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      
      h4 {
        margin: 0 0 16px 0;
        font-size: 13px;
        font-weight: 600;
        color: #8e8e93;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .caracteristica {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 16px;
        background: #f9f9f9;
        border-radius: 12px;
        margin-bottom: 10px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        > ion-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        
        > div {
          flex: 1;
          
          strong {
            display: block;
            font-size: 13px;
            color: #8e8e93;
            margin-bottom: 4px;
            font-weight: 500;
          }
          
          p {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #1c1c1e;
          }
        }
      }
    }
    
    // =====================================
    // BOTONES DE ACCIÓN
    // =====================================
    .acciones-section {
      background: white;
      padding: 20px;
      margin: 0 16px;
      padding-bottom: 32px;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      
      ion-button {
        margin-bottom: 12px;
        --border-radius: 12px;
        font-weight: 600;
        height: 48px;
        text-transform: none;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  `]
})
export class DetalleClienteModalComponent implements OnInit, AfterViewInit {
  @ViewChild('miniMapa', { static: false }) miniMapaElement!: ElementRef;

  @Input() clienteRuta: any;
  @Input() diaSemana: string = '';
  @Input() diaRutaId: number = 0;

  private mapa: L.Map | null = null;
  tieneUbicacion: boolean = false;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      close, location, business, calendar, cash, document, trash,
      create, warning, card, documentText, person, listOutline
    });
  }

  ngOnInit() {
    const lat = this.clienteRuta.cliente.latitud;
    const lng = this.clienteRuta.cliente.longitud;

    this.tieneUbicacion = !!(lat && lng);
  }

  ngAfterViewInit() {
    if (this.tieneUbicacion) {
      setTimeout(() => this.inicializarMapa(), 300);
    }
  }

  ngOnDestroy() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }
  }

  inicializarMapa() {
    const lat = Number(this.clienteRuta.cliente.latitud);
    const lng = Number(this.clienteRuta.cliente.longitud);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Coordenadas inválidas para el mapa');
      return;
    }
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
    }

    this.mapa = L.map(this.miniMapaElement.nativeElement, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    const iconHtml = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #0099ff 0%, #20b0ff 100%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <ion-icon name="location" style="
          font-size: 20px;
          color: white;
          transform: rotate(45deg);
        "></ion-icon>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    L.marker([lat, lng], { icon: customIcon }).addTo(this.mapa);

    setTimeout(() => {
      this.mapa?.invalidateSize();
    }, 100);
  }

  // =====================================
  // ABRIR EDITOR COMPLETO
  // =====================================
  async abrirEditorCompleto() {
    await this.modalController.dismiss({
      abrirEditor: true,
      clienteRuta: this.clienteRuta
    });
  }

  // =====================================
  // ELIMINAR DE RUTA
  // =====================================
  async eliminarDeRuta() {
    const alert = await this.alertController.create({
      header: 'Eliminar Cliente',
      subHeader: 'El cliente permanecerá en el sistema',
      message: `¿Eliminar a <strong>${this.clienteRuta.cliente.representante || this.clienteRuta.cliente.nombre}</strong> de la ruta del día <strong>${this.diaSemana}</strong>?`,
      cssClass: 'alert-eliminar-cliente',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.modalController.dismiss({
              eliminar: true,
              clienteRutaId: this.clienteRuta.id
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // =====================================
  // UTILIDADES
  // =====================================
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  cerrar() {
    this.modalController.dismiss();
  }
}