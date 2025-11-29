import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-todos-clientes',
  templateUrl: './modal-todos-clientes.page.html',
  styleUrls: ['./modal-todos-clientes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ModalTodosClientesPage {
  
  @Input() clientes: any[] = [];
  @Input() clienteActualId: number = 0;
  @Input() soloVista: boolean = true;

  segmento: string = 'todos';

  constructor(private modalController: ModalController) {}

  get clientesFiltrados() {
    if (this.segmento === 'todos') {
      return this.clientes;
    } else if (this.segmento === 'pendientes') {
      return this.clientes.filter(c => !c.venta || c.venta.estado === 'pendiente');
    } else if (this.segmento === 'completados') {
      return this.clientes.filter(c => c.venta && c.venta.estado === 'realizado');
    } else if (this.segmento === 'saltados') {
      return this.clientes.filter(c => c.venta && c.venta.estado === 'saltado');
    }
    return this.clientes;
  }

  get clientesPendientesCount(): number {
    return this.clientes.filter(c => !c.venta || c.venta.estado === 'pendiente').length;
  }

  get clientesCompletadosCount(): number {
    return this.clientes.filter(c => c.venta && c.venta.estado === 'realizado').length;
  }

  get clientesSaltadosCount(): number {
    return this.clientes.filter(c => c.venta && c.venta.estado === 'saltado').length;
  }

  cerrar() {
    this.modalController.dismiss();
  }

  getOrdenCliente(cliente: any): number {
    return this.clientes.indexOf(cliente) + 1;
  }

  esClienteActual(cliente: any): boolean {
    return cliente.id === this.clienteActualId;
  }

  getColorEstado(cliente: any): string {
    if (cliente.venta) {
      if (cliente.venta.estado === 'realizado') return 'success';
      if (cliente.venta.estado === 'saltado') return 'danger';
    }
    if (this.esClienteActual(cliente)) return 'warning';
    return 'medium';
  }

  getEstadoTexto(cliente: any): string {
    if (cliente.venta) {
      if (cliente.venta.estado === 'realizado') return 'Completado';
      if (cliente.venta.estado === 'saltado') return 'Saltado';
    }
    if (this.esClienteActual(cliente)) return 'Actual';
    return 'Pendiente';
  }

  tieneVenta(cliente: any): boolean {
    return cliente.venta && cliente.venta.estado === 'realizado';
  }

  fueSaltado(cliente: any): boolean {
    return cliente.venta && cliente.venta.estado === 'saltado';
  }
}