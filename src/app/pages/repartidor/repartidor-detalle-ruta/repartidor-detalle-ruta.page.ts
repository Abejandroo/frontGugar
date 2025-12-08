import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { RutaService } from 'src/app/service/ruta.service';
import { GeolocationService } from 'src/app/service/geolocation.service';
import { RutaOptimizacionService } from 'src/app/service/ruta-optimizacion.service';
import { VentaService } from 'src/app/service/venta.service';
import { TtsService } from 'src/app/service/tts.service';
import { ModalTodosClientesPage } from '../modal-todos-clientes/modal-todos-clientes.page';
import { ModalAgregarVentaPage } from '../modal-agregar-venta/modal-agregar-venta.page';
import { ModalEditarClientePage } from '../modal-editar-cliente/modal-editar-cliente.page';
import { ModalSaltarClientePage } from '../modal-saltar-cliente/modal-saltar-cliente.page';
import * as L from 'leaflet';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-repartidor-detalle-ruta',
  templateUrl: './repartidor-detalle-ruta.page.html',
  styleUrls: ['./repartidor-detalle-ruta.page.scss'],
  standalone: true,
  imports: [ CommonModule, ...IonicSharedComponents],
  providers: [...IonicControllers]
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

  vozHabilitada: boolean = true;
  private ultimaDistanciaAnunciada: number = 0;

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
    private ttsService: TtsService,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  // ========================================
  // CONTADORES BASADOS EN VENTAS
  // ========================================

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

  get clientesPendientesCount(): number {
    return this.clientesOrdenados.filter(c =>
      !c.venta || c.venta.estado === 'pendiente'
    ).length;
  }

  get todosClientesVisitados(): boolean {
    return this.clientesPendientesCount === 0 && this.clientesOrdenados.length > 0;
  }

  get hayClientesPendientes(): boolean {
    return this.clientesPendientesCount > 0;
  }

  // ========================================
  // CICLO DE VIDA
  // ========================================

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

  // ========================================
  // CARGAR DATOS
  // ========================================

  async cargarRuta() {
    this.rutasService.obtenerDiaRutaConClientes(this.rutaId).subscribe({
      next: async (diaRuta: any) => {
        this.diaRuta = diaRuta;

        if (this.diaRuta) {
          this.clientesOrdenados = [...this.diaRuta.clientesRuta];

          await this.cargarVentas();

          this.rutaIniciada = this.diaRuta.estado === 'en_curso';

          this.dibujarClientesEnMapa();

          if (this.rutaIniciada) {
            this.actualizarClienteActual();
            this.iniciarSeguimiento();
          }
          if (this.map && this.markers.length > 0) {
            const group = new L.FeatureGroup(this.markers);
            this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
          } else if (this.map) {
            this.map.setView([17.0732, -96.7266], 14);
          }

        }
      },
      error: (err) => {
        console.error('Error al cargar DiaRuta:', err);
        this.mostrarToast('Error al cargar la ruta (DiaRuta)', 'danger');
      }
    });
  }

  async cargarVentas() {
    return new Promise<void>((resolve) => {
      this.ventaService.obtenerVentasPorDiaRuta(this.diaRuta.id).subscribe({
        next: (ventas) => {
          this.clientesOrdenados.forEach(cr => {
            cr.venta = ventas.find(v => v.clienteRuta?.id === cr.id);
          });
          resolve();
        },
        error: (err) => {
          console.error('Error cargando ventas:', err);
          resolve();
        }
      });
    });
  }


  // ========================================
  // MAPA
  // ========================================

  initMap() {
    this.map = L.map('mapRepartidor').setView([17.0732, -96.7266], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  // ========================================
  // INICIAR / PAUSAR / FINALIZAR RUTA
  // ========================================

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
      next: async () => {
        this.rutaIniciada = true;
        this.diaRuta.estado = 'en_curso';
        this.iniciarSeguimiento();
        this.calcularDistanciaYTiempo();
        this.mostrarToast('Ruta iniciada', 'success');

        if (this.vozHabilitada) {
          await this.ttsService.anunciarInicioRuta(this.clientesOrdenados.length);

          if (this.clienteActual) {
            await this.ttsService.anunciarCliente(
              this.clienteActual.cliente.nombre,
              `${this.clienteActual.cliente.calle}, ${this.clienteActual.cliente.colonia}`
            );
          }
        }
      },
      error: (err) => {
        console.error('Error al iniciar ruta:', err);
        this.mostrarToast('Error al iniciar la ruta', 'danger');
      }
    });
  }

  async pausarRuta() {
    const alert = await this.alertController.create({
      header: 'Pausar Ruta',
      message: `¿Deseas pausar la ruta? Quedan ${this.clientesPendientesCount} clientes por visitar.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Pausar',
          handler: async () => {
            this.rutasService.pausarDiaRuta(this.diaRuta.id).subscribe({
              next: () => {
                this.diaRuta.estado = 'pausada';
                this.mostrarToast('Ruta pausada', 'warning');
                this.detenerSeguimiento();
                this.router.navigate(['/repartidor/rutas']);
              },
              error: (err) => {
                console.error('Error al pausar ruta:', err);
                this.mostrarToast('Error al pausar la ruta', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async finalizarRuta() {
    const visitados = this.clientesVisitadosCount;
    const total = this.clientesOrdenados.length;
    const vendidos = this.clientesCompletadosCount;
    const saltados = this.clientesSaltadosCount;

    const alert = await this.alertController.create({
      header: 'Finalizar Ruta',
      message: `
        <strong>Resumen:</strong><br>
        • Clientes visitados: ${visitados}/${total}<br>
        • Ventas realizadas: ${vendidos}<br>
        • Clientes saltados: ${saltados}<br><br>
        ¿Confirmas finalizar la ruta?
      `,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Finalizar',
          cssClass: 'alert-button-confirm',
          handler: async () => {
            this.rutasService.finalizarDiaRuta(this.diaRuta.id).subscribe({
              next: async () => {
                this.diaRuta.estado = 'completada';
                this.mostrarToast('¡Ruta completada!', 'success');
                this.detenerSeguimiento();

                if (this.vozHabilitada) {
                  await this.ttsService.anunciarFinRuta(visitados, total);
                }

                this.router.navigate(['/repartidor/rutas']);
              },
              error: (err) => {
                console.error('Error al finalizar ruta:', err);
                this.mostrarToast('Error al finalizar la ruta', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private detenerSeguimiento() {
    if (this.watchId) {
      this.geolocationService.stopWatching(this.watchId);
      this.watchId = null;
    }
  }

  // ========================================
  // OPTIMIZACIÓN DE RUTA
  // ========================================

  async optimizarRuta() {
    if (!this.ubicacionActual) return;

    this.mostrarToast('Optimizando ruta...', 'primary');

    const origen = {
      lat: this.ubicacionActual.latitude,
      lng: this.ubicacionActual.longitude
    };

    const clientesConUbicacion = this.clientesOrdenados.filter(cr =>
      cr.cliente?.latitud && cr.cliente?.longitud
    );

    const clientesSinUbicacion = this.clientesOrdenados.length - clientesConUbicacion.length;
    if (clientesSinUbicacion > 0) {
      console.warn(`${clientesSinUbicacion} clientes sin ubicación válida`);
      this.mostrarToast(`${clientesSinUbicacion} clientes sin ubicación`, 'warning');
    }

    if (clientesConUbicacion.length === 0) {
      this.mostrarToast('No hay clientes con ubicación válida', 'danger');
      return;
    }

    const destinos = clientesConUbicacion.map(cr => ({
      lat: cr.cliente.latitud,
      lng: cr.cliente.longitud
    }));

    try {
      const rutaOptimizada = await this.optimizacionService.optimizarRuta(origen, destinos);

      if (rutaOptimizada && rutaOptimizada.orden) {
        const nuevoOrden = rutaOptimizada.orden.map((idx: number) => clientesConUbicacion[idx]);

        const clientesSinDir = this.clientesOrdenados.filter(cr =>
          !cr.cliente?.latitud || !cr.cliente?.longitud
        );

        this.clientesOrdenados = [...nuevoOrden, ...clientesSinDir];
        this.dibujarRutaEnMapa(rutaOptimizada.polyline);
        this.actualizarClienteActual();

        if (rutaOptimizada.segmentos > 1) {
          this.mostrarToast(`Ruta optimizada (${rutaOptimizada.segmentos} segmentos)`, 'success');
        } else {
          this.mostrarToast('Ruta optimizada', 'success');
        }
      }
    } catch (error) {
      console.error('Error optimizando ruta:', error);
      this.mostrarToast('No se pudo optimizar, usando orden manual', 'warning');
      this.dibujarClientesEnMapa();
    }
  }

  // ========================================
  // DIBUJAR EN MAPA
  // ========================================

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
      const lat = cr.cliente.latitud;
      const lng = cr.cliente.longitud;

      if (!lat || !lng) return;

      const completado = cr.venta && (cr.venta.estado === 'realizado' || cr.venta.estado === 'saltado');
      const marker = L.marker([lat, lng], {
        icon: this.crearIconoCliente(idx + 1, completado)
      }).addTo(this.map!);

      marker.bindPopup(`
        <strong>${idx + 1}. ${cr.cliente.nombre}</strong><br>
        ${cr.cliente.calle}<br>
        ${cr.cliente.colonia}
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

    if (this.clienteActual && this.clienteActual.cliente.latitud && this.clienteActual.cliente.longitud) {
      this.marcadorClienteActual = L.circle(
        [this.clienteActual.cliente.latitud, this.clienteActual.cliente.longitud],
        {
          color: '#10dc60',
          fillColor: '#10dc60',
          fillOpacity: 0.2,
          radius: 50
        }
      ).addTo(this.map);
    }
  }

  dibujarClientesEnMapa() {
    if (!this.map) return;

    this.limpiarMapa();

    this.clientesOrdenados.forEach((cr, idx) => {
      const lat = cr.cliente.latitud;
      const lng = cr.cliente.longitud;

      if (!lat || !lng) return;

      const completado = cr.venta && (cr.venta.estado === 'realizado' || cr.venta.estado === 'saltado');
      const marker = L.marker([lat, lng], {
        icon: this.crearIconoCliente(idx + 1, completado)
      }).addTo(this.map!);

      marker.bindPopup(`
        <strong>${idx + 1}. ${cr.cliente.nombre}</strong><br>
        ${cr.cliente.calle}<br>
        ${cr.cliente.colonia}
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

  // ========================================
  // SEGUIMIENTO GPS
  // ========================================

  iniciarSeguimiento() {
    this.watchId = this.geolocationService.watchPosition((position: any) => {
      this.ubicacionActual = position;

      if (this.marcadorUsuario && this.map) {
        this.marcadorUsuario.setLatLng([position.latitude, position.longitude]);
      }

      this.calcularDistanciaYTiempo();

      this.verificarProximidadYAnunciar();
    });
  }

  calcularDistanciaYTiempo() {
    if (!this.ubicacionActual || !this.clienteActual) return;

    const lat = this.clienteActual.cliente.latitud;
    const lng = this.clienteActual.cliente.longitud;

    if (!lat || !lng) {
      this.distanciaAlCliente = 0;
      this.tiempoEstimado = 0;
      return;
    }

    this.distanciaAlCliente = this.geolocationService.calcularDistancia(
      this.ubicacionActual.latitude,
      this.ubicacionActual.longitude,
      lat,
      lng
    );

    this.tiempoEstimado = (this.distanciaAlCliente / 40) * 60;
  }

  private async verificarProximidadYAnunciar() {
    if (!this.vozHabilitada || !this.clienteActual) return;

    const distanciaMetros = this.distanciaAlCliente * 1000;

    if (distanciaMetros < 50 && this.ultimaDistanciaAnunciada >= 50) {
      await this.ttsService.anunciarLlegada(this.clienteActual.cliente.nombre);
    }
    else if (distanciaMetros < 200 && this.ultimaDistanciaAnunciada >= 200) {
      await this.ttsService.anunciarDistancia(distanciaMetros);
    }
    else if (distanciaMetros < 500 && this.ultimaDistanciaAnunciada >= 500) {
      await this.ttsService.anunciarDistancia(distanciaMetros);
    }

    this.ultimaDistanciaAnunciada = distanciaMetros;
  }

  // ========================================
  // ACTUALIZAR CLIENTE ACTUAL
  // ========================================

  actualizarClienteActual() {
    const noCompletado = this.clientesOrdenados.find(cr =>
      !cr.venta || cr.venta.estado === 'pendiente'
    );
    this.clienteActual = noCompletado || null;
    this.ventaActual = this.clienteActual?.venta || null;

    if (this.clienteActual) {
      const idx = this.clientesOrdenados.indexOf(this.clienteActual);
      this.proximosClientes = this.clientesOrdenados.slice(idx + 1, idx + 4);
    } else {
      this.proximosClientes = [];
    }

    this.calcularDistanciaYTiempo();
    this.ultimaDistanciaAnunciada = this.distanciaAlCliente * 1000;
  }

  // ========================================
  // ACCIONES DE VENTA
  // ========================================

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

      if (this.vozHabilitada) {
        await this.ttsService.anunciarVentaRegistrada(data.cantidad || 0);

        if (this.clienteActual) {
          await this.ttsService.anunciarCliente(
            this.clienteActual.cliente.nombre,
            `${this.clienteActual.cliente.calle}, ${this.clienteActual.cliente.colonia}`
          );
        }
      }
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

      if (this.vozHabilitada) {
        await this.ttsService.anunciarClienteSaltado();

        if (this.clienteActual) {
          await this.ttsService.anunciarCliente(
            this.clienteActual.cliente.nombre,
            `${this.clienteActual.cliente.calle}, ${this.clienteActual.cliente.colonia}`
          );
        }
      }
    }
  }

  // ========================================
  // NAVEGACIÓN A GOOGLE MAPS
  // ========================================

  abrirNavegacion() {
    if (!this.clienteActual) return;

    const lat = this.clienteActual.cliente.latitud;
    const lng = this.clienteActual.cliente.longitud;

    if (!lat || !lng) {
      this.mostrarToast('Este cliente no tiene ubicación registrada', 'warning');
      return;
    }

    const destino = `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destino}&travelmode=driving`;

    window.open(url, '_blank');
  }

  // ========================================
  // OTROS MODALES
  // ========================================

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

  // ========================================
  // HELPERS
  // ========================================

  toggleVoz() {
    this.vozHabilitada = !this.vozHabilitada;
    this.ttsService.setHabilitado(this.vozHabilitada);
    this.mostrarToast(
      this.vozHabilitada ? 'Indicaciones por voz activadas' : 'Indicaciones por voz desactivadas',
      'medium'
    );
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
    if (this.rutaIniciada && this.hayClientesPendientes) {
      this.pausarRuta();
    } else {
      this.router.navigate(['/repartidor/rutas']);
    }
  }
}