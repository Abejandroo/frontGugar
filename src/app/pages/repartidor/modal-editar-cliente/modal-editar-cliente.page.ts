import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {  ModalController, ToastController } from '@ionic/angular';
import { ClienteService } from 'src/app/service/cliente.service';
import { GeolocationService } from 'src/app/service/geolocation.service';
import { ModalEditarVentaPage } from '../modal-editar-venta/modal-editar-venta.page';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-modal-editar-cliente',
  templateUrl: './modal-editar-cliente.page.html',
  styleUrls: ['./modal-editar-cliente.page.scss'],
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, ...IonicSharedComponents],
  providers: [...IonicControllers]
})
export class ModalEditarClientePage implements OnInit {
  
  @Input() cliente: any;
  @Input() clienteRuta: any;
  @Input() venta: any;

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
    this.formCliente = this.fb.group({
      nombre: [this.cliente.nombre, Validators.required],
      negocio: [this.cliente.negocio || ''],
      telefono: [this.cliente.telefono || ''],
      calle: [this.cliente.calle || '', Validators.required],
      colonia: [this.cliente.colonia || '', Validators.required],
      latitud: [this.cliente.latitud || null],
      longitud: [this.cliente.longitud || null]
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
      nombre: this.formCliente.value.nombre,
      negocio: this.formCliente.value.negocio,
      telefono: this.formCliente.value.telefono,
      calle: this.formCliente.value.calle,
      colonia: this.formCliente.value.colonia,
      latitud: this.formCliente.value.latitud,
      longitud: this.formCliente.value.longitud
    };

    this.clienteService.actualizarCliente(this.cliente.id, clienteActualizado).subscribe({
      next: async () => {
        this.guardando = false;
        await this.mostrarToast('Cliente actualizado correctamente', 'success');
        this.modalController.dismiss({ actualizado: true });
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