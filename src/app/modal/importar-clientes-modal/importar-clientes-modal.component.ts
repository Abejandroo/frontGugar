// src/app/components/importar-clientes-modal/importar-clientes-modal.component.ts

import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import * as L from 'leaflet';
import { ImportService } from '../../service/import';
import { ClienteImport, ImportResult } from '../../models/excel-import.model.';

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
  imports: [IonicModule, CommonModule]
})
export class ImportarClientesModalComponent implements AfterViewInit {
  archivoSeleccionado: File | null = null;
  datosExcel: ClienteImport[] = [];
  mostrarVistaPrevia: boolean = false;
  supervisorDetectado: string = '';
  fechaReporte: string = '';
  loading: boolean = false;
  
  // Mapas por día de visita
  mapasRutas: MapaRuta[] = [];
  clienteSeleccionado: ClienteImport | null = null;
  
  private diasMap: { [key: string]: string[] } = {
    'LJ': ['Lunes', 'Jueves'],
    'MV': ['Martes', 'Viernes'],
    'IS': ['Miércoles', 'Sábado']
  };

  private columnIndexes = {
    vis: 0, rec: 1, colonia: 2, direccion: 3,
    representante: 4, negocio: 5, precio: 6,
    credito: 7, factura: 8, numeroCte: 9
  };

  constructor(
    private modalController: ModalController,
    private importService: ImportService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngAfterViewInit() {
    // Los mapas se inicializarán después de cargar los datos
  }

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
      this.supervisorDetectado = this.extraerSupervisor(jsonData);
      this.datosExcel = this.procesarDatosExcel(jsonData, this.supervisorDetectado);
      
      // Agrupar clientes por días de visita
      this.agruparClientesPorDias();
      
      this.mostrarVistaPrevia = true;

      await loading.dismiss();
      
      // Inicializar mapas después de que el DOM esté listo
      setTimeout(() => {
        this.inicializarMapas();
      }, 100);

      await this.mostrarToast(
        `✅ ${this.datosExcel.length} registros leídos correctamente`,
        'success'
      );
    } catch (error: any) {
      await loading.dismiss();
      await this.mostrarError(`Error: ${error.message}`);
    }
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

  private extraerSupervisor(data: any[][]): string {
    try {
      return String(data[2]?.[3] || 'Sin asignar').trim();
    } catch {
      return 'Sin asignar';
    }
  }

  private procesarDatosExcel(data: any[][], supervisor: string): ClienteImport[] {
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
          diasVisita: this.parsearDiasVisita(vis),
          ordenVisita: parseInt(String(row[this.columnIndexes.rec] || '0')),
          supervisor: supervisor
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

  private parsearDiasVisita(vis: string): string[] {
    return this.diasMap[vis.toUpperCase()] || [];
  }

  private convertirANumero(valor: string): number {
    const limpio = valor.replace(/[^0-9.]/g, '');
    const numero = parseFloat(limpio);
    return isNaN(numero) ? 0 : numero;
  }

  private agruparClientesPorDias() {
    const grupos: { [key: string]: ClienteImport[] } = {};

    this.datosExcel.forEach(cliente => {
      const key = cliente.diasVisita.sort().join('-');
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(cliente);
    });

    this.mapasRutas = Object.keys(grupos).map(key => ({
      dias: key.split('-').join(' - '),
      diasArray: key.split('-'),
      clientes: grupos[key].sort((a, b) => a.ordenVisita - b.ordenVisita)
    }));

    console.log('📊 Mapas agrupados:', this.mapasRutas);
  }

  private inicializarMapas() {
    // Configurar iconos de Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
    });

