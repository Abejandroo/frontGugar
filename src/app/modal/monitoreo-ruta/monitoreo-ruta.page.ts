import { Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { addIcons } from 'ionicons';
import { close, map, location, timeOutline, car, businessOutline, checkmarkCircle, searchOutline, closeCircle } from 'ionicons/icons';
import { RutaService } from 'src/app/service/ruta.service';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-monitoreo-ruta',
  templateUrl: './monitoreo-ruta.page.html',
  styleUrls: ['./monitoreo-ruta.page.scss'],
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule],
  providers: [...IonicControllers]
})
export class MonitoreoRutaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaMonitoreo', { static: false }) mapaElement!: ElementRef;

  @Input() rutaId!: number;

  ruta: any = null;
  cargando: boolean = true;

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  clientesDia: any[] = [];
  diaSeleccionado: string = '';

  watchId: string | null = null;
  markerRepartidor: L.Marker | null = null;

  constructor(
    private modalCtrl: ModalController,
    private rutasService: RutaService,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, map, location, timeOutline, car, businessOutline, checkmarkCircle, searchOutline, closeCircle });
  }

  ngOnInit() {
    this.cargarDatosRuta();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 500);
  }

  ngOnDestroy() {
    this.detenerMonitoreo();
  }

  cargarDatosRuta() {
    this.rutasService.obtenerRutaPorId(this.rutaId).subscribe({
      next: (res) => {
        this.ruta = res;
        this.procesarDatosDiaActual();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.mostrarToast('Error al cargar la ruta', 'danger');
      }
    });
  }

  procesarDatosDiaActual() {
    if (!this.ruta.diasRuta || this.ruta.diasRuta.length === 0) return;

    const dia = this.ruta.diasRuta[0];
    this.diaSeleccionado = dia.diaSemana;

    let listaCruda: any[] = [];


    if (dia.clientesRuta && dia.clientesRuta.length > 0) {
      listaCruda = dia.clientesRuta.map((cr: any, i: number) => ({
        ...cr.cliente,
        ordenVisita: cr.ordenVisita || (i + 1),
        visitado: cr.visitado
      }));
    } else if (dia.clientes && dia.clientes.length > 0) {
      listaCruda = dia.clientes.map((c: any, i: number) => ({
        ...c,
        ordenVisita: i + 1,
        visitado: false
      }));
    }

    this.clientesDia = listaCruda;

    if (this.map) this.dibujarPines();
  }
  // --- MAPA LEAFLET ---
  initMap() {
    const element = this.mapaElement?.nativeElement;
    if (!element) return;

    this.map = L.map(element).setView([17.0732, -96.7266], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    if (this.clientesDia.length > 0) {
      this.dibujarPines();
    }
  }

  dibujarPines() {
    if (!this.map) return;

    this.markers.forEach(m => m.remove());
    this.markers = [];

    const bounds: L.LatLngBoundsExpression = [];

    this.clientesDia.forEach(c => {
      const lat = Number(c.latitud);
      const lng = Number(c.longitud);

      if (lat && lng) {
        const latlng: L.LatLngExpression = [lat, lng];
        bounds.push(latlng);

        const icon = L.divIcon({
          html: `<div style="background:#3880ff; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3);">${c.ordenVisita || '?'}</div>`,
          className: 'custom-pin',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const nombreMostrar = c.representante || c.nombre || 'Cliente';
        const marker = L.marker(latlng, { icon })
          .bindPopup(`<b>${nombreMostrar}</b><br>${c.calle}`)
          .addTo(this.map!);

        this.markers.push(marker);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // --- RASTREO EN VIVO MEJORADO ---
  async iniciarMonitoreo() {
    try {
      this.mostrarToast('Buscando señal GPS...', 'warning');

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      if (position) {
        const { latitude, longitude } = position.coords;
        this.actualizarRepartidor(latitude, longitude);
        this.mostrarToast('¡Te encontré! 🚚', 'success');

        this.map?.flyTo([latitude, longitude], 16);
      }

      this.watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos) => {
        if (pos) this.actualizarRepartidor(pos.coords.latitude, pos.coords.longitude);
      });

    } catch (e) {
      console.error(e);
      this.mostrarToast('Error GPS. Verifica la ubicación de tu PC/Celular.', 'danger');
    }
  }
  detenerMonitoreo() {
    if (this.watchId) Geolocation.clearWatch({ id: this.watchId });
  }

  actualizarRepartidor(lat: number, lng: number) {
    if (!this.map) return;

    if (Math.abs(lat) < 0.1 && Math.abs(lng) < 0.1) return;

    if (this.markerRepartidor) this.markerRepartidor.remove();

    const icon = L.divIcon({
      html: `<div style="font-size:30px; filter: drop-shadow(2px 4px 6px black);">🚚</div>`,
      className: 'truck-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    this.markerRepartidor = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(this.map);
  }
  cerrar() {
    this.modalCtrl.dismiss();
  }
  async mostrarToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color });
    t.present();
  }
}