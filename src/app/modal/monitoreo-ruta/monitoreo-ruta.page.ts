import { Component, Input, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { RutaServiceTs } from 'src/app/service/ruta.service.ts';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { addIcons } from 'ionicons';
import { close, map, location, timeOutline, car, businessOutline, checkmarkCircle, searchOutline, closeCircle } from 'ionicons/icons';

@Component({
  selector: 'app-monitoreo-ruta',
  templateUrl: './monitoreo-ruta.page.html',
  styleUrls: ['./monitoreo-ruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MonitoreoRutaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaMonitoreo', { static: false }) mapaElement!: ElementRef;

  @Input() rutaId!: number; // Recibimos solo el ID
  
  ruta: any = null;
  cargando: boolean = true;

  // Mapa
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  
  // Datos visuales
  clientesDia: any[] = [];
  diaSeleccionado: string = '';
  
  // Monitoreo
  watchId: string | null = null;
  markerRepartidor: L.Marker | null = null;

  constructor(
    private modalCtrl: ModalController,
    private rutasService: RutaServiceTs,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, map, location, timeOutline, car, businessOutline, checkmarkCircle, searchOutline, closeCircle });
  }

  ngOnInit() {
    this.cargarDatosRuta();
  }

  ngAfterViewInit() {
    // Esperamos un poco para que el modal termine de abrirse antes de cargar el mapa
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
      }
    });
  }

  procesarDatosDiaActual() {
    if (!this.ruta.diasRuta || this.ruta.diasRuta.length === 0) return;

    // Lógica simple para tomar el primer día disponible (o mejorar con fecha actual)
    const dia = this.ruta.diasRuta[0]; 
    this.diaSeleccionado = dia.diaSemana;

    // Aplanamos clientes
    this.clientesDia = (dia.clientes || []).map((c: any, i: number) => ({
      ...c,
      ordenVisita: i + 1
    }));

    if (this.map) this.dibujarPines();
  }

  // --- MAPA LEAFLET ---
  initMap() {
    const element = this.mapaElement?.nativeElement;
    if (!element) return;

    // Centrar en Oaxaca por defecto
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
    
    // Limpiar anteriores
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const bounds: L.LatLngBoundsExpression = [];

    this.clientesDia.forEach(c => {
      const lat = Number(c.latitud);
      const lng = Number(c.longitud);

      if (lat && lng) {
        const latlng: L.LatLngExpression = [lat, lng];
        bounds.push(latlng);

        // Icono circular con número
        const icon = L.divIcon({
          html: `<div style="background:#3880ff; color:white; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; border:2px solid white; box-shadow:0 2px 5px rgba(0,0,0,0.3);">${c.ordenVisita}</div>`,
          className: 'custom-pin',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker(latlng, { icon })
          .bindPopup(`<b>${c.nombre}</b><br>${c.calle}`)
          .addTo(this.map!);
        
        this.markers.push(marker);
      }
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // --- RASTREO EN VIVO (Simulado o Real) ---
  async iniciarMonitoreo() {
    try {
      const permiso = await Geolocation.checkPermissions();
      if(permiso.location !== 'granted') await Geolocation.requestPermissions();

      this.watchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
        if (pos) {
          this.actualizarRepartidor(pos.coords.latitude, pos.coords.longitude);
        }
      });
      this.mostrarToast('Rastreando repartidor...', 'success');
    } catch (e) {
      this.mostrarToast('No se pudo acceder al GPS', 'danger');
    }
  }

  detenerMonitoreo() {
    if (this.watchId) Geolocation.clearWatch({ id: this.watchId });
  }

  actualizarRepartidor(lat: number, lng: number) {
    if (!this.map) return;
    if (this.markerRepartidor) this.markerRepartidor.remove();

    const icon = L.divIcon({
      html: `<div style="font-size:24px;">🚚</div>`, // Icono simple de camión
      className: 'truck-icon',
      iconSize: [40, 40]
    });

    this.markerRepartidor = L.marker([lat, lng], { icon }).addTo(this.map);
  }

  cerrar() {
    this.modalCtrl.dismiss();
  }

  async mostrarToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}