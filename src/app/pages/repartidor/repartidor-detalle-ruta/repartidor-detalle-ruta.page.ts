import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { RutaService } from 'src/app/service/ruta.service';
import { GeolocationService } from 'src/app/service/geolocation.service';
import { RutaOptimizacionService } from 'src/app/service/ruta-optimizacion.service';
import { VentaService } from 'src/app/service/venta.service';
import { ModalTodosClientesPage } from '../modal-todos-clientes/modal-todos-clientes.page';
import { ModalAgregarVentaPage } from '../modal-agregar-venta/modal-agregar-venta.page';
import { ModalEditarClientePage } from '../modal-editar-cliente/modal-editar-cliente.page';
import { ModalSaltarClientePage } from '../modal-saltar-cliente/modal-saltar-cliente.page';
import * as L from 'leaflet';

@Component({
  selector: 'app-repartidor-detalle-ruta',
  templateUrl: './repartidor-detalle-ruta.page.html',
  styleUrls: ['./repartidor-detalle-ruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RepartidorDetalleRutaPage implements OnInit, AfterViewInit, OnDestroy {
  
  rutaId: number = 0;
  diaRuta: any;
  clientesOrdenados: any[] = [];
  clienteActual: any = null;
  ventaActual: any = null;
  proximosClientes: any[] = [];
  
  rutaIniciada: boolean = false;
  ubicacionActual: any = null;
  watchId: string | null = null;

  distanciaAlCliente: number = 0;
  tiempoEstimado: number = 0;

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private polyline: L.Polyline | null = null;
  private marcadorUsuario: L.Marker | null = null;
  private marcadorClienteActual: L.Circle | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rutasService: RutaService,
    private geolocationService: GeolocationService,
    private optimizacionService: RutaOptimizacionService,
    private ventaService: VentaService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  // ⭐ CONTADOR BASADO EN VENTAS
  get clientesVisitadosCount(): number {
    return this.clientesOrdenados.filter(c => 
      c.venta && (c.venta.estado === 'realizado' || c.venta.estado === 'saltado')
    ).length;
  }

  get clientesCompletadosCount(): number {
    return this.clientesOrdenados.filter(c => c.venta && c.venta.estado === 'realizado').length;
  }

  get clientesSaltadosCount(): number {
    return this.clientesOrdenados.filter(c => c.venta && c.venta.estado === 'saltado').length;
  }

  ngOnInit() {
    this.rutaId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarRuta();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 300);
  }

  ngOnDestroy() {
    if (this.watchId) {
      this.geolocationService.stopWatching(this.watchId);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  async cargarRuta() {
    this.rutasService.obtenerRutaPorId(this.rutaId).subscribe({
      next: async (ruta) => {
        this.diaRuta = this.obtenerDiaRutaActual(ruta.diasRuta);
        
        if (this.diaRuta) {
          this.clientesOrdenados = [...this.diaRuta.clientesRuta];
          
          await this.cargarVentas();
          
          this.rutaIniciada = this.diaRuta.estado === 'en_curso';
          
          if (this.rutaIniciada) {
            this.actualizarClienteActual();
            this.dibujarClientesEnMapa();
            this.iniciarSeguimiento();
          }
        }
      },
      error: (err) => {
        console.error('Error al cargar ruta:', err);
        this.mostrarToast('Error al cargar la ruta', 'danger');
      }
    });
  }

  async cargarVentas() {
    this.ventaService.obtenerVentasPorDiaRuta(this.diaRuta.id).subscribe({
      next: (ventas) => {
        this.clientesOrdenados.forEach(cr => {
          cr.venta = ventas.find(v => v.clienteRuta.id === cr.id);
        });
      },
      error: (err) => console.error('Error cargando ventas:', err)
    });
  }

  obtenerDiaRutaActual(diasRuta: any[]): any {
    const hoy = new Date().getDay();
    let diaBuscado = '';
    
    if (hoy === 1 || hoy === 4) diaBuscado = 'Lunes - Jueves';
    else if (hoy === 2 || hoy === 5) diaBuscado = 'Martes - Viernes';
    else if (hoy === 3 || hoy === 6) diaBuscado = 'Miercoles - Sábado';
    
    return diasRuta.find(dr => dr.diaSemana === diaBuscado) || diasRuta[0];
  }

  initMap() {
    this.map = L.map('mapRepartidor').setView([17.0732, -96.7266], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  async iniciarRuta() {
    const alert = await this.alertController.create({
      header: 'Iniciar Ruta',
      message: '¿Deseas iniciar la ruta? Se optimizará el recorrido según tu ubicación actual.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Iniciar', handler: async () => await this.comenzarRuta() }
      ]
    });

    await alert.present();
  }

  async comenzarRuta() {
    this.mostrarToast('Obteniendo ubicación...', 'primary');

    this.ubicacionActual = await this.geolocationService.getCurrentPosition();
    
    if (!this.ubicacionActual) {
      this.mostrarToast('No se pudo obtener la ubicación', 'danger');
      return;
    }

    await this.optimizarRuta();

    this.rutasService.iniciarDiaRuta(this.diaRuta.id).subscribe({
      next: () => {
        this.rutaIniciada = true;
        this.diaRuta.estado = 'en_curso';
        this.iniciarSeguimiento();
        this.calcularDistanciaYTiempo();
        this.mostrarToast('Ruta iniciada', 'success');
      },
      error: (err) => {
        console.error('Error al iniciar ruta:', err);
        this.mostrarToast('Error al iniciar la ruta', 'danger');
      }
    });
  }

  async optimizarRuta() {
    if (!this.ubicacionActual) return;

    this.mostrarToast('Optimizando ruta...', 'primary');

    const origen = {
      lat: this.ubicacionActual.latitude,
      lng: this.ubicacionActual.longitude
    };

    const destinos = this.clientesOrdenados.map(cr => ({
      lat: cr.cliente.direcciones[0].latitud,
      lng: cr.cliente.direcciones[0].longitud
    }));

    try {
      const rutaOptimizada = await this.optimizacionService.optimizarRuta(origen, destinos);
      
      if (rutaOptimizada && rutaOptimizada.orden) {
        const nuevoOrden = rutaOptimizada.orden.map((idx: number) => this.clientesOrdenados[idx]);
        this.clientesOrdenados = nuevoOrden;
        this.dibujarRutaEnMapa(rutaOptimizada.polyline);
        this.actualizarClienteActual();
        this.mostrarToast('Ruta optimizada', 'success');
      }
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      this.mostrarToast('No se pudo optimizar, usando orden manual', 'warning');
      this.dibujarClientesEnMapa();
    }
  }

  dibujarRutaEnMapa(polyline: any) {
    if (!this.map) return;

    this.limpiarMapa();

    if (this.ubicacionActual) {
      this.marcadorUsuario = L.marker(
        [this.ubicacionActual.latitude, this.ubicacionActual.longitude],
        {
          icon: L.divIcon({
            html: '<div style="background: #3880ff; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(56,128,255,0.5);"></div>',
            iconSize: [21, 21],
            iconAnchor: [10, 10]
          })
        }
      ).addTo(this.map);
    }

    this.clientesOrdenados.forEach((cr, idx) => {
      const dir = cr.cliente.direcciones[0];
      const completado = cr.venta && (cr.venta.estado === 'realizado' || cr.venta.estado === 'saltado');
      const marker = L.marker([dir.latitud, dir.longitud], {
        icon: this.crearIconoCliente(idx + 1, completado)
      }).addTo(this.map!);

      marker.bindPopup(`
        <strong>${idx + 1}. ${cr.cliente.representante}</strong><br>
        ${dir.direccion}<br>
        ${dir.colonia}
      `);

      this.markers.push(marker);
    });

    if (polyline && polyline.length > 0) {
      this.polyline = L.polyline(polyline, {
        color: '#3880ff',
        weight: 4,
        opacity: 0.7
      }).addTo(this.map);

      this.map.fitBounds(this.polyline.getBounds());
    }

    if (this.clienteActual) {
      const dir = this.clienteActual.cliente.direcciones[0];
      this.marcadorClienteActual = L.circle([dir.latitud, dir.longitud], {
        color: '#10dc60',
        fillColor: '#10dc60',
        fillOpacity: 0.2,
        radius: 50
      }).addTo(this.map);
    }
  }

  dibujarClientesEnMapa() {
    if (!this.map) return;

    this.limpiarMapa();

    this.clientesOrdenados.forEach((cr, idx) => {
      const dir = cr.cliente.direcciones[0];
      const completado = cr.venta && (cr.venta.estado === 'realizado' || cr.venta.estado === 'saltado');
      const marker = L.marker([dir.latitud, dir.longitud], {
        icon: this.crearIconoCliente(idx + 1, completado)
      }).addTo(this.map!);

      marker.bindPopup(`
        <strong>${idx + 1}. ${cr.cliente.representante}</strong><br>
        ${dir.direccion}<br>
        ${dir.colonia}
      `);

      this.markers.push(marker);
    });
  }

  crearIconoCliente(numero: number, completado: boolean): L.DivIcon {
    const color = completado ? '#10dc60' : '#3880ff';
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">${numero}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  limpiarMapa() {
    this.markers.forEach(m => this.map?.removeLayer(m));
    this.markers = [];
    
    if (this.polyline) {
      this.map?.removeLayer(this.polyline);
      this.polyline = null;
    }

    if (this.marcadorUsuario) {
      this.map?.removeLayer(this.marcadorUsuario);
      this.marcadorUsuario = null;
    }

    if (this.marcadorClienteActual) {
      this.map?.removeLayer(this.marcadorClienteActual);
      this.marcadorClienteActual = null;
    }
  }

  iniciarSeguimiento() {
    this.watchId = this.geolocationService.watchPosition((position: any) => {
      this.ubicacionActual = position;
      
      if (this.marcadorUsuario && this.map) {
        this.marcadorUsuario.setLatLng([position.latitude, position.longitude]);
      }

      this.calcularDistanciaYTiempo();
    });
  }

  calcularDistanciaYTiempo() {
    if (!this.ubicacionActual || !this.clienteActual) return;

    const dir = this.clienteActual.cliente.direcciones[0];
    this.distanciaAlCliente = this.geolocationService.calcularDistancia(
      this.ubicacionActual.latitude,
      this.ubicacionActual.longitude,
      dir.latitud,
      dir.longitud
    );

    this.tiempoEstimado = (this.distanciaAlCliente / 40) * 60;
  }

  actualizarClienteActual() {
    const noCompletado = this.clientesOrdenados.find(cr => 
      !cr.venta || cr.venta.estado === 'pendiente'
    );
    this.clienteActual = noCompletado || this.clientesOrdenados[0];
    this.ventaActual = this.clienteActual?.venta || null;
    
    const idx = this.clientesOrdenados.indexOf(this.clienteActual);
    this.proximosClientes = this.clientesOrdenados.slice(idx + 1, idx + 4);

    this.calcularDistanciaYTiempo();
  }

  async agregarVenta() {
    const modal = await this.modalController.create({
      component: ModalAgregarVentaPage,
      componentProps: {
        clienteRuta: this.clienteActual,
        diaRutaId: this.diaRuta.id
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.guardado) {
      await this.cargarVentas();
      this.actualizarClienteActual();
      this.dibujarClientesEnMapa();
      this.mostrarToast('Venta registrada', 'success');
    }
  }

  async saltarCliente() {
    const modal = await this.modalController.create({
      component: ModalSaltarClientePage,
      componentProps: {
        clienteRuta: this.clienteActual,
        diaRutaId: this.diaRuta.id
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.saltado) {
      await this.cargarVentas();
      this.actualizarClienteActual();
      this.dibujarClientesEnMapa();
      this.mostrarToast('Cliente saltado', 'warning');
    }
  }

  async verTodosClientes() {
    const modal = await this.modalController.create({
      component: ModalTodosClientesPage,
      componentProps: {
        clientes: this.clientesOrdenados,
        clienteActualId: this.clienteActual?.id,
        soloVista: true
      }
    });

    await modal.present();
  }

  async editarCliente() {
    const modal = await this.modalController.create({
      component: ModalEditarClientePage,
      componentProps: {
        cliente: this.clienteActual.cliente,
        clienteRuta: this.clienteActual,
        venta: this.ventaActual
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.actualizado) {
      await this.cargarRuta();
    }
  }

  getOrdenCliente(cliente: any): number {
    return this.clientesOrdenados.indexOf(cliente) + 1;
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  volver() {
    this.router.navigate(['/repartidor/rutas']);
  }
}