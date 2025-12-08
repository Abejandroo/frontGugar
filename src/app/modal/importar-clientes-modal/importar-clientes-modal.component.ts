import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController, LoadingController, ToastController, IonModal } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as XLSX from 'xlsx';
import * as L from 'leaflet';
import { ImportService } from '../../service/import';
import { ClienteImport, ImportResult } from '../../models/excel-import.model';
import { CrearPrecioModalComponent } from '../crear-precio-modal/crear-precio-modal.component';
import { GeocodingService } from 'src/app/service/geocoding.service';

interface MapaRuta {
  dias: string;
  diasArray: string[];
  clientes: ClienteImport[];
  mapa?: L.Map;
}

@Component({
  selector: 'app-importar-clientes-modal',
  templateUrl: './importar-clientes-modal.component.html',
  styleUrls: ['./importar-clientes-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class ImportarClientesModalComponent implements AfterViewInit {


  @ViewChild('editModal') editModal!: IonModal;

  archivoSeleccionado: File | null = null;
  datosExcel: ClienteImport[] = [];
  mostrarVistaPrevia: boolean = false;
  fechaReporte: string = '';
  loading: boolean = false;

  tabSeleccionado: string = '0';

  mapasRutas: MapaRuta[] = [];
  clienteSeleccionado: ClienteImport | null = null;

  mostrarTodasCards: boolean = false;

  mostrarModalEdicion: boolean = false;
  clienteEnEdicion: ClienteImport | null = null;
  mapaEdicion?: L.Map;
  marcadorEdicion?: L.Marker;


  private diasMap: { [key: string]: string } = {
    'LJ': 'Lunes - Jueves',
    'LUN': 'Lunes - Jueves',
    'JUE': 'Lunes - Jueves',
    'MV': 'Martes - Viernes',
    'MAR': 'Martes - Viernes',
    'VIE': 'Martes - Viernes',
    'IS': 'Miércoles - Sábado',
    'MIE': 'Miércoles - Sábado',
    'SAB': 'Miércoles - Sábado',
    'DOM': 'Miércoles - Sábado'
  };

  private columnIndexes = {
    vis: 0,
    rec: 1,
    colonia: 2,
    direccion: 3,
    representante: 4,
    negocio: 5,
    precio: 6,
    credito: 7,
    factura: 8,
    numeroCte: 9
  };


  nombreRuta: string = '';
  supervisorId: number | null = null;
  repartidorId: number | null = null;
  preciosFaltantes: Array<{ precio: number, cantidad: number }> = [];
  supervisores: any[] = [];
  repartidores: any[] = [];
  verificandoPrecios: boolean = false;
  mostrarSeccionValidacion: boolean = true;
  constructor(
    private modalController: ModalController,
    private importService: ImportService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private geocodingService: GeocodingService
  ) { }

  ngAfterViewInit() {
  }

  // ========================================
  // LECTURA Y PROCESAMIENTO DE EXCEL
  // ========================================

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
      await this.mostrarError('Formato de archivo inválido. Use .xlsx, .xls o .csv');
      return;
    }

    this.archivoSeleccionado = file;
    await this.leerArchivoExcel(file);
  }

  async leerArchivoExcel(file: File) {
    const loading = await this.loadingController.create({
      message: 'Leyendo archivo...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const data = await this.leerArchivo(file);
      const workbook = XLSX.read(data, { type: 'binary' });
      const nombreHoja = workbook.SheetNames[0];
      const hoja = workbook.Sheets[nombreHoja];

      const jsonData: any[][] = XLSX.utils.sheet_to_json(hoja, {
        header: 1,
        defval: '',
        raw: false
      });

      if (jsonData.length < 6) {
        throw new Error('El archivo no tiene el formato esperado');
      }

      this.fechaReporte = this.extraerFecha(jsonData);
      this.datosExcel = this.procesarDatosExcel(jsonData);

      this.agruparClientesPorDias();

      await loading.dismiss();

      await this.agruparClientesPorDias();


      this.mostrarVistaPrevia = true;

      setTimeout(() => {
        const firstTab = this.mapasRutas[0];
        if (firstTab) {
          setTimeout(() => {
            this.inicializarMapaTab(0);
          }, 300);
        }
      }, 200);

      await this.mostrarToast(
        `${this.datosExcel.length} registros leídos correctamente`,
        'success'
      );

      await this.verificarDatosParaImportar();

    } catch (error: any) {
      await loading.dismiss();
      await this.mostrarError(`Error: ${error.message}`);
    }
  }


  async verificarDatosParaImportar() {
    this.verificandoPrecios = true;

    const preciosMap = new Map<number, number>();
    this.datosExcel.forEach(c => {
      preciosMap.set(c.precioGarrafon, (preciosMap.get(c.precioGarrafon) || 0) + 1);
    });

    this.preciosFaltantes = [];
    for (const [precio, cantidad] of preciosMap) {
      try {
        const existe = await this.importService.verificarPrecioExiste(precio).toPromise();
        if (!existe) {
          this.preciosFaltantes.push({ precio, cantidad });
        }
      } catch (error) {
        this.preciosFaltantes.push({ precio, cantidad });
      }
    }

    try {
      this.supervisores = await this.importService.getSupervisores().toPromise() || [];
      this.repartidores = await this.importService.getRepartidores().toPromise() || [];
    } catch (error) {
      console.error('Error cargando personal:', error);
    }

    this.verificandoPrecios = false;
  }

  async crearPrecio(precioInfo: { precio: number, cantidad: number }) {
    const modal = await this.modalController.create({
      component: CrearPrecioModalComponent,
      componentProps: {
        precio: precioInfo.precio,
        cantidad: precioInfo.cantidad
      },
      cssClass: 'crear-precio-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.creado) {
      this.preciosFaltantes = this.preciosFaltantes.filter(p => p.precio !== precioInfo.precio);
      await this.mostrarToast(`Precio $${precioInfo.precio} creado`, 'success');
    }
  }

  get puedeImportar(): boolean {
    return this.nombreRuta.trim().length > 0 &&
      this.preciosFaltantes.length === 0 &&
      !this.verificandoPrecios;
  }

  private leerArchivo(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  private extraerFecha(data: any[][]): string {
    try {
      return String(data[0]?.[10] || '').trim();
    } catch {
      return '';
    }
  }

  private procesarDatosExcel(data: any[][]): ClienteImport[] {
    const clientes: ClienteImport[] = [];

    for (let i = 5; i < data.length; i++) {
      const row = data[i];
      if (!row[this.columnIndexes.vis] || !row[this.columnIndexes.rec]) continue;

      try {
        const vis = String(row[this.columnIndexes.vis] || '').trim().toUpperCase();
        const negocioRaw = String(row[this.columnIndexes.negocio] || '').trim();
        const creditoRaw = String(row[this.columnIndexes.credito] || '').trim();
        const facturaRaw = String(row[this.columnIndexes.factura] || '').trim();

        const cliente: ClienteImport = {
          numeroCliente: String(row[this.columnIndexes.numeroCte] || '').trim(),
          nombreNegocio: negocioRaw === '.' ? undefined : negocioRaw,
          representante: String(row[this.columnIndexes.representante] || '').trim(),
          colonia: String(row[this.columnIndexes.colonia] || '').trim(),
          direccion: String(row[this.columnIndexes.direccion] || '').trim(),
          precioGarrafon: this.convertirANumero(String(row[this.columnIndexes.precio] || '0')),
          esCredito: creditoRaw.toUpperCase() === 'C',
          requiereFactura: facturaRaw.toUpperCase() === 'F',
          diasVisita: [this.parsearDiasVisita(vis)],
          ordenVisita: parseInt(String(row[this.columnIndexes.rec] || '0'))
        };

        if (cliente.numeroCliente && cliente.direccion && cliente.representante) {
          clientes.push(cliente);
        }
      } catch (error) {
        console.error(`Error en fila ${i + 1}:`, error);
      }
    }

    return clientes;
  }

  private parsearDiasVisita(vis: string): string {
    const visUpper = vis.toUpperCase().trim();
    return this.diasMap[visUpper] || 'Miércoles - Sábado';
  }

  private convertirANumero(valor: string): number {
    const limpio = valor.replace(/[^0-9.]/g, '');
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
  }

  // ========================================
  // AGRUPACIÓN Y MAPAS
  // ========================================

  private async agruparClientesPorDias() {
    const gruposFixed: { [key: string]: ClienteImport[] } = {
      'Lunes - Jueves': [],
      'Martes - Viernes': [],
      'Miércoles - Sábado': []
    };

    this.datosExcel.forEach(cliente => {
      const ruta = cliente.diasVisita[0];
      if (gruposFixed[ruta]) {
        gruposFixed[ruta].push(cliente);
      }
    });

    // Geocodificar ANTES de crear los mapas
    const todosClientes = Object.values(gruposFixed).reduce((acc, grupo) => {
      return acc.concat(grupo);
    }, [] as ClienteImport[]);
    await this.geocodificarClientes(todosClientes);

    // Crear mapas
    this.mapasRutas = Object.keys(gruposFixed)
      .filter(key => gruposFixed[key].length > 0)
      .map(key => {
        const clientes = gruposFixed[key];
        const clientesOrdenados = clientes.sort((a, b) => a.ordenVisita - b.ordenVisita);

        return {
          dias: key,
          diasArray: key.split('-'),
          clientes: clientesOrdenados
        };
      });

  }

  private async geocodificarClientes(clientes: ClienteImport[]): Promise<ClienteImport[]> {
    // Filtrar clientes que necesitan geocodificación
    const clientesSinCoords = clientes
      .map((c, index) => ({ cliente: c, index }))
      .filter(item => !item.cliente.latitud || !item.cliente.longitud);

    if (clientesSinCoords.length === 0) {
      return clientes;
    }

    // Crear loading
    const loading = await this.loadingController.create({
      message: 'Geocodificando direcciones... 0/' + clientesSinCoords.length,
      spinner: 'crescent'
    });
    await loading.present();

    // Preparar lote de direcciones
    const direcciones = clientesSinCoords.map(item => ({
      direccion: item.cliente.direccion,
      colonia: item.cliente.colonia,
      ciudad: item.cliente.ciudad || 'Oaxaca',
      index: item.index
    }));

    // Geocodificar con progreso
    const resultados = await this.geocodingService.geocodificarLote(
      direcciones,
      (current, total) => {
        loading.message = `Geocodificando direcciones... ${current}/${total}`;
      }
    );

    await loading.dismiss();

    // Asignar coordenadas (reales o simuladas como fallback)
    let geocodificadas = 0;
    let fallback = 0;

    clientes.forEach((cliente, index) => {
      if (!cliente.latitud || !cliente.longitud) {
        const coords = resultados.get(index);

        if (coords) {
          cliente.latitud = coords.lat;
          cliente.longitud = coords.lng;
          geocodificadas++;
        } else {
          const simuladas = this.geocodingService.generarCoordenadasSimuladas();
          cliente.latitud = simuladas.lat;
          cliente.longitud = simuladas.lng;
          fallback++;
        }
      }
    });

    console.log(`Geocodificadas: ${geocodificadas}, Simuladas: ${fallback}`);

    if (fallback > 0) {
      await this.mostrarToast(
        ` ${fallback} direcciones no se pudieron geocodificar`,
        'warning'
      );
    } else {
      await this.mostrarToast(
        `${geocodificadas} direcciones geocodificadas`,
        'success'
      );
    }

    return clientes;
  }

  // ========================================
  // MANEJO DE TABS Y MAPAS
  // ========================================

  cambiarTab(event: any) {
    const nuevoTab = event.detail.value;
    this.tabSeleccionado = nuevoTab;
    this.clienteSeleccionado = null;
    this.mostrarTodasCards = false;

    setTimeout(() => {
      const index = parseInt(nuevoTab);
      const mapaRuta = this.mapasRutas[index];

      if (!mapaRuta) return;

      if (mapaRuta.mapa) {
        try {
          mapaRuta.mapa.off();
          mapaRuta.mapa.remove();
        } catch (e) {
          console.warn('Error removiendo mapa:', e);
        }
        mapaRuta.mapa = undefined;
      }

      setTimeout(() => {
        this.inicializarMapaTab(index);
      }, 100);
    }, 50);
  }

  private inicializarMapaTab(index: number) {
    const mapaRuta = this.mapasRutas[index];
    const mapElement = document.getElementById(`map-${index}`);

    if (!mapElement) {
      console.error(`No se encontró el elemento map-${index}`);
      return;
    }

    // Limpiar cualquier mapa existente
    if (mapaRuta.mapa) {
      try {
        mapaRuta.mapa.off();
        mapaRuta.mapa.remove();
      } catch (e) {
        console.warn('Error limpiando mapa:', e);
      }
      mapaRuta.mapa = undefined;
    }

    this.configurarIconosLeaflet();

    const clientesConCoords = mapaRuta.clientes;

    // Crear mapa nuevo
    const mapa = L.map(mapElement, {
      center: [17.0732, -96.7266],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      preferCanvas: false
    });

    // Agregar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
      minZoom: 10
    }).addTo(mapa);

    const bounds = L.latLngBounds([]);

    clientesConCoords.forEach((cliente) => {
      if (!cliente.latitud || !cliente.longitud) {
        console.warn(`Cliente sin coordenadas: ${cliente.numeroCliente}`);
        return;
      }

      const icono = this.crearIconoMarcador(cliente.ordenVisita);

      L.marker([cliente.latitud, cliente.longitud], { icon: icono })
        .addTo(mapa)
        .bindPopup(`
          <strong>${cliente.ordenVisita}. ${cliente.direccion}</strong><br>
          <small>${cliente.colonia}</small>
        `)
        .on('click', () => {
          this.seleccionarClienteDesdeMapa(cliente);
        });

      bounds.extend([cliente.latitud, cliente.longitud]);
    });

    if (bounds.isValid()) {
      mapa.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15
      });
    }

    mapaRuta.mapa = mapa;

    setTimeout(() => {
      mapa.invalidateSize();
    }, 100);

    console.log(`Mapa ${index} inicializado con ${clientesConCoords.length} marcadores`);
  }

  private configurarIconosLeaflet() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });
  }

  private crearIconoMarcador(numero: number, seleccionado: boolean = false): L.DivIcon {
    const colorPrimario = '#0044AA';
    const colorSeleccionado = '#E50005';
    const color = seleccionado ? colorSeleccionado : colorPrimario;

    return L.divIcon({
      html: `
        <div class="custom-marker ${seleccionado ? 'selected' : ''}">
          <div class="marker-pin" style="background-color: ${color};">
            <div class="marker-number">${numero}</div>
          </div>
          <div class="marker-shadow"></div>
        </div>
      `,
      iconSize: [40, 50],
      iconAnchor: [20, 50],
      popupAnchor: [0, -50],
      className: ''
    });
  }

  // ========================================
  // SELECCIÓN DE CLIENTES
  // ========================================

  seleccionarClienteDesdeMapa(cliente: ClienteImport) {
    this.clienteSeleccionado = cliente;
    console.log('Cliente seleccionado desde mapa:', cliente);
  }

  seleccionarClienteDesdeCard(cliente: ClienteImport, mapaIndex: number) {
    this.clienteSeleccionado = cliente;
    console.log('Cliente seleccionado desde card:', cliente);

    const mapa = this.mapasRutas[mapaIndex].mapa;
    if (mapa && cliente.latitud && cliente.longitud) {
      mapa.setView([cliente.latitud, cliente.longitud], 16, {
        animate: true,
        duration: 0.5
      });
    }
  }

  cerrarSeleccion() {
    this.clienteSeleccionado = null;
  }

  // ========================================
  // VISTA DE CARDS
  // ========================================

  getClientesAMostrar(): ClienteImport[] {
    const clientes = this.mapasRutas[parseInt(this.tabSeleccionado)]?.clientes || [];
    return this.mostrarTodasCards ? clientes : clientes.slice(0, 3);
  }

  toggleVerTodasCards() {
    this.mostrarTodasCards = !this.mostrarTodasCards;
  }

  // ========================================
  // EDICIÓN DE DIRECCIONES
  // ========================================

  editarDireccion(cliente: ClienteImport, event: Event) {
    event.stopPropagation();

    this.clienteEnEdicion = JSON.parse(JSON.stringify(cliente));
    this.mostrarModalEdicion = true;

    setTimeout(() => {
      this.inicializarMapaEdicion();
    }, 300);
  }

  private inicializarMapaEdicion() {
    const mapElement = document.getElementById('edit-map');
    if (!mapElement || !this.clienteEnEdicion) return;

    this.configurarIconosLeaflet();

    const lat = this.clienteEnEdicion.latitud || 17.0732;
    const lng = this.clienteEnEdicion.longitud || -96.7266;

    this.mapaEdicion = L.map(mapElement).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.mapaEdicion);

    this.marcadorEdicion = L.marker([lat, lng], {
      draggable: true,
      icon: this.crearIconoMarcador(1, true)
    }).addTo(this.mapaEdicion);

    this.marcadorEdicion.on('dragend', () => {
      const pos = this.marcadorEdicion!.getLatLng();
      if (this.clienteEnEdicion) {
        this.clienteEnEdicion.latitud = pos.lat;
        this.clienteEnEdicion.longitud = pos.lng;
      }
    });

    setTimeout(() => {
      this.mapaEdicion?.invalidateSize();
    }, 200);
  }

  actualizarMapaEdicion() {
    if (!this.mapaEdicion || !this.marcadorEdicion || !this.clienteEnEdicion) return;

    const lat = this.clienteEnEdicion.latitud || 17.0732;
    const lng = this.clienteEnEdicion.longitud || -96.7266;

    this.marcadorEdicion.setLatLng([lat, lng]);
    this.mapaEdicion.setView([lat, lng], 15);
  }

  async guardarEdicion() {
    if (!this.clienteEnEdicion) return;

    // Validar coordenadas
    if (!this.clienteEnEdicion.latitud || !this.clienteEnEdicion.longitud) {
      await this.mostrarToast('Por favor ingrese coordenadas válidas', 'warning');
      return;
    }

    // Buscar el cliente original y actualizar sus datos
    const clienteOriginal = this.datosExcel.find(
      c => c.numeroCliente === this.clienteEnEdicion!.numeroCliente
    );

    if (clienteOriginal) {
      clienteOriginal.direccion = this.clienteEnEdicion.direccion;
      clienteOriginal.colonia = this.clienteEnEdicion.colonia;
      clienteOriginal.latitud = this.clienteEnEdicion.latitud;
      clienteOriginal.longitud = this.clienteEnEdicion.longitud;

      await this.mostrarToast('Dirección actualizada', 'success');

      // Encontrar el índice de la ruta que contiene este cliente
      const rutaIndex = this.mapasRutas.findIndex(mr =>
        mr.clientes.some(c => c.numeroCliente === clienteOriginal.numeroCliente)
      );

      if (rutaIndex !== -1) {
        const mapaRuta = this.mapasRutas[rutaIndex];

        // Destruir mapa existente
        if (mapaRuta.mapa) {
          mapaRuta.mapa.remove();
          mapaRuta.mapa = undefined;
        }

        // Reinicializar mapa con los datos actualizados
        setTimeout(() => {
          this.inicializarMapaTab(rutaIndex);

          if (this.clienteSeleccionado?.numeroCliente === clienteOriginal.numeroCliente) {
            this.clienteSeleccionado = clienteOriginal;
          }
        }, 100);
      }
    }

    this.cerrarModalEdicion();
  }

  cerrarModalEdicion() {
    this.mostrarModalEdicion = false;

    // Limpiar mapa de edición
    if (this.mapaEdicion) {
      this.mapaEdicion.remove();
      this.mapaEdicion = undefined;
      this.marcadorEdicion = undefined;
    }

    this.clienteEnEdicion = null;
  }

  // ========================================
  // IMPORTACIÓN A BASE DE DATOS
  // ========================================

  async confirmarImportacion() {
    if (!this.puedeImportar) {
      console.log('no se puede');

      await this.mostrarToast('Completa todos los campos requeridos', 'warning');
      return;
    }

    await this.importarABaseDatos();

  }


  async importarABaseDatos() {
    this.loading = true;
    try {
      console.log('datos para enviar', this.datosExcel, 'fecha',
        this.fechaReporte, 'nombre ruta',
        this.nombreRuta, 'supervisorId',
        this.supervisorId, 'repartidorId',
        this.repartidorId);


      const resultado = await this.importService.importarClientes(
        this.datosExcel,
        this.fechaReporte,
        this.nombreRuta,
        this.supervisorId || undefined,
        this.repartidorId || undefined
      ).toPromise();

      this.loading = false;

      if (resultado && resultado.success) {
        await this.mostrarToast('Importación exitosa', 'success');
        this.modalController.dismiss({ success: true, data: resultado });
      } else {
        await this.mostrarError(resultado?.message || 'Error en la importación');
      }
    } catch (error: any) {
      this.loading = false;
      await this.mostrarError(`Error: ${error.message}`);
    }
  }


  calcularTotalVisitas(): number {
    return this.datosExcel.length;
  }

  getDiasVisitaText(dias: string[]): string {
    return dias.join(' y ');
  }

  limpiarArchivo() {
    // Destruir mapas
    this.mapasRutas.forEach(mr => {
      if (mr.mapa) {
        mr.mapa.remove();
      }
    });

    this.archivoSeleccionado = null;
    this.datosExcel = [];
    this.mapasRutas = [];
    this.clienteSeleccionado = null;
    this.mostrarVistaPrevia = false;
    this.tabSeleccionado = '0';
  }

  cerrarModal() {
    this.mapasRutas.forEach(mr => {
      if (mr.mapa) {
        mr.mapa.remove();
      }
    });

    this.modalController.dismiss();
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}