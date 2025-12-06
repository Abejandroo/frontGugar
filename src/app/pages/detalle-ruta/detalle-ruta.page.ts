import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { RutaService } from 'src/app/service/ruta.service';
import { Auth } from 'src/app/service/auth';
import { DirectionsService } from 'src/app/service/directions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  checkmark,
  map,
  searchOutline,
  businessOutline,
  locationOutline,
  trashOutline,
  warningOutline,
  cutOutline,
  location,
  eye,
  eyeOff,
  closeCircle,
  create
} from 'ionicons/icons';
import * as L from 'leaflet';
import { DividirRutaModalComponent } from '../../modal/dividir-ruta-modal/dividir-ruta-modal.component';
import { DetalleClienteModalComponent } from '../../modal/detalle-cliente-modal/detalle-cliente-modal.component';
import { EditarClientePage } from 'src/app/modal/editar-cliente/editar-cliente.page';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,]
})
export class DetalleRutaPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapaLeaflet', { static: false }) mapaElement!: ElementRef;

  ruta: any = {
    representante: '',
    supervisor_id: null,
    idRepartidor: null,
    diasRuta: []
  };

  rutaId!: number;
  hayaCambios: boolean = false;

  // Personal
  supervisores: any[] = [];
  repartidores: any[] = [];

  // Día seleccionado
  diaSeleccionado: string = '';
  diasDisponibles: any[] = [];
  clientesDia: any[] = [];

  // Búsqueda
  textoBusqueda: string = '';
  clientesFiltrados: any[] = [];

  // Cliente seleccionado
  clienteSeleccionado: any = null;

  // Monitoreo
  monitoreando: boolean = false;
  watchId: string | null = null;
  markerRepartidor: L.Marker | null = null;

  // Mapa Leaflet
  private mapa: L.Map | null = null;
  private markers: Map<number, L.Marker> = new Map();

  // Stats
  totalClientes: number = 0;
  visitados: number = 0;
  pendientes: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rutasService: RutaService,
    private authService: Auth,
    private directionsService: DirectionsService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({
      arrowBack,
      checkmark,
      map,
      searchOutline,
      businessOutline,
      locationOutline,
      trashOutline,
      warningOutline,
      cutOutline,
      location,
      eye,
      eyeOff,
      closeCircle,
      create
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.rutaId = +params['id'];
      this.cargarPersonal();
      this.cargarRuta();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.inicializarMapa();
    }, 500);
  }

  ngOnDestroy() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
    }
    if (this.mapa) {
      this.mapa.remove();
    }
  }

  cargarPersonal() {
    this.authService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.supervisores = usuarios.filter(u => u.role === 'supervisor');
        this.repartidores = usuarios.filter(u => u.role === 'repartidor');
      }
    });
  }

  cargarRuta() {
    this.rutasService.obtenerRutaPorId(this.rutaId).subscribe({
      next: (data) => {
        // Mapear IDs correctamente
        this.ruta = {
          ...data,
          supervisorId: data.supervisor?.id || data.supervisorId,
          idRepartidor: data.repartidor?.id || data.idRepartidor
        };
        this.cargarDiasDisponibles();
      },
      error: (err) => {
        console.error('Error cargando ruta:', err);
        this.mostrarToast('Error al cargar la ruta', 'danger');
        this.volver();
      }
    });
  }

  cargarDiasDisponibles() {
    if (this.ruta.diasRuta && this.ruta.diasRuta.length > 0) {
      this.diasDisponibles = this.ruta.diasRuta;

      // Seleccionar día actual o el primero
      const hoy = new Date().getDay();
      let diaDefault = this.diasDisponibles[0];

      // Mapeo simple de días
      if ([1, 4].includes(hoy)) diaDefault = this.diasDisponibles.find(d => d.diaSemana.includes('Lunes')) || diaDefault;
      if ([2, 5].includes(hoy)) diaDefault = this.diasDisponibles.find(d => d.diaSemana.includes('Martes')) || diaDefault;
      if ([3, 6].includes(hoy)) diaDefault = this.diasDisponibles.find(d => d.diaSemana.includes('Miércoles')) || diaDefault;

      this.diaSeleccionado = diaDefault.diaSemana;
      this.cambiarDia();
    }
  }

  cambiarDia() {
    const dia = this.diasDisponibles.find(d => d.diaSemana === this.diaSeleccionado);

    if (dia) {
      let listaCruda: any[] = [];

      // Adaptador de datos para diferentes estructuras
      if (dia.clientesRuta && dia.clientesRuta.length > 0) {
        listaCruda = dia.clientesRuta;
      } else if (dia.clientes && dia.clientes.length > 0) {
        listaCruda = dia.clientes.map((c: any, i: number) => ({
          id: c.id,
          cliente: c,
          precio: c.tipoPrecio,
          ordenVisita: i + 1,
          visitado: false,
          es_credito: false,
          requiere_factura: false
        }));
      }

      this.clientesDia = listaCruda.sort((a, b) => (a.ordenVisita || 0) - (b.ordenVisita || 0));
      this.clientesFiltrados = [...this.clientesDia];
      this.clienteSeleccionado = null;

      this.calcularEstadisticas();
      this.actualizarMapa();
    } else {
      this.clientesDia = [];
      this.clientesFiltrados = [];
    }
  }

  calcularEstadisticas() {
    this.totalClientes = this.clientesDia.length;
    this.visitados = this.clientesDia.filter(c => c.visitado).length;
    this.pendientes = this.totalClientes - this.visitados;
  }

  // ========================================
  // MAPA LEAFLET
  // ========================================

  inicializarMapa() {
    if (this.mapa) this.mapa.remove();
    const mapElement = this.mapaElement?.nativeElement;
    if (!mapElement) return;

    this.mapa = L.map(mapElement).setView([17.0732, -96.7266], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.mapa);

    if (this.clientesDia.length > 0) this.actualizarMapa();
  }

  actualizarMapa() {
    if (!this.mapa) return;

    // Limpiar markers anteriores
    this.markers.forEach(m => m.remove());
    this.markers.clear();

    const bounds: L.LatLngBoundsExpression = [];

    this.clientesDia.forEach((clienteRuta, index) => {
      const c = clienteRuta.cliente;
      const lat = Number(c.latitud);
      const lng = Number(c.longitud);

      if (lat && lng) {
        const latlng: L.LatLngExpression = [lat, lng];
        bounds.push(latlng);

        const iconHtml = `<div class="marker-custom"><div class="marker-numero">${clienteRuta.ordenVisita || index + 1}</div></div>`;
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-marker-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const marker = L.marker(latlng, { icon: customIcon })
          .bindPopup(`<strong>${c.representante || c.nombre}</strong><br>${c.calle}`)
          .on('click', () => { this.seleccionarCliente(clienteRuta); })
          .addTo(this.mapa!);

        this.markers.set(clienteRuta.id, marker);
      }
    });

    if (bounds.length > 0) {
      this.mapa.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  seleccionarCliente(clienteRuta: any) {
    this.clienteSeleccionado = clienteRuta;
    setTimeout(() => {
      const content = document.querySelector('ion-content');
      content?.scrollToPoint(0, 700, 500);
    }, 100);
  }

  deseleccionarCliente() {
    this.clienteSeleccionado = null;
  }

  seleccionarClienteEnMapa(clienteRuta: any) {
    const lat = Number(clienteRuta.cliente.latitud);
    const lng = Number(clienteRuta.cliente.longitud);

    if (lat && lng) {
      this.clienteSeleccionado = clienteRuta;
      if (this.mapa) this.mapa.setView([lat, lng], 16);

      const marker = this.markers.get(clienteRuta.id);
      if (marker) marker.openPopup();

      setTimeout(() => {
        const mapaElement = document.getElementById('mapa-leaflet');
        mapaElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      this.mostrarToast('Este cliente no tiene ubicación GPS', 'warning');
    }
  }

  // ========================================
  // MONITOREO EN TIEMPO REAL
  // ========================================

  async iniciarMonitoreo() {
    if (this.monitoreando) {
      this.detenerMonitoreo();
      return;
    }

    try {
      const permisos = await Geolocation.checkPermissions();
      if (permisos.location !== 'granted') {
        await Geolocation.requestPermissions();
      }

      this.monitoreando = true;
      this.mostrarToast('Monitoreando repartidor...', 'success');

      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        },
        (position, err) => {
          if (err) {
            console.error('Error GPS:', err);
            return;
          }

          if (position) {
            this.actualizarPosicionRepartidor({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }
        }
      );

    } catch (error) {
      console.error('Error iniciando monitoreo:', error);
      this.mostrarToast('Error al acceder al GPS', 'danger');
    }
  }

  detenerMonitoreo() {
    this.monitoreando = false;

    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }

    if (this.markerRepartidor) {
      this.markerRepartidor.remove();
      this.markerRepartidor = null;
    }

    this.mostrarToast('Monitoreo detenido', 'medium');
  }

  actualizarPosicionRepartidor(posicion: { lat: number; lng: number }) {
    if (!this.mapa) return;

    if (this.markerRepartidor) {
      this.markerRepartidor.remove();
    }

    const iconHtml = `
      <div class="marker-repartidor">
        <ion-icon name="car" style="color: white; font-size: 20px;"></ion-icon>
      </div>
    `;

    const repartidorIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-repartidor-icon',
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.markerRepartidor = L.marker([posicion.lat, posicion.lng], {
      icon: repartidorIcon
    })
      .bindPopup(`
        <strong>🚗 ${this.ruta.repartidor?.name || 'Repartidor'}</strong><br>
        Ubicación en tiempo real
      `)
      .addTo(this.mapa);

    console.log('📍 Posición actualizada:', posicion);
  }

  // ========================================
  // DIVIDIR RUTA
  // ========================================

  async dividirRuta() {
    if (this.clientesDia.length < 4) {
      this.mostrarToast('Se necesitan al menos 4 clientes para dividir', 'warning');
      return;
    }

    // 🛑 Obtener el objeto completo del día de ruta
    const diaRutaSeleccionado = this.diasDisponibles.find(d => d.diaSemana === this.diaSeleccionado);

    if (!diaRutaSeleccionado || !diaRutaSeleccionado.id) {
      this.mostrarToast('Error: No se encontró el ID del Día de Ruta seleccionado.', 'danger');
      return;
    }

    const puntoMedio = Math.floor(this.clientesDia.length / 2);

    try {
      const modal = await this.modalController.create({
        component: DividirRutaModalComponent,
        componentProps: {
          // 💡 CORRECCIÓN: Pasar los IDs
          rutaId: this.rutaId,
          diaRutaId: diaRutaSeleccionado.id, // ID del día de ruta

          totalClientes: this.clientesDia.length,
          puntoCorteDefault: puntoMedio,
          diaSemana: this.diaSeleccionado
        },
        cssClass: 'modal-dividir-ruta',
        backdropDismiss: true,
        mode: 'ios'
      });

      await modal.present();
      console.log('✅ Modal dividir ruta presentado');

      const { data } = await modal.onWillDismiss();

      if (data?.confirmar) {
        await this.ejecutarDivision(data.puntoCorte);
      }
    } catch (error) {
      console.error('❌ Error abriendo modal dividir:', error);
      this.mostrarToast('Error al abrir el modal', 'danger');
    }
  }

  async ejecutarDivision(puntoCorte: number) {
    const loading = await this.toastController.create({
      message: 'Dividiendo ruta...',
      duration: 0
    });
    await loading.present();

    try {
      const grupo1 = this.clientesDia.slice(0, puntoCorte);
      const grupo2 = this.clientesDia.slice(puntoCorte);

      const rutaOptimizada1 = await this.calcularRutaOptimizada(grupo1);
      const rutaOptimizada2 = await this.calcularRutaOptimizada(grupo2);

      await loading.dismiss();

      const confirmAlert = await this.alertController.create({
        header: 'División Completada',
        message: `
          <strong>Sub-ruta A:</strong> ${grupo1.length} clientes<br>
          Distancia: ${(rutaOptimizada1.totalDistance / 1000).toFixed(1)} km<br>
          Tiempo: ${Math.floor(rutaOptimizada1.totalDuration / 60)} min<br><br>
          <strong>Sub-ruta B:</strong> ${grupo2.length} clientes<br>
          Distancia: ${(rutaOptimizada2.totalDistance / 1000).toFixed(1)} km<br>
          Tiempo: ${Math.floor(rutaOptimizada2.totalDuration / 60)} min
        `,
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Crear Sub-rutas',
            handler: () => {
              this.mostrarToast('Sub-rutas creadas (función en desarrollo)', 'success');
            }
          }
        ]
      });

      await confirmAlert.present();

    } catch (error) {
      await loading.dismiss();
      console.error('Error dividiendo ruta:', error);
      this.mostrarToast('Error al dividir ruta', 'danger');
    }
  }

  async calcularRutaOptimizada(clientes: any[]) {
    if (clientes.length === 0) {
      return { totalDistance: 0, totalDuration: 0, steps: [] };
    }

    const puntos = clientes
      .filter(cr => cr.cliente.latitud && cr.cliente.longitud)
      .map(cr => ({
        lat: Number(cr.cliente.latitud),
        lng: Number(cr.cliente.longitud)
      }));

    if (puntos.length < 2) {
      let distanciaTotal = 0;
      for (let i = 0; i < puntos.length - 1; i++) {
        distanciaTotal += this.directionsService.calcularDistancia(puntos[i], puntos[i + 1]);
      }

      return {
        totalDistance: distanciaTotal,
        totalDuration: distanciaTotal / 8.33,
        steps: []
      };
    }

    try {
      const origen = puntos[0];
      const destino = puntos[puntos.length - 1];
      const waypoints = puntos.slice(1, -1).slice(0, 25);

      const ruta = await this.directionsService.calcularRuta(origen, destino, waypoints);

      if (!ruta) {
        throw new Error('No se pudo calcular la ruta');
      }

      return ruta;

    } catch (error) {
      console.error('Error en calcularRutaOptimizada:', error);

      let distanciaTotal = 0;
      for (let i = 0; i < puntos.length - 1; i++) {
        distanciaTotal += this.directionsService.calcularDistancia(puntos[i], puntos[i + 1]);
      }

      return {
        totalDistance: distanciaTotal,
        totalDuration: distanciaTotal / 8.33,
        steps: []
      };
    }
  }

  // ========================================
  // EDICIÓN
  // ========================================

  marcarCambio() {
    this.hayaCambios = true;
  }

  async guardarCambios() {
    if (!this.hayaCambios) return;

    const datos = {
      nombre: this.ruta.nombre,
      idSupervisor: this.ruta.supervisorId,
      idRepartidor: this.ruta.idRepartidor
    };

    this.rutasService.actualizarRuta(this.rutaId, datos).subscribe({
      next: () => {
        this.hayaCambios = false;
        this.mostrarToast('Cambios guardados', 'success');
      },
      error: () => this.mostrarToast('Error al guardar', 'danger')
    });
  }

  // ========================================
  // ACCIONES DE CLIENTES
  // ========================================

  buscarCliente(event: any) {
    const busqueda = event.target.value.toLowerCase();
    if (!busqueda) {
      this.clientesFiltrados = [...this.clientesDia];
      return;
    }

    this.clientesFiltrados = this.clientesDia.filter(cr => {
      const c = cr.cliente;
      return (c.representante || c.nombre || '').toLowerCase().includes(busqueda) ||
        (c.calle || '').toLowerCase().includes(busqueda);
    });
  }

  // ========================================
  // MODAL DETALLE CLIENTE (Reutiliza el existente)
  // ========================================
  // En DetalleRutaPage.ts

  async editarUbicacionCliente(clienteRuta: any) {
    try {
      const modal = await this.modalController.create({
        component: DetalleClienteModalComponent,
        componentProps: {
          clienteRuta: clienteRuta,
          diaSemana: this.diaSeleccionado
        },
        cssClass: 'modal-detalle-cliente',
        breakpoints: [0, 0.5, 0.9],
        initialBreakpoint: 0.9,
        handle: true,
        mode: 'ios'
      });

      await modal.present();
      console.log('✅ Modal detalle cliente presentado');

      const { data } = await modal.onWillDismiss();

      if (data?.eliminar) {
        await this.eliminarClienteDeRutaDirecto(clienteRuta);
      } else if (data?.actualizado) {
        this.cargarRuta();
      } else if (data?.abrirEditor) {
        await this.abrirEditorCompleto(data.clienteRuta);
      }

    } catch (error) {
      console.error('❌ Error abriendo modal detalle cliente:', error);
      this.mostrarToast('Error al abrir el modal', 'danger');
    }
  }


  async abrirEditorCompleto(clienteRuta: any) {
    try {
      const modal = await this.modalController.create({
        component: EditarClientePage,
        componentProps: {
          cliente: clienteRuta.cliente
        },
        cssClass: 'modal-editar-cliente'
      });

      await modal.present();
      console.log('✅ Modal editar cliente presentado');

      const { data } = await modal.onWillDismiss();

      if (data?.actualizado) {
        this.mostrarToast('Cliente actualizado correctamente', 'success');
        this.cargarRuta();
      }
    } catch (error) {
      console.error('❌ Error abriendo editor completo:', error);
      this.mostrarToast('Error al abrir el editor', 'danger');
    }
  }


  async eliminarClienteDeRuta(clienteRuta: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Cliente',
      subHeader: 'El cliente permanecerá en el sistema',
      message: `¿Eliminar a ${clienteRuta.cliente.representante || clienteRuta.cliente.nombre} de la ruta del día ${this.diaSeleccionado}?`,
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
            this.eliminarClienteDeRutaDirecto(clienteRuta);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private eliminarClienteDeRutaDirecto(clienteRuta: any) {
    const diaRuta = this.diasDisponibles.find(d => d.diaSemana === this.diaSeleccionado);

    if (!diaRuta) {
      this.mostrarToast('Error: día de ruta no encontrado', 'danger');
      return;
    }

    this.rutasService.eliminarClienteDeRuta(diaRuta.id, clienteRuta.cliente.id).subscribe({
      next: () => {
        this.mostrarToast('Cliente eliminado de la ruta', 'success');
        this.deseleccionarCliente();
        this.cargarRuta();
      },
      error: (err) => {
        console.error('Error eliminando cliente:', err);
        this.mostrarToast('Error al eliminar cliente', 'danger');
      }
    });
  }

  // ========================================
  // UTILIDADES
  // ========================================

  async mostrarToast(msg: string, color: string) {
    const t = await this.toastController.create({
      message: msg,
      duration: 2000,
      color,
      position: 'top'
    });
    t.present();
  }

  volver() {
    if (this.hayaCambios) {
      this.alertController.create({
        header: 'Cambios sin guardar',
        message: '¿Descartar los cambios?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Descartar',
            role: 'destructive',
            handler: () => {
              this.detenerMonitoreo();
              this.router.navigate(['/gestion-rutas']);
            }
          }
        ]
      }).then(alert => alert.present());
    } else {
      this.detenerMonitoreo();
      this.router.navigate(['/gestion-rutas']);
    }
  }
}