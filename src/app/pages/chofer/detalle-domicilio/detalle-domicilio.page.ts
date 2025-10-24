import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import * as L from 'leaflet';
import { Domicilio } from '../../../models/domicilio.models';
import { DomicilioService } from '../../../services/domicilio.service';

@Component({
  selector: 'app-detalle-domicilio',
  templateUrl: './detalle-domicilio.page.html',
  styleUrls: ['./detalle-domicilio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetalleDomicilioPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  
  map: L.Map | undefined;
  domicilioActual: Domicilio | null = null;
  siguientesDomicilios: Domicilio[] = [];
  cantidadVendida: number = 0;
  loading: boolean = false;

  motivosSalto = [
    'Cliente no se encontraba',
    'Negocio cerrado',
    'No tiene dinero',
    'Ya no necesita',
    'Dirección incorrecta',
    'Otro'
  ];

  constructor(
    private domicilioService: DomicilioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDomicilioActual();
    this.cargarSiguientesDomicilios();
  }

  ionViewDidEnter() {
    this.initMap();
  }

  cargarDomicilioActual() {
    this.domicilioService.getDomicilioActual().subscribe(domicilio => {
      this.domicilioActual = domicilio;
      if (this.map && domicilio) {
        this.actualizarMapa();
      }
    });
  }

  cargarSiguientesDomicilios() {
    this.domicilioService.getSiguientesDomicilios(3).subscribe(domicilios => {
      this.siguientesDomicilios = domicilios;
    });
  }

  initMap() {
    if (!this.domicilioActual) return;

    const lat = this.domicilioActual.latitud;
    const lng = this.domicilioActual.longitud;

    this.map = L.map(this.mapElement.nativeElement).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.actualizarMapa();
  }

  actualizarMapa() {
    if (!this.map || !this.domicilioActual) return;

    // Limpia marcadores previos
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        this.map?.removeLayer(layer);
      }
    });

    // Icono personalizado para el marcador actual
    const iconoActual = L.divIcon({
      html: '<div style="background-color: #3880ff; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [30, 30],
      className: 'custom-div-icon'
    });

    L.marker([this.domicilioActual.latitud, this.domicilioActual.longitud], { icon: iconoActual })
      .addTo(this.map)
      .bindPopup(this.domicilioActual.nombreNegocio || this.domicilioActual.nombreCliente);

    this.map.setView([this.domicilioActual.latitud, this.domicilioActual.longitud], 15);
  }

  async mostrarAlertaSaltar() {
    const alert = await this.alertController.create({
      header: 'Saltar Cliente',
      message: 'Selecciona el motivo por el cual se salta este domicilio',
      inputs: this.motivosSalto.map(motivo => ({
        type: 'radio' as const,
        label: motivo,
        value: motivo
      })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (motivo) => {
            if (motivo) {
              this.saltarDomicilio(motivo);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  saltarDomicilio(motivo: string) {
    if (!this.domicilioActual) return;

    this.loading = true;
    this.domicilioService.saltarDomicilio({
      domicilioId: this.domicilioActual.id,
      motivo: motivo
    }).subscribe({
      next: async () => {
        this.loading = false;
        await this.mostrarToast('Domicilio saltado', 'warning');
        this.cargarDomicilioActual();
        this.cargarSiguientesDomicilios();
      },
      error: async () => {
        this.loading = false;
        await this.mostrarToast('Error al saltar domicilio', 'danger');
      }
    });
  }

  async realizarVenta() {
    if (!this.domicilioActual) return;

    if (!this.cantidadVendida || this.cantidadVendida <= 0) {
      await this.mostrarToast('Por favor ingresa la cantidad vendida', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Venta',
      message: `¿Confirmar venta de ${this.cantidadVendida} garrafón(es) por $${this.cantidadVendida * this.domicilioActual.precioGarrafon}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.procesarVenta();
          }
        }
      ]
    });

    await alert.present();
  }

  procesarVenta() {
    if (!this.domicilioActual) return;

    this.loading = true;
    this.domicilioService.realizarVenta({
      domicilioId: this.domicilioActual.id,
      cantidadVendida: this.cantidadVendida,
      requiereFactura: this.domicilioActual.requiereFactura,
      esCredito: this.domicilioActual.esCredito,
      precioUnitario: this.domicilioActual.precioGarrafon,
      total: this.cantidadVendida * this.domicilioActual.precioGarrafon
    }).subscribe({
      next: async () => {
        this.loading = false;
        this.cantidadVendida = 0;
        await this.mostrarToast('Venta realizada exitosamente', 'success');
        this.cargarDomicilioActual();
        this.cargarSiguientesDomicilios();
      },
      error: async () => {
        this.loading = false;
        await this.mostrarToast('Error al realizar la venta', 'danger');
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  verTodasLasRutas() {
    this.router.navigate(['/lista-domicilios']);
  }

  abrirMenu() {
    console.log('Abrir menú');
  }
}