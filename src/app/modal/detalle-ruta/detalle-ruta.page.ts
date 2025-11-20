import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavParams, Platform, ToastController } from '@ionic/angular';
import { GoogleMapsModule, MapDirectionsService } from '@angular/google-maps';
import { addIcons } from 'ionicons';
import { close, navigate, carSport, location, stopCircleOutline, navigateCircleOutline, playCircleOutline } from 'ionicons/icons';
import { Observable, map, of } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GoogleMapsModule],
})
export class DetalleRutaPage {
  
  @ViewChild('panelInstrucciones', { static: false }) panelInstrucciones!: ElementRef;

  ruta: any;
  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 };
  zoom = 15;
  navegando: boolean = false;
  
  puntosEntrega: any[] = [];
  posicionRepartidor: google.maps.LatLngLiteral | null = null;
  watchId: any;

  directionsResults$: Observable<google.maps.DirectionsResult | undefined>;
  resumenRuta: any = null;
  resultadoRuta: google.maps.DirectionsResult | null = null;

  rendererOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true,
    preserveViewport: false,
  };
 
  icons = {
    pendiente: {
      url: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png', 
      scaledSize: { width: 40, height: 40 } as any
    },
    actual: {
      url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: { width: 50, height: 50 } as any
    },
    realizado: {
      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      scaledSize: { width: 32, height: 32 } as any
    },
    saltado: {
      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: { width: 32, height: 32 } as any
    },
    repartidor: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, 
      scale: 6,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
      rotation: 0
    }
  };

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private mapDirectionsService: MapDirectionsService,
    private platform: Platform,
    private toastController: ToastController
  ) {
    addIcons({ close, navigate, carSport, location, stopCircleOutline, navigateCircleOutline, playCircleOutline });
    this.ruta = this.navParams.get('ruta');
    this.directionsResults$ = of(undefined);
    this.procesarPuntosRuta();
    this.iniciarTrackingRepartidor();
      if (this.watchId) Geolocation.clearWatch({ id: this.watchId });
    this.detenerDemoRecorrido(); 
  }
  procesarPuntosRuta() {
    if (this.ruta && this.ruta.coordenadas) {
      try {
        const coordsRaw = typeof this.ruta.coordenadas === 'string' 
          ? JSON.parse(this.ruta.coordenadas) 
          : this.ruta.coordenadas;
        this.puntosEntrega = coordsRaw.map((coord: any, index: number) => ({
          position: coord,
          estado: index === 0 ? 'actual' : (index === 1 ? 'realizado' : 'pendiente'), 
          titulo: `Cliente #${index + 1}`,
          info: `Dirección de entrega ${index + 1}`
        }));

        if (this.puntosEntrega.length > 0) {
          this.center = this.puntosEntrega[0].position;
        }
      } catch (e) { console.error(e); }
    }
  }
  ionViewDidEnter() {
    if (this.puntosEntrega.length > 0) {
      this.calcularRuta();
    }
  }

  async iniciarTrackingRepartidor() {
    try {
      const permisos = await Geolocation.checkPermissions();
      if (permisos.location !== 'granted') {
        await Geolocation.requestPermissions();
      }
      this.watchId = await Geolocation.watchPosition({ 
        enableHighAccuracy: true,
        timeout: 5000             
      }, (position, err) => {
        if (err) { console.error('Error de GPS:', err); return; }

        if (position) {
          if (!this.demoActiva) {
            this.posicionRepartidor = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
  
            if (this.navegando) {
              this.center = { ...this.posicionRepartidor };
            }
          }
        }
      });

    } catch (e) {
      console.error('No se pudo iniciar el GPS:', e);
      this.mostrarToast('Activa la ubicación para navegar', 'warning');
    }
  }

  calcularRuta() {
    if (this.puntosEntrega.length < 2) return;

    if (this.panelInstrucciones) {
      this.rendererOptions = { ...this.rendererOptions, panel: this.panelInstrucciones.nativeElement };
    }

    const origen = this.puntosEntrega[0].position;
    const destino = this.puntosEntrega[this.puntosEntrega.length - 1].position;
    
    const waypoints = this.puntosEntrega.slice(1, -1).map(p => ({ location: p.position, stopover: true }));

    const request: google.maps.DirectionsRequest = {
      origin: origen,
      destination: destino,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true 
    };

    this.directionsResults$ = this.mapDirectionsService.route(request).pipe(
      map(response => {
        if (response.result) {
          this.generarResumen(response.result);
          this.resultadoRuta = response.result;
        }
        return response.result;
      })
    );
  }

  generarResumen(result: google.maps.DirectionsResult) {
    if (result.routes.length > 0) {
      let totalDist = 0;
      let totalTime = 0;
      result.routes[0].legs.forEach(leg => {
        totalDist += leg.distance?.value || 0;
        totalTime += leg.duration?.value || 0;
      });
      
      this.resumenRuta = {
        tiempo: Math.floor(totalTime / 60) + ' min',
        distancia: (totalDist / 1000).toFixed(1) + ' km',
        paradas: this.puntosEntrega.length
      };
    }
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  obtenerIcono(estado: string) {
    switch(estado) {
      case 'realizado': return this.icons.realizado;
      case 'saltado': return this.icons.saltado;
      case 'actual': return this.icons.actual;
      default: return this.icons.pendiente;
    }
  }

  toggleNavegacion() {
    this.navegando = !this.navegando;

    if (this.navegando) {
      this.zoom = 18; 
      if (this.posicionRepartidor) {
        this.center = this.posicionRepartidor; 
      }
      this.mostrarToast('Navegación iniciada: El mapa te seguirá.', 'success');
    } else {
      this.zoom = 14;
      if (this.puntosEntrega.length > 0) {
        this.center = this.puntosEntrega[0].position;
      }
      this.mostrarToast('Navegación detenida.', 'medium');
    }
  }

  async mostrarToast(msg: string, color: string) {
      const toast = await this.toastController.create({ 
          message: msg, duration: 2000, color: color, position: 'top'
      });
      toast.present();
  }

  /* ==========================================
      ZONA DE PRUEBAS / DEMO (Comentar si no se usa)
     ========================================== */
  
  demoActiva: boolean = false;
  intervaloDemo: any;

  iniciarDemoRecorrido() {
    if (!this.resultadoRuta || !this.resultadoRuta.routes[0]) {
      this.mostrarToast('Espera a que cargue la ruta...', 'warning');
      return;
    }

    this.demoActiva = true;
    this.navegando = true; 
    this.zoom = 17;
    
    const ruta = this.resultadoRuta.routes[0];
    const camino = ruta.overview_path; 
    let paso = 0;

    this.intervaloDemo = setInterval(() => {
      if (paso >= camino.length) {
        this.detenerDemoRecorrido();
        return;
      }

      const punto = camino[paso];
      this.posicionRepartidor = { lat: punto.lat(), lng: punto.lng() };
      this.center = { ...this.posicionRepartidor };

      paso++;
    }, 300); 
  }

  detenerDemoRecorrido() {
    this.demoActiva = false;
    if (this.intervaloDemo) clearInterval(this.intervaloDemo);
    this.mostrarToast('Demo finalizada', 'medium');
  }

  /* ==========================================
     FIN ZONA DE PRUEBAS
     ========================================== */
  
}