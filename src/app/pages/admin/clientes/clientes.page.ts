// src/app/pages/clientes/clientes.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ActionSheetController, ToastController } from '@ionic/angular';
import { ClienteService } from 'src/app/service/cliente.service';
import { addIcons } from 'ionicons';
import { 
  add, searchOutline, peopleOutline, callOutline, 
  ellipsisVertical, trashOutline, createOutline, close, 
  trash, create, pricetagOutline, mapOutline, personOutline,
  calendarOutline, listOutline
} from 'ionicons/icons';
import { AgregarClientePage } from 'src/app/modal/agregar-cliente/agregar-cliente.page';
import { EditarClientePage } from 'src/app/modal/editar-cliente/editar-cliente.page';
import { AdminNavbarComponent } from "src/app/components/admin-navbar/admin-navbar.component";
import { 
  ClientesAgrupados, 
  RutaConClientes, 
  ClienteConRuta,
  DiaRutaConClientes
} from '../../../models/clientes-agrupados.interface';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AdminNavbarComponent]
})
export class ClientesPage implements OnInit {

  // Segmento principal
  segmentoActivo: 'asignados' | 'noAsignados' = 'asignados';
  
  // Datos agrupados
  datosAgrupados: ClientesAgrupados | null = null;
  
  // Para filtrado
  terminoBusqueda: string = '';
  
  // Ruta seleccionada para mostrar detalles
  rutaSeleccionada: RutaConClientes | null = null;
  diaSeleccionado: string = 'Lunes-Jueves';
  
  // Búsqueda de clientes dentro de la ruta
  busquedaClientesRuta: string = '';
  
  cargando: boolean = true;

  constructor(
    private clienteService: ClienteService,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      add, searchOutline, peopleOutline, callOutline, 
      ellipsisVertical, trashOutline, createOutline, close, 
      trash, create, pricetagOutline, mapOutline, personOutline,
      calendarOutline, listOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.clienteService.obtenerClientesAgrupados().subscribe({
      next: (datos) => {
        this.datosAgrupados = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar clientes agrupados:', err);
        this.cargando = false;
      }
    });
  }

  // Cambiar segmento principal
  cambiarSegmento(event: any) {
    this.segmentoActivo = event.detail.value;
    this.rutaSeleccionada = null;
    this.terminoBusqueda = '';
  }

  // Seleccionar una ruta para ver sus clientes
  seleccionarRuta(ruta: RutaConClientes) {
    this.rutaSeleccionada = ruta;
    // Seleccionar el primer día disponible
    if (ruta.diasRuta.length > 0) {
      this.diaSeleccionado = ruta.diasRuta[0].diaSemana;
    }
  }

  // Volver a la lista de rutas
  volverARutas() {
    this.rutaSeleccionada = null;
    this.terminoBusqueda = '';
    this.busquedaClientesRuta = ''; // Limpiar búsqueda de clientes
  }

  // Cambiar día de visita
  cambiarDia(event: any) {
    this.diaSeleccionado = event.detail.value;
    this.busquedaClientesRuta = ''; // Limpiar búsqueda al cambiar de día
  }

  // Buscar clientes dentro de la ruta
  buscarClienteEnRuta(event: any) {
    this.busquedaClientesRuta = event.target.value?.toLowerCase() || '';
  }

  // Obtener clientes del día seleccionado
  get clientesDelDiaSeleccionado(): ClienteConRuta[] {
    if (!this.rutaSeleccionada) return [];
    const dia = this.rutaSeleccionada.diasRuta.find(d => d.diaSemana === this.diaSeleccionado);
    
    if (!dia) return [];
    
    // Aplicar filtro de búsqueda
    if (!this.busquedaClientesRuta) {
      return dia.clientes;
    }

    const termino = this.busquedaClientesRuta.toLowerCase();
    return dia.clientes.filter(c => 
      c.nombre.toLowerCase().includes(termino) || 
      (c.negocio && c.negocio.toLowerCase().includes(termino)) ||
      (c.telefono && c.telefono.includes(termino))
    );
  }

  // Obtener clientes no asignados filtrados
  get clientesNoAsignadosFiltrados(): ClienteConRuta[] {
    if (!this.datosAgrupados) return [];
    
    if (!this.terminoBusqueda) {
      return this.datosAgrupados.noAsignados;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    return this.datosAgrupados.noAsignados.filter(c => 
      c.nombre.toLowerCase().includes(termino) || 
      (c.telefono && c.telefono.includes(termino)) ||
      (c.negocio && c.negocio.toLowerCase().includes(termino))
    );
  }

  // Obtener rutas filtradas
  get rutasFiltradas(): RutaConClientes[] {
    if (!this.datosAgrupados) return [];
    
    if (!this.terminoBusqueda) {
      return this.datosAgrupados.asignados;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    return this.datosAgrupados.asignados.filter(r => 
      r.nombre.toLowerCase().includes(termino) ||
      r.numeroRuta.toLowerCase().includes(termino)
    );
  }

  // Buscar
  buscar(event: any) {
    this.terminoBusqueda = event.target.value?.toLowerCase() || '';
  }

  // Obtener iniciales
  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    const partes = nombre.split(' ');
    return partes.length >= 2 
      ? (partes[0][0] + partes[1][0]).toUpperCase() 
      : nombre.substring(0, 2).toUpperCase();
  }

  // Modal crear cliente
  async abrirModalCrear() {
    const modal = await this.modalCtrl.create({
      component: AgregarClientePage
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.registrado) this.cargarDatos();
  }

  // Modal editar cliente
  async abrirModalEditar(cliente: ClienteConRuta) {
    const modal = await this.modalCtrl.create({
      component: EditarClientePage,
      componentProps: { cliente }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.actualizado) this.cargarDatos();
  }

  // Confirmar eliminación
  async confirmarEliminar(cliente: ClienteConRuta) {
    const toast = await this.toastCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Borrar a ${cliente.nombre}?`,
      position: 'bottom',
      color: 'dark',
      duration: 4000,
      buttons: [
        {
          side: 'start',
          icon: 'close',
          role: 'cancel',
          handler: () => { console.log('Cancelado'); }
        },
        {
          text: 'ELIMINAR',
          side: 'end',
          icon: 'trash',
          handler: () => {
            this.eliminar(cliente.id);
          }
        }
      ]
    });
    await toast.present();
  }

  // Eliminar cliente
  eliminar(id: number) {
    this.cargando = true;
    this.clienteService.eliminarCliente(id).subscribe({
      next: async () => {
        this.cargando = false;
        const toastExito = await this.toastCtrl.create({
          message: 'Cliente eliminado correctamente',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        toastExito.present();
        this.cargarDatos();
      },
      error: async (err) => {
        this.cargando = false;
        console.error(err);
        const toastError = await this.toastCtrl.create({
          message: 'No se pudo eliminar. Verifica si tiene pedidos.',
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        toastError.present();
      }
    });
  }

  // Obtener color del badge de día
  getColorDia(dia: string): string {
    const colores: { [key: string]: string } = {
      'Lunes-Jueves': 'primary',
      'Martes-Viernes': 'success',
      'Miércoles-Sábado': 'warning'
    };
    return colores[dia] || 'medium';
  }
}