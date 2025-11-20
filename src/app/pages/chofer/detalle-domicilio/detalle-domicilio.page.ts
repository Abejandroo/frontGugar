import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Geolocation } from '@capacitor/geolocation';
import { Domicilio } from '../../../models/domicilio.models';
import { DomicilioService } from '../../../services/domicilio.service';

import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

@Component({
  selector: 'app-detalle-domicilio',
  templateUrl: './detalle-domicilio.page.html',
  styleUrls: ['./detalle-domicilio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetalleDomicilioPage implements OnInit, AfterViewInit {
  @ViewChild('map', { static: false }) mapElement!: ElementRef;

  map: L.Map | undefined;
  domicilioActual: Domicilio | null = null;
  siguientesDomicilios: Domicilio[] = [];
  todosDomicilios: Domicilio[] = [];
  cantidadVendida: number = 0;
  loading: boolean = false;
  mapaInicializado: boolean = false;

  // Nuevas propiedades para navegación
  mostrarTodosLosPuntos: boolean = false;
  ubicacionActual: L.LatLng | null = null;
  marcadorUsuario: L.Marker | undefined;
  routingControl: any;
  distanciaAlSiguiente: string = '';
  tiempoEstimado: string = '';
  watchId: string | null = null;

  motivosSalto = [
    'Cliente no se encontraba',
    'Negocio cerrado',
    'No tiene dinero',
    'Ya no necesita',
    'Dirección incorrecta',
    'Otro'
  ];

  weekDays: { label: string; date: string }[] = [];
  selectedDay!: string;

  constructor(
    private domicilioService: DomicilioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.configurarIconosLeaflet();

    // Configurar días de la semana
    const startOfWeek = dayjs().startOf('week').add(0, 'day');
    for (let i = 0; i < 6; i++) {
      const date = startOfWeek.add(i, 'day');
      this.weekDays.push({
        label: date.format('ddd DD'),
        date: date.format('YYYY-MM-DD'),
      });
    }
    this.selectedDay = this.weekDays[0].date;

    // Cargar datos
    this.cargarTodosDomicilios();
    this.cargarSiguientesDomicilios();
    this.cargarDomicilioActual(); // Este inicializará el mapa cuando tenga datos
  }

  ngAfterViewInit() {
    console.log('🎬 Vista completamente cargada');
    console.log('📦 Map element disponible:', !!this.mapElement);
  }

  configurarIconosLeaflet() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }

  onDayChange(event: any) {
    console.log('Día seleccionado:', event.detail.value);
  }

  ionViewWillLeave() {
    this.detenerTracking();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.mapaInicializado = false;
    }
  }

  cargarDomicilioActual() {
    this.domicilioService.getDomicilioActual().subscribe(domicilio => {
      console.log('✅ Domicilio cargado del servicio:', domicilio);
      this.domicilioActual = domicilio;

      // Inicializar mapa cuando tengamos datos Y el elemento esté disponible
      if (domicilio && this.mapElement && !this.mapaInicializado) {
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
          this.initMap();
        }, 300);
      }
    });
  }

  cargarSiguientesDomicilios() {
    this.domicilioService.getSiguientesDomicilios(3).subscribe(domicilios => {
      this.siguientesDomicilios = domicilios;
      console.log('✅ Siguientes domicilios cargados:', domicilios.length);
    });
  }

  cargarTodosDomicilios() {
    this.domicilioService.getAllDomiciliosParaMapa().subscribe(domicilios => {
      this.todosDomicilios = domicilios;
      console.log('✅ Todos los domicilios cargados:', domicilios.length);
    });
  }

  async initMap() {
    if (this.mapaInicializado) {
      console.log('⚠️ Mapa ya inicializado');
      return;
    }

    console.log('🗺️ Iniciando mapa...');
    console.log('📍 Domicilio actual:', this.domicilioActual);
    console.log('📦 Map element:', this.mapElement);

    if (!this.domicilioActual) {
      console.error('❌ No hay domicilio actual');
      return;
    }

    if (!this.mapElement || !this.mapElement.nativeElement) {
      console.error('❌ No se encuentra el elemento del mapa');
      // Reintentar después de un tiempo
      setTimeout(() => this.initMap(), 200);
      return;
    }

    const lat = this.domicilioActual.latitud;
    const lng = this.domicilioActual.longitud;

    console.log('📌 Coordenadas:', { lat, lng });

    try {
      this.map = L.map(this.mapElement.nativeElement).setView([lat, lng], 15);
      console.log('✅ Mapa creado');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);
      console.log('✅ Tiles agregados');

      // Marcar como inicializado
      this.mapaInicializado = true;

      // Invalidar tamaño después de que todo esté listo
      setTimeout(() => {
        this.map?.invalidateSize();
        console.log('✅ Tamaño invalidado');
      }, 200);

      await this.obtenerUbicacionActual();
      this.actualizarMapa();
      console.log('✅ Mapa completamente inicializado');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
    }
  }


  async obtenerUbicacionActual() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.ubicacionActual = L.latLng(
        position.coords.latitude,
        position.coords.longitude
      );
      this.agregarMarcadorUsuario();
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      await this.mostrarToast('No se pudo obtener tu ubicación', 'warning');
    }
  }

  agregarMarcadorUsuario() {
    if (!this.map || !this.ubicacionActual) return;

    // Remover marcador anterior si existe
    if (this.marcadorUsuario) {
      this.map.removeLayer(this.marcadorUsuario);
    }

    // Icono personalizado para el usuario
    const iconoUsuario = L.divIcon({
      html: '<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(33,150,243,0.5);"></div>',
      iconSize: [20, 20],
      className: 'usuario-marker'
    });

    this.marcadorUsuario = L.marker(this.ubicacionActual, { icon: iconoUsuario })
      .addTo(this.map)
      .bindPopup('Tu ubicación');
  }

  async iniciarTracking() {
    try {
      this.watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
        (position) => {
          if (position) {
            this.ubicacionActual = L.latLng(
              position.coords.latitude,
              position.coords.longitude
            );
            this.agregarMarcadorUsuario();
            this.calcularDistanciaYTiempo();
          }
        }
      );
    } catch (error) {
      console.error('Error iniciando tracking:', error);
    }
  }

  detenerTracking() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }

  calcularDistanciaYTiempo() {
    if (!this.ubicacionActual || !this.domicilioActual) return;

    const destino = L.latLng(
      this.domicilioActual.latitud,
      this.domicilioActual.longitud
    );

    // Distancia en línea recta (en metros)
    const distancia = this.ubicacionActual.distanceTo(destino);

    // Formatear distancia
    if (distancia < 1000) {
      this.distanciaAlSiguiente = `${Math.round(distancia)}m`;
    } else {
      this.distanciaAlSiguiente = `${(distancia / 1000).toFixed(1)}km`;
    }

    // Estimar tiempo (asumiendo velocidad promedio de 30 km/h en ciudad)
    const tiempoMinutos = Math.round((distancia / 1000) / 30 * 60);
    this.tiempoEstimado = `${tiempoMinutos} min`;
  }

  actualizarMapa() {
    if (!this.map) return;

    // Limpiar marcadores previos (excepto el del usuario)
    this.map.eachLayer(layer => {
      if (layer instanceof L.Marker && layer !== this.marcadorUsuario) {
        this.map?.removeLayer(layer);
      }
    });

    // Limpiar rutas previas
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }

    if (this.mostrarTodosLosPuntos) {
      this.mostrarTodosPuntos();
    } else {
      this.mostrarSoloPuntoActual();
    }

    this.calcularDistanciaYTiempo();
  }

  mostrarSoloPuntoActual() {
    if (!this.map || !this.domicilioActual) return;

    const iconoActual = this.crearIconoPorEstado('actual');

    L.marker([this.domicilioActual.latitud, this.domicilioActual.longitud], {
      icon: iconoActual
    })
      .addTo(this.map)
      .bindPopup(this.crearPopupContent(this.domicilioActual));

    this.map.setView([this.domicilioActual.latitud, this.domicilioActual.longitud], 15);
  }

  mostrarTodosPuntos() {
    if (!this.map || this.todosDomicilios.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Agregar marcador del usuario a los bounds
    if (this.ubicacionActual) {
      bounds.extend(this.ubicacionActual);
    }

    // Agregar todos los marcadores
    this.todosDomicilios.forEach((domicilio, index) => {
      const icono = this.crearIconoPorEstado(domicilio.estado);
      const marker = L.marker([domicilio.latitud, domicilio.longitud], { icon: icono })
        .addTo(this.map!)
        .bindPopup(this.crearPopupContent(domicilio));

      bounds.extend([domicilio.latitud, domicilio.longitud]);
    });

    // Ajustar el mapa para mostrar todos los puntos
    this.map.fitBounds(bounds, { padding: [50, 50] });

    // Dibujar línea de ruta
    this.dibujarLineaRuta();
  }

  dibujarLineaRuta() {
    if (!this.map) return;

    // Filtrar solo pendientes y actual, ordenados
    const puntosRuta = this.todosDomicilios
      .filter(d => d.estado === 'pendiente' || d.estado === 'actual')
      .sort((a, b) => a.orden - b.orden)
      .map(d => L.latLng(d.latitud, d.longitud));

    if (puntosRuta.length < 2) return;

    // Dibujar línea simple
    L.polyline(puntosRuta, {
      color: '#3880ff',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(this.map);
  }

  async iniciarNavegacion() {
    if (!this.map || !this.domicilioActual || !this.ubicacionActual) {
      await this.mostrarToast('Esperando ubicación GPS...', 'warning');
      return;
    }

    // Limpiar ruta anterior
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    const destino = L.latLng(
      this.domicilioActual.latitud,
      this.domicilioActual.longitud
    );

    // Crear control de routing con OSRM
    this.routingControl = (L as any).Routing.control({
      waypoints: [
        this.ubicacionActual,
        destino
      ],
      router: (L as any).Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#3880ff', weight: 6, opacity: 0.8 }]
      },
      createMarker: () => null, // No crear marcadores adicionales
    }).addTo(this.map);

    // Escuchar el evento cuando se calcula la ruta
    this.routingControl.on('routesfound', (e: any) => {
      const routes = e.routes;
      const summary = routes[0].summary;

      // Actualizar distancia y tiempo
      this.distanciaAlSiguiente = `${(summary.totalDistance / 1000).toFixed(1)}km`;
      this.tiempoEstimado = `${Math.round(summary.totalTime / 60)} min`;

      console.log('Ruta encontrada:', summary);
    });

    // Iniciar tracking en tiempo real
    await this.iniciarTracking();

    await this.mostrarToast('Navegación iniciada', 'success');
  }

  detenerNavegacion() {
    if (this.routingControl && this.map) {
      this.map.removeControl(this.routingControl);
      this.routingControl = null;
    }
    this.detenerTracking();
    this.mostrarToast('Navegación detenida', 'medium');
  }

  toggleVistaCompleta() {
    this.mostrarTodosLosPuntos = !this.mostrarTodosLosPuntos;
    this.actualizarMapa();
  }

  crearIconoPorEstado(estado: string): L.DivIcon {
    let color = '#FFA726'; // Amarillo por defecto (pendiente)
    let size = 25;

    switch (estado) {
      case 'actual':
        color = '#3880ff'; // Azul
        size = 35;
        break;
      case 'realizado':
        color = '#4CAF50'; // Verde
        break;
      case 'saltado':
        color = '#F44336'; // Rojo
        break;
    }

    const border = estado === 'actual' ? 'border: 4px solid #1565c0;' : 'border: 3px solid white;';

    return L.divIcon({
      html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; ${border} box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [size, size],
      className: 'custom-div-icon'
    });
  }

  crearPopupContent(domicilio: Domicilio): string {
    let estadoHTML = '';

    if (domicilio.estado === 'realizado' && domicilio.cantidadVendida) {
      estadoHTML = `<div style="color: #4CAF50; font-weight: bold; margin-top: 5px;">✓ ${domicilio.cantidadVendida} garrafones vendidos</div>`;
    } else if (domicilio.estado === 'saltado' && domicilio.motivoSalto) {
      estadoHTML = `<div style="color: #F44336; font-weight: bold; margin-top: 5px;">✗ ${domicilio.motivoSalto}</div>`;
    }

    return `
      <div style="min-width: 200px;">
        <strong>${domicilio.nombreNegocio || domicilio.nombreCliente}</strong><br>
        <small>${domicilio.direccion}</small><br>
        <div style="margin-top: 5px;">
          <strong>$${domicilio.precioGarrafon}</strong> x garrafón
        </div>
        ${estadoHTML}
      </div>
    `;
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
        this.detenerNavegacion();
        this.cargarDomicilioActual();
        this.cargarSiguientesDomicilios();
        this.cargarTodosDomicilios();
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
        this.detenerNavegacion();
        this.cargarDomicilioActual();
        this.cargarSiguientesDomicilios();
        this.cargarTodosDomicilios();
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