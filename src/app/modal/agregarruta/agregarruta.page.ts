import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { close, trash, arrowUndo, saveOutline, searchOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Auth } from 'src/app/service/auth'; 
import { RutaService } from 'src/app/service/ruta.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-agregarruta',
  templateUrl: './agregarruta.page.html',
  styleUrls: ['./agregarruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule],
})
export class AgregarrutaPage implements OnInit, AfterViewInit, OnDestroy {
  
  formRuta!: FormGroup;
  supervisores: any[] = [];
  repartidores: any[] = [];
  rutasExistentes: any[] = [];
  rutasConDiasFaltantes: any[] = [];
  modoCreacion: 'nueva' | 'agregar' = 'nueva';

  // ========================================
  // NUEVO: Gestión de clientes
  // ========================================
  clientesDisponibles: any[] = [];
  clientesSeleccionados: any[] = [];
  busquedaCliente: string = '';
  
 // 2. CORREGIR EL BUSCADOR (Getter)
  get clientesFiltrados() {
    if (!this.busquedaCliente.trim()) {
      return this.clientesDisponibles;
    }
    const busqueda = this.busquedaCliente.toLowerCase();
    return this.clientesDisponibles.filter(c => 
      // Buscamos por representante (representante es un representante viejo, mejor usa 'representante')
      (c.nombre || c.representante || '').toLowerCase().includes(busqueda) ||
      // Buscamos por calle directa
      (c.calle || '').toLowerCase().includes(busqueda)
    );
  }

  diasSemana = [
    { value: 'Lunes - Jueves', label: 'Lunes - Jueves' },
    { value: 'Martes - Viernes', label: 'Martes - Viernes' },
    { value: 'Miercoles - Sábado', label: 'Miércoles - Sábado' }
  ];

  // Leaflet
  private map: L.Map | null = null;
  private polyline: L.Polyline | null = null;
  private markers: L.Marker[] = [];

