import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ActionSheetController, ToastController } from '@ionic/angular';
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { Cliente } from 'src/app/service/cliente';
import { addIcons } from 'ionicons';
import { add, searchOutline, peopleOutline, callOutline, mailOutline, ellipsisVertical, trashOutline, createOutline, close, trash, create } from 'ionicons/icons';
import { AgregarClientePage } from 'src/app/modal/agregar-cliente/agregar-cliente.page';
import { EditarClientePage } from 'src/app/modal/editar-cliente/editar-cliente.page';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent]
})
export class ClientesComponent {

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  cargando: boolean = true;

  constructor(
    private clienteService: Cliente,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController 
  ) {
    addIcons({ add, searchOutline, peopleOutline, callOutline, mailOutline, ellipsisVertical, trashOutline, createOutline, close, trash, create });
    this.cargarClientes();
  }

  cargarClientes() {
    this.cargando = true;
    this.clienteService.obtenerClientes().subscribe({
      next: (res) => {
        this.clientes = res;
        this.clientesFiltrados = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  buscarCliente(event: any) {
    const termino = event.target.value.toLowerCase();
    if (!termino) {
      this.clientesFiltrados = this.clientes;
      return;
    }
    this.clientesFiltrados = this.clientes.filter(c => 
      c.nombre.toLowerCase().includes(termino) || 
      (c.telefono && c.telefono.includes(termino))
    );
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    const partes = nombre.split(' ');
    return partes.length >= 2 ? (partes[0][0] + partes[1][0]).toUpperCase() : nombre.substring(0, 2).toUpperCase();
  }

  async abrirModalCrear() {
    const modal = await this.modalCtrl.create({
      component: AgregarClientePage
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.registrado) this.cargarClientes();
  }

  async abrirOpciones(cliente: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: cliente.nombre,
      buttons: [
        {
          text: 'Editar información',
          icon: 'create',
          handler: () => {
            this.abrirModalEditar(cliente);
          }
        },
        {
          text: 'Eliminar cliente',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.confirmarEliminar(cliente); 
          }
        },
        {
          text: 'Cerrar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await actionSheet.present();
  }

  async abrirModalEditar(clienteSeleccionado: any) {
    const modal = await this.modalCtrl.create({
      component: EditarClientePage,
      componentProps: { cliente: clienteSeleccionado }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.actualizado) this.cargarClientes();
  }

  async confirmarEliminar(cliente: any) {
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
        // Toast de Éxito (Verde)
        const toastExito = await this.toastCtrl.create({
          message: 'Cliente eliminado correctamente',
          duration: 2000,
          color: 'success',
          position: 'bottom'
        });
        toastExito.present();
        
        this.cargarClientes();
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
}