    this.mapasRutas.forEach((mapaRuta, index) => {
      const mapElement = document.getElementById(`map-${index}`);
      if (!mapElement) {
        console.error(`No se encontró el elemento map-${index}`);
        return;
      }

      // Generar coordenadas simuladas (en producción vendrán del backend)
      const clientesConCoords = this.asignarCoordenadasSimuladas(mapaRuta.clientes);

      // Crear el mapa
      const mapa = L.map(mapElement).setView([17.0732, -96.7266], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapa);

      const bounds = L.latLngBounds([]);

      // Agregar marcadores
      clientesConCoords.forEach((cliente, idx) => {
        const icono = this.crearIconoMarcador(idx + 1);
        
        const marker = L.marker([cliente.latitud!, cliente.longitud!], { icon: icono })
          .addTo(mapa)
          .on('click', () => {
            this.seleccionarCliente(cliente);
          });

        bounds.extend([cliente.latitud!, cliente.longitud!]);
      });

      // Dibujar línea de ruta
      if (clientesConCoords.length > 1) {
        const coordenadas = clientesConCoords.map(c => 
          L.latLng(c.latitud!, c.longitud!)
        );
        L.polyline(coordenadas, {
          color: '#3880ff',
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 5'
        }).addTo(mapa);
      }

      // Ajustar vista
      if (clientesConCoords.length > 0) {
        mapa.fitBounds(bounds, { padding: [30, 30] });
      }

      mapaRuta.mapa = mapa;

      // Invalidar tamaño después de un momento
      setTimeout(() => {
        mapa.invalidateSize();
      }, 200);
    });
  }

  private asignarCoordenadasSimuladas(clientes: ClienteImport[]): ClienteImport[] {
    // En producción, estas coordenadas vendrían de una API de geocodificación
    // Por ahora, generamos coordenadas simuladas alrededor de Oaxaca
    const baseLatitud = 17.0732;
    const baseLongitud = -96.7266;

    return clientes.map((cliente, index) => {
      // Generar coordenadas en un radio de ~5km
      const offsetLat = (Math.random() - 0.5) * 0.05;
      const offsetLng = (Math.random() - 0.5) * 0.05;

      return {
        ...cliente,
        latitud: baseLatitud + offsetLat,
        longitud: baseLongitud + offsetLng
      };
    });
  }

  private crearIconoMarcador(numero: number): L.DivIcon {
    return L.divIcon({
      html: `
        <div style="
          background-color: #3880ff;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        ">${numero}</div>
      `,
      iconSize: [32, 32],
      className: 'custom-marker-icon'
    });
  }

  seleccionarCliente(cliente: ClienteImport) {
    this.clienteSeleccionado = cliente;
    console.log('Cliente seleccionado:', cliente);

    // Scroll hacia la card del cliente
    setTimeout(() => {
      const cardElement = document.getElementById('cliente-card');
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  async editarUbicacion(cliente: ClienteImport) {
    const alert = await this.alertController.create({
      header: 'Editar Ubicación',
      message: 'Ingresa las nuevas coordenadas del cliente',
      inputs: [
        {
          name: 'latitud',
          type: 'number',
          placeholder: 'Latitud',
          value: cliente.latitud || ''
        },
        {
          name: 'longitud',
          type: 'number',
          placeholder: 'Longitud',
          value: cliente.longitud || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            const lat = parseFloat(data.latitud);
            const lng = parseFloat(data.longitud);

            if (isNaN(lat) || isNaN(lng)) {
              this.mostrarToast('Coordenadas inválidas', 'danger');
              return false;
            }

            cliente.latitud = lat;
            cliente.longitud = lng;
            this.mostrarToast('Ubicación actualizada', 'success');
            
            // Actualizar mapa
            this.inicializarMapas();
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarImportacion() {
    const alert = await this.alertController.create({
      header: 'Confirmar Importación',
      message: `
        <strong>¿Importar ${this.datosExcel.length} clientes?</strong><br><br>
        📍 Total visitas: ${this.calcularTotalVisitas()}<br>
        👤 Supervisor: ${this.supervisorDetectado}<br>
        📅 Fecha: ${this.fechaReporte}
      `,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Importar', handler: () => this.importarABaseDatos() }
      ]
    });
    await alert.present();
  }

  async importarABaseDatos() {
    this.loading = true;
    try {
      const resultado = await this.importService.importarClientes(
        this.datosExcel,
        this.supervisorDetectado,
        this.fechaReporte
      ).toPromise();

      this.loading = false;
      if (resultado && resultado.success) {
        await this.mostrarToast('✅ Importación exitosa', 'success');
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
    return this.datosExcel.reduce((sum, c) => sum + c.diasVisita.length, 0);
  }

  getDiasVisitaText(dias: string[]): string {
    return dias.join(' y ');
  }

  formatFileSize(bytes: number): string {
    return bytes < 1024 * 1024 
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  limpiarArchivo() {
    this.archivoSeleccionado = null;
    this.datosExcel = [];
    this.mapasRutas = [];
    this.clienteSeleccionado = null;
    this.mostrarVistaPrevia = false;
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      color, position: 'top'
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