  constructor(
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private fb: FormBuilder,
    private authService: Auth,
    private rutasService: RutaService
  ) {
    addIcons({ 
      close, 'close-outline': close, 
      trash, 
      'arrow-undo': arrowUndo,
      'save-outline': saveOutline,
      'search-outline': searchOutline
    });
    
    this.formRuta = this.fb.group({
      rutaExistenteId: [null],
      nombre: [''],
      supervisorId: [null],
      repartidorId: [null],
      diaSemana: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRutasExistentes();
    this.cargarClientesDisponibles(); // NUEVO
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 200);
  }

  // ========================================
  // MAPA LEAFLET
  // ========================================

  initMap() {
    this.map = L.map('mapLeaflet').setView([17.0732, -96.7266], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // YA NO escuchamos clicks en el mapa
    // Los puntos vienen de seleccionar clientes
  }

  // ========================================
  // NUEVO: GESTIÓN DE CLIENTES
  // ========================================

 // 1. CORREGIR EL FILTRO DE CARGA
  cargarClientesDisponibles() {
    this.rutasService.obtenerClientesDisponibles().subscribe({
      next: (clientes) => {
        // AHORA VERIFICAMOS LOS CAMPOS DIRECTOS
        this.clientesDisponibles = clientes.filter(c => 
          c.latitud && c.longitud // Verificamos que tenga coordenadas directas
        );
        console.log('Clientes cargados:', this.clientesDisponibles);
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.mostrarToast('Error al cargar clientes', 'danger');
      }
    });
  }

 seleccionarCliente(cliente: any) {
    // Verificar que no esté ya seleccionado
    if (this.clientesSeleccionados.find(c => c.id === cliente.id)) {
      this.mostrarToast('Cliente ya está en la ruta', 'warning');
      return;
    }

    // Agregar a seleccionados
    this.clientesSeleccionados.push(cliente);

    // Agregar marcador al mapa
    this.agregarMarcadorCliente(cliente);

    // CORRECCIÓN AQUÍ: Usamos 'representante' en lugar de 'representante'
    this.mostrarToast(`${cliente.nombre} agregado`, 'success');
  }

// 3. CORREGIR EL MAPA (LEAFLET)
agregarMarcadorCliente(cliente: any) {
    if (!this.map) return;

    // CORRECCIÓN: Usamos coordenadas directas del cliente
    // (Asegúrate de que latitud/longitud sean números)
    const lat = Number(cliente.latitud);
    const lng = Number(cliente.longitud);
    
    // Si no tiene coordenadas válidas, no hacemos nada o mostramos error
    if (!lat || !lng) {
      this.mostrarToast(`El cliente ${cliente.representante} no tiene ubicación en el mapa`, 'warning');
      return;
    }

    const latlng = L.latLng(lat, lng);

    // Obtener letra según orden
    const letra = this.obtenerLetraMarcador(this.clientesSeleccionados.length - 1);

    // Crear marcador
    const marker = L.marker(latlng, {
      icon: this.crearIconoLetra(letra)
    }).addTo(this.map);

    // CORRECCIÓN DEL POPUP: Usamos 'representante', 'calle', 'colonia'
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong style="font-size: 14px;">${letra}. ${cliente.representante}</strong><br>
        <small>${cliente.calle}<br>${cliente.colonia}</small><br>
        <strong style="color: #3880ff;">$${cliente.tipoPrecio?.precioPorGarrafon || 'N/A'}</strong>
      </div>
    `);

    this.markers.push(marker);

    // Actualizar polyline
    this.actualizarPolyline();

    // Centrar mapa en el nuevo marcador
    this.map.setView(latlng, this.map.getZoom());
  }

  quitarCliente(index: number) {
    if (!this.map) return;

    // Quitar de array
    const clienteQuitado = this.clientesSeleccionados.splice(index, 1)[0];

    // Limpiar mapa y redibujar todo
    this.limpiarMapa();

    // Re-agregar todos los clientes restantes
    this.clientesSeleccionados.forEach(cliente => {
      this.agregarMarcadorClienteSinMensaje(cliente);
    });

    // CORRECCIÓN AQUÍ: Usamos 'representante'
    this.mostrarToast(`${clienteQuitado.representante} quitado`, 'warning');
  }

 private agregarMarcadorClienteSinMensaje(cliente: any) {
    if (!this.map) return;

    // CORRECCIÓN IGUAL QUE ARRIBA
    const lat = Number(cliente.latitud);
    const lng = Number(cliente.longitud);
    
    if (!lat || !lng) return;

    const latlng = L.latLng(lat, lng);
    const letra = this.obtenerLetraMarcador(
      this.clientesSeleccionados.indexOf(cliente)
    );

    const marker = L.marker(latlng, {
      icon: this.crearIconoLetra(letra)
    }).addTo(this.map);

    // CORRECCIÓN DEL POPUP
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong style="font-size: 14px;">${letra}. ${cliente.representante}</strong><br>
        <small>${cliente.calle}<br>${cliente.colonia}</small><br>
        <strong style="color: #3880ff;">$${cliente.tipoPrecio?.precioPorGarrafon || 'N/A'}</strong>
      </div>
    `);

    this.markers.push(marker);
    this.actualizarPolyline();
  }

  limpiarMapa() {
    if (!this.map) return;

    // Eliminar marcadores
    this.markers.forEach(marker => {
      this.map?.removeLayer(marker);
    });
    this.markers = [];

    // Eliminar polyline
    if (this.polyline) {
      this.map.removeLayer(this.polyline);
      this.polyline = null;
    }
  }

  limpiarTodo() {
    this.clientesSeleccionados = [];
    this.limpiarMapa();
    this.mostrarToast('Ruta limpiada', 'medium');
  }

  // ========================================
  // HELPERS DEL MAPA
  // ========================================

  crearIconoLetra(letra: string): L.DivIcon {
    return L.divIcon({
      html: `<div style="
        background-color: #3880ff;
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
      ">${letra}</div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

 // 4. CORREGIR LA LÍNEA DEL MAPA (POLYLINE)
 actualizarPolyline() {
    if (!this.map) return;

    if (this.polyline) {
      this.map.removeLayer(this.polyline);
    }

    if (this.clientesSeleccionados.length > 1) {
      const latlngs = this.clientesSeleccionados.map(cliente => {
        // CORRECCIÓN: Usar datos directos
        return L.latLng(Number(cliente.latitud), Number(cliente.longitud));
      });

      this.polyline = L.polyline(latlngs, {
        color: '#3880ff',
        weight: 4,
        opacity: 1
      }).addTo(this.map);
    }
  }

  obtenerLetraMarcador(index: number): string {
    return String.fromCharCode(65 + (index % 26));
  }

  // ========================================
  // USUARIOS Y RUTAS
  // ========================================

  cargarUsuarios() {
    this.authService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.supervisores = usuarios.filter(u => u.role === 'supervisor');
        this.repartidores = usuarios.filter(u => u.role === 'repartidor');
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  cargarRutasExistentes() {
    this.rutasService.obtenerTodasLasRutas().subscribe({
      next: (rutas) => {
        this.rutasExistentes = rutas;
        
        this.rutasConDiasFaltantes = rutas.filter(ruta => {
          const diasExistentes = ruta.diasRuta?.map((dr: any) => dr.diaSemana) || [];
          return diasExistentes.length < 3;
        }).map(ruta => {
          const diasExistentes = ruta.diasRuta?.map((dr: any) => dr.diaSemana) || [];
          const todosDias = ['Lunes - Jueves', 'Martes - Viernes', 'Miercoles - Sábado'];
          const diasFaltantes = todosDias.filter(dia => !diasExistentes.includes(dia));
          
          return {
            ...ruta,
            diasFaltantes: diasFaltantes
          };
        });
      },
      error: (err) => console.error('Error cargando rutas', err)
    });
  }

  onModoChange() {
    if (this.modoCreacion === 'nueva') {
      this.formRuta.get('rutaExistenteId')?.clearValidators();
      this.formRuta.get('nombre')?.setValidators([Validators.required]);
    } else {
      this.formRuta.get('nombre')?.clearValidators();
      this.formRuta.get('rutaExistenteId')?.setValidators([Validators.required]);
    }
    this.formRuta.get('rutaExistenteId')?.updateValueAndValidity();
    this.formRuta.get('nombre')?.updateValueAndValidity();
  }

  onRutaExistenteChange(event: any) {
    const rutaId = event.detail.value;
    const rutaSeleccionada = this.rutasConDiasFaltantes.find(r => r.id === rutaId);
    
    if (rutaSeleccionada) {
      this.mostrarToast(
        `Días disponibles: ${rutaSeleccionada.diasFaltantes.join(', ')}`, 
        'primary'
      );
    }
  }

  getDiasFaltantes(rutaId: number): string[] {
    const ruta = this.rutasConDiasFaltantes.find(r => r.id === rutaId);
    return ruta?.diasFaltantes || [];
  }

  // ========================================
  // GUARDAR RUTA
  // ========================================

  async agregarGrupo() {
    if (this.formRuta.invalid) {
      this.mostrarToast('Por favor completa los campos obligatorios', 'warning');
      this.formRuta.markAllAsTouched();
      return;
    }
    
    if (this.clientesSeleccionados.length === 0) {
      this.mostrarToast('Selecciona al menos un cliente', 'warning');
      return;
    }

    const formValues = this.formRuta.value;

    // Array de IDs de clientes en orden
    const clientesIds = this.clientesSeleccionados.map(c => c.id);

    // Caso 1: Agregar día a ruta existente
    if (this.modoCreacion === 'agregar' && formValues.rutaExistenteId) {
      await this.agregarDiaARutaExistente(formValues, clientesIds);
    } 
    // Caso 2: Crear nueva ruta con su primer día
    else {
      await this.crearNuevaRuta(formValues, clientesIds);
    }
  }


  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje, 
      duration: 2000, 
      position: 'top', 
      color: color
    });
    toast.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
  // En agregarruta.page.ts

  private async agregarDiaARutaExistente(formValues: any, clientesIds: number[]) {
    const diaRutaData = {
      rutaId: formValues.rutaExistenteId,
      diaSemana: formValues.diaSemana,
      clientesIds: clientesIds
    };

    this.rutasService.agregarDiaARuta(diaRutaData).subscribe({
      next: () => {
        // QUITAMOS EL TOAST DE AQUÍ ❌
        // Solo cerramos y enviamos 'true' (éxito)
        this.modalController.dismiss(true); 
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al agregar día de ruta', 'danger'); // El de error sí lo dejamos
      }
    });
  }

  private async crearNuevaRuta(formValues: any, clientesIds: number[]) {
    const rutaData = {
      nombre: formValues.nombre.toUpperCase(),
      supervisorId: formValues.supervisorId || null,
      repartidorId: formValues.repartidorId || null,
      diaSemana: formValues.diaSemana,
      clientesIds: clientesIds
    };

    this.rutasService.crearRutaConDia(rutaData).subscribe({
      next: () => {
        // QUITAMOS EL TOAST DE AQUÍ ❌
        // Solo cerramos y enviamos 'true' (éxito)
        this.modalController.dismiss(true);
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al crear la ruta', 'danger');
      }
    });
  }
}