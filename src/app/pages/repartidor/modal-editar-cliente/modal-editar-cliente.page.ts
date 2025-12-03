import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ClienteService } from 'src/app/service/cliente.service';
import { GeolocationService } from 'src/app/service/geolocation.service';
import { ModalEditarVentaPage } from '../modal-editar-venta/modal-editar-venta.page';

@Component({
  selector: 'app-modal-editar-cliente',
  templateUrl: './modal-editar-cliente.page.html',
  styleUrls: ['./modal-editar-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class ModalEditarClientePage implements OnInit {
  
  @Input() cliente: any;
  @Input() clienteRuta: any; // Para saber si tiene venta
  @Input() venta: any; // La venta si existe

  formCliente!: FormGroup;
  guardando: boolean = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private geolocationService: GeolocationService,
    private toastController: ToastController
  ) {}

  get tieneVentaRealizada(): boolean {
    return this.venta && this.venta.estado === 'realizado';
  }

  ngOnInit() {
    const direccion = this.cliente.direcciones?.[0] || {};
    
    this.formCliente = this.fb.group({
      representante: [this.cliente.representante, Validators.required],
      negocio: [this.cliente.negocio || ''],
      telefono: [this.cliente.telefono || ''],
      direccion: [direccion.direccion || '', Validators.required],
      colonia: [direccion.colonia || '', Validators.required],
      latitud: [direccion.latitud || 0],
      longitud: [direccion.longitud || 0]
    });
  }

  async obtenerUbicacionActual() {
    this.mostrarToast('Obteniendo ubicación...', 'primary');
    
    const posicion = await this.geolocationService.getCurrentPosition();
    
    if (posicion) {
      this.formCliente.patchValue({
        latitud: posicion.latitude,
        longitud: posicion.longitude
      });
      this.mostrarToast('Ubicación actualizada', 'success');
    } else {
      this.mostrarToast('No se pudo obtener la ubicación', 'danger');
    }
  }

  async editarVenta() {
    const modal = await this.modalController.create({
      component: ModalEditarVentaPage,
      componentProps: {
        venta: this.venta,
        clienteRuta: this.clienteRuta
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.actualizado) {
      // Actualizar la venta localmente
      this.venta.cantidadVendida = data.cantidadVendida;
      this.mostrarToast('Venta actualizada', 'success');
    }
  }

  async guardarCambios() {
    if (this.formCliente.invalid) {
      this.mostrarToast('Completa los campos requeridos', 'warning');
      return;
    }

    this.guardando = true;

    const clienteActualizado = {
      ...this.cliente,
      representante: this.formCliente.value.representante,
      negocio: this.formCliente.value.negocio,
      telefono: this.formCliente.value.telefono,
      direcciones: [{
        ...this.cliente.direcciones[0],
        direccion: this.formCliente.value.direccion,
        colonia: this.formCliente.value.colonia,
        latitud: this.formCliente.value.latitud,
        longitud: this.formCliente.value.longitud
      }]
    };

    this.clienteService.actualizarCliente(clienteActualizado).subscribe({
      next: () => {
        this.mostrarToast('Cliente actualizado', 'success');
        this.modalController.dismiss({
          actualizado: true,
          cliente: clienteActualizado
        });
      },
      error: (err) => {
        console.error('Error actualizando cliente:', err);
        this.mostrarToast('Error al actualizar cliente', 'danger');
        this.guardando = false;
      }
    });
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

  cerrar() {
    this.modalController.dismiss();
  }
}