import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { RutaService } from 'src/app/service/ruta.service';
import { Auth } from 'src/app/service/auth';
import { DirectionsService } from 'src/app/service/directions.service';
import { ActivatedRoute, Router } from '@angular/router';
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
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, ...IonicSharedComponents]
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

  supervisores: any[] = [];
  repartidores: any[] = [];

  diaSeleccionado: string = '';
  diasDisponibles: any[] = [];
  clientesDia: any[] = [];
  repartidorDiaId: number | null = null;
  diaRutaIdActual: number | null = null;
  estadoDiaRuta: string = '';
  esHoyDiaDeVisita: boolean = false;

  textoBusqueda: string = '';
  clientesFiltrados: any[] = [];

  clienteSeleccionado: any = null;

  monitoreando: boolean = false;
  watchId: string | null = null;
  markerRepartidor: L.Marker | null = null;
  private monitoreoInterval: any = null;

  private mapa: L.Map | null = null;
  private markers: Map<number, L.Marker> = new Map();

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
      this.diasDisponibles = this.ruta.diasRuta.filter((dia: any) => {
        return dia.dividida === false || dia.dividida === 0;
      });

      if (this.diasDisponibles.length === 0) {
        this.diaSeleccionado = '';
        this.mostrarToast('Todos los días de esta ruta han sido divididos.', 'warning');
        this.clientesDia = [];
        return;
      }

      const hoy = new Date().getDay();
      let diaDefault = this.diasDisponibles[0];

      if ([1, 4].includes(hoy)) diaDefault = this.diasDisponibles.find(d => d.diaSemana.includes('Lunes')) || diaDefault;
      if ([2, 5].includes(hoy)) diaDefault = this.diasDisponibles.find(d => d.diaSemana.includes('Martes')) || diaDefault;
      if ([3, 6].includes(hoy)) diaDefault = this.diasDisponibles.find(d => d.diaSemana.includes('Miércoles')) || diaDefault;

      this.diaSeleccionado = diaDefault.diaSemana;
      this.cambiarDia();
    }
  }

  cambiarRepartidorDia(event: any) {
    const nuevoRepartidorId = event.detail.value;

    if (!this.diaRutaIdActual) {
      this.mostrarToast('Error: No hay día seleccionado', 'danger');
      return;
    }

    this.repartidorDiaId = nuevoRepartidorId;

    this.rutasService.actualizarRepartidorDia(this.diaRutaIdActual, nuevoRepartidorId).subscribe({
      next: (response) => {
        this.mostrarToast('Repartidor actualizado', 'success');

        const dia = this.diasDisponibles.find(d => d.id === this.diaRutaIdActual);
        if (dia) {
          dia.idRepartidor = nuevoRepartidorId;
          dia.repartidor = this.repartidores.find(r => r.id === nuevoRepartidorId) || null;
        }
      },
      error: (err) => {
        this.mostrarToast('Error al actualizar repartidor', 'danger');
        this.cambiarDia();
      }
    });
  }

  verificarSiEsHoyDiaVisita(diaSemana: string): boolean {
    const hoy = new Date().getDay();
    const diaLower = diaSemana.toLowerCase();
    const mapaDias: { [key: number]: string[] } = {
      0: ['domingo'],
      1: ['lunes', 'lunes-jueves'],
      2: ['martes', 'martes-viernes'],
      3: ['miércoles', 'miercoles', 'miércoles-sábado', 'miercoles-sabado'],
      4: ['jueves', 'lunes-jueves'],
      5: ['viernes', 'martes-viernes'],
      6: ['sábado', 'sabado', 'miércoles-sábado', 'miercoles-sabado']
    };

    const diasValidos = mapaDias[hoy] || [];

    return diasValidos.some(d => diaLower.includes(d));
  }

  puedeMonitorear(): boolean {
    return (
      this.repartidorDiaId !== null &&
      this.esHoyDiaDeVisita &&
      this.estadoDiaRuta === 'en_curso'
    );
  }

  getMensajeMonitoreo(): string {
    if (!this.repartidorDiaId) {
      return 'No hay repartidor asignado';
    }
    if (!this.esHoyDiaDeVisita) {
      return 'No es el día de visita';
    }
    if (this.estadoDiaRuta !== 'en_curso') {
      return 'El repartidor no ha iniciado la ruta';
    }
    return 'Monitorear ubicación del repartidor';
  }



  cambiarDia() {
    const dia = this.diasDisponibles.find(d => d.diaSemana === this.diaSeleccionado);
    if (dia) {
      this.diaRutaIdActual = dia.id;

      this.estadoDiaRuta = dia.estado || 'pendiente';
      this.esHoyDiaDeVisita = this.verificarSiEsHoyDiaVisita(dia.diaSemana);

      if (!dia.dividida || dia.dividida === false) {
        if (dia.idRepartidor || dia.repartidor?.id) {
          this.repartidorDiaId = dia.idRepartidor || dia.repartidor?.id;
        } else {
          this.repartidorDiaId = this.ruta.idRepartidor || this.ruta.repartidor?.id || null;
        }
      } else {
        this.repartidorDiaId = null;
      }

      let listaCruda: any[] = [];

      if (dia.clientesRuta && dia.clientesRuta.length > 0) {
        listaCruda = dia.clientesRuta.map((cr: any) => ({
          ...cr,
          visitado: cr.venta && (cr.venta.estado === 'realizado' || cr.venta.estado === 'saltado'),
        }));
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
      this.repartidorDiaId = null;
    }
  }

  calcularEstadisticas() {
    this.totalClientes = this.clientesDia.length;
    this.visitados = this.clientesDia.filter(c => c.visitado).length;
    this.pendientes = this.totalClientes - this.visitados;
  }

  getNombreRepartidorDia(): string {
    if (!this.repartidorDiaId) return 'Sin asignar';
    const rep = this.repartidores.find(r => r.id === this.repartidorDiaId);
    return rep?.name || 'Sin asignar';
  }


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


  async iniciarMonitoreo() {
    if (this.monitoreando) {
      this.detenerMonitoreo();
      return;
    }

    if (!this.repartidorDiaId) {
      this.mostrarToast('Asigna un repartidor para monitorear', 'warning');
      return;
    }

    this.monitoreando = true;
    this.mostrarToast('Monitoreando repartidor... (Actualizando cada 10s)', 'success');

    this.monitoreoInterval = setInterval(() => {
      this.rutasService.obtenerUbicacionRepartidor(this.repartidorDiaId!).subscribe({
        next: (posicion: { lat: number, lng: number }) => {
          if (posicion && posicion.lat && posicion.lng) {
            this.actualizarPosicionRepartidor(posicion);
            this.mapa?.setView([posicion.lat, posicion.lng], 15);
          }
        },
        error: (err) => {
          console.warn('No se pudo obtener la ubicación del repartidor:', err);
        }
      });
    }, 10000);

  }

  detenerMonitoreo() {
    this.monitoreando = false;

    if (this.monitoreoInterval) {
      clearInterval(this.monitoreoInterval);
      this.monitoreoInterval = null;
    }

    if (this.markerRepartidor) {
      this.markerRepartidor.remove();
      this.markerRepartidor = null;
    }

    this.mostrarToast('Monitoreo detenido', 'medium');
  }

  ngOnDestroy() {
    this.detenerMonitoreo();
    if (this.mapa) {
      this.mapa.remove();
    }
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
        <strong> ${this.ruta.repartidor?.name || 'Repartidor'}</strong><br>
        Ubicación en tiempo real
      `)
      .addTo(this.mapa);

  }


  async dividirRuta() {
    if (this.clientesDia.length < 4) {
      this.mostrarToast('Se necesitan al menos 4 clientes para dividir', 'warning');
      return;
    }

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
          rutaId: this.rutaId,
          diaRutaId: diaRutaSeleccionado.id,
          totalClientes: this.clientesDia.length,
          puntoCorteDefault: puntoMedio,
          diaSemana: this.diaSeleccionado
        },
        cssClass: 'modal-dividir-ruta',
        backdropDismiss: true,
        mode: 'ios'
      });

      await modal.present();
      const { data } = await modal.onWillDismiss();

      if (data?.recargar) {
        await this.mostrarToast('Sub-rutas creadas exitosamente', 'success');
        this.cargarRuta();
      }

    } catch (error) {
      console.error('Error abriendo modal dividir:', error);
      this.mostrarToast('Error al abrir el modal', 'danger');
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

      const { data } = await modal.onWillDismiss();

      if (data?.eliminar) {
        await this.eliminarClienteDeRutaDirecto(clienteRuta);
      } else if (data?.actualizado) {
        this.cargarRuta();
      } else if (data?.abrirEditor) {
        await this.abrirEditorCompleto(data.clienteRuta);
      }

    } catch (error) {
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

      const { data } = await modal.onWillDismiss();

      if (data?.actualizado) {
        this.mostrarToast('Cliente actualizado correctamente', 'success');
        this.cargarRuta();
      }
    } catch (error) {
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