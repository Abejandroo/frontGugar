import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular';
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { ClienteService } from 'src/app/service/cliente.service';
import { addIcons } from 'ionicons';
import {
  searchOutline, mapOutline, personOutline, callOutline,
  createOutline, listOutline, arrowBackOutline, calendarOutline,
  add, trashOutline, close, trash
} from 'ionicons/icons';
import { EditarClientePage } from 'src/app/modal/editar-cliente/editar-cliente.page';
import { AgregarClientePage } from 'src/app/modal/agregar-cliente/agregar-cliente.page';
import {
  ClientesAgrupados,
  RutaConClientes,
  ClienteConRuta,
  DiaRutaConClientes
} from '../../models/clientes-agrupados.interface';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  standalone: true,
  imports: [CommonModule, SupervisorNavbarComponent, ...IonicSharedComponents],
  providers: [...IonicControllers]
})
export class ClientesComponent implements OnInit {

  supervisorId: number = 0;
  supervisorNombre: string = '';

  datosAgrupados: ClientesAgrupados | null = null;

  rutaSeleccionada: RutaConClientes | null = null;
  diaSeleccionado: string = 'Lunes-Jueves';

  terminoBusqueda: string = '';
  busquedaClientesRuta: string = '';

  cargando: boolean = true;

  constructor(
    private clienteService: ClienteService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      searchOutline, mapOutline, personOutline, callOutline,
      createOutline, listOutline, arrowBackOutline, calendarOutline,
      add, trashOutline, close, trash
    });
  }

  ngOnInit() {
    this.cargarDatosSupervisor();
    this.cargarRutas();
  }

  cargarDatosSupervisor() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.supervisorId = usuario.id;
      this.supervisorNombre = usuario.name || usuario.nombre || 'Supervisor';
    }
  }

  cargarRutas() {
    if (!this.supervisorId) {
      this.mostrarToast('No se pudo identificar al supervisor', 'danger');
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.clienteService.obtenerRutasDeSupervisor(this.supervisorId).subscribe({
      next: (datos) => {

        console.log('✅ Datos recibidos del backend:', datos);
      console.log('📊 Cantidad de rutas asignadas:', datos.asignados?.length || 0);
      console.log('📊 Total clientes asignados:', datos.totalAsignados);
        this.datosAgrupados = datos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar rutas del supervisor:', err);
        this.cargando = false;
        this.mostrarToast('Error al cargar las rutas', 'danger');
      }
    });
  }

  seleccionarRuta(ruta: RutaConClientes) {
    this.rutaSeleccionada = ruta;
    if (ruta.diasRuta.length > 0) {
      this.diaSeleccionado = ruta.diasRuta[0].diaSemana;
    }
  }

  volverARutas() {
    this.rutaSeleccionada = null;
    this.terminoBusqueda = '';
    this.busquedaClientesRuta = '';
  }

  cambiarDia(event: any) {
    this.diaSeleccionado = event.detail.value;
    this.busquedaClientesRuta = '';
  }

  buscar(event: any) {
    this.terminoBusqueda = event.target.value?.toLowerCase() || '';
  }

  buscarClienteEnRuta(event: any) {
    this.busquedaClientesRuta = event.target.value?.toLowerCase() || '';
  }

  get rutasFiltradas(): RutaConClientes[] {
    if (!this.datosAgrupados) return [];

    if (!this.terminoBusqueda) {
      return this.datosAgrupados.asignados;
    }

    const termino = this.terminoBusqueda.toLowerCase();
    return this.datosAgrupados.asignados.filter(r =>
      r.nombre.toLowerCase().includes(termino) ||
      r.numeroRuta.toLowerCase().includes(termino) ||
      (r.repartidor && r.repartidor.nombre.toLowerCase().includes(termino))
    );
  }

  get clientesDelDiaSeleccionado(): ClienteConRuta[] {
    if (!this.rutaSeleccionada) return [];
    const dia = this.rutaSeleccionada.diasRuta.find(d => d.diaSemana === this.diaSeleccionado);

    if (!dia) return [];

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

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    const partes = nombre.split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.substring(0, 2).toUpperCase();
  }

  async abrirModalEditar(cliente: ClienteConRuta) {
    const modal = await this.modalCtrl.create({
      component: EditarClientePage,
      componentProps: { cliente }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.actualizado) this.cargarRutas();
  }

  getColorDia(dia: string): string {
    const colores: { [key: string]: string } = {
      'Lunes-Jueves': 'primary',
      'Martes-Viernes': 'success',
      'Miércoles-Sábado': 'warning'
    };
    return colores[dia] || 'medium';
  }

  async abrirModalCrear() {
    const modal = await this.modalCtrl.create({
      component: AgregarClientePage,
      componentProps: {
        supervisorId: this.supervisorId
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.registrado) this.cargarRutas();
  }

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
        this.cargarRutas();
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

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}