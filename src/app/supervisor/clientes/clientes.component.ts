import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para pipes
import { IonicModule, ModalController, ActionSheetController } from '@ionic/angular';
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { addIcons } from 'ionicons';
import { 
  add, searchOutline, peopleOutline, callOutline, 
  mailOutline, ellipsisVertical, trash, create 
} from 'ionicons/icons';
import { Cliente } from 'src/app/service/cliente';
import { AgregarClientePage } from 'src/app/modal/agregar-cliente/agregar-cliente.page';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent],
})
export class ClientesComponent  {

  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  cargando: boolean = true;

  constructor(
    private clienteService: Cliente,
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {
    // Registramos iconos
    addIcons({ add, searchOutline, peopleOutline, callOutline, mailOutline, ellipsisVertical, trash, create });
     this.cargarClientes();
  }
  cargarClientes() {
    this.cargando = true;
    this.clienteService.obtenerClientes().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesFiltrados = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando clientes', err);
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

  // Genera iniciales (Ej: "Juan Pérez" -> "JP")
  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    const partes = nombre.split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  // Acción para abrir el modal de CREAR (Lo haremos a continuación)
  async abrirModalCrear() {
    const modal = await this.modalCtrl.create({
     component: AgregarClientePage
  });
    await modal.present();
    
    // Al cerrar, recargar lista
    const { data } = await modal.onDidDismiss();
    if (data?.registrado) this.cargarClientes();
    
    console.log('Abrir modal crear');
  }

  // Menú de opciones (Editar/Eliminar) estilo iOS/Android nativo
  async abrirOpciones(cliente: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones para ' + cliente.nombre,
      buttons: [
        {
          text: 'Editar',
          icon: 'create',
          handler: () => {
            console.log('Editar', cliente);
            // this.abrirModalEditar(cliente);
          }
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.confirmarEliminar(cliente);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          data: { action: 'cancel' }
        }
      ]
    });

    await actionSheet.present();
  }

  confirmarEliminar(cliente: any) {
    // Aquí llamarías a tu servicio de eliminar
    console.log('Eliminando a:', cliente.id);
  }
}