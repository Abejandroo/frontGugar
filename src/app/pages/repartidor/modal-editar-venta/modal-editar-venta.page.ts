import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {  ModalController, ToastController } from '@ionic/angular';
import { VentaService } from 'src/app/service/venta.service';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-modal-editar-venta',
  templateUrl: './modal-editar-venta.page.html',
  styleUrls: ['./modal-editar-venta.page.scss'],
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, ...IonicSharedComponents],
  providers: [...IonicControllers]
})
export class ModalEditarVentaPage implements OnInit {
  
  @Input() venta: any;
  @Input() clienteRuta: any;

  formVenta!: FormGroup;
  guardando: boolean = false;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private ventaService: VentaService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.formVenta = this.fb.group({
      cantidadVendida: [this.venta.cantidadVendida || 1, [Validators.required, Validators.min(1)]]
    });
  }

  incrementar() {
    const valor = this.formVenta.get('cantidadVendida')?.value || 0;
    this.formVenta.patchValue({ cantidadVendida: valor + 1 });
  }

  decrementar() {
    const valor = this.formVenta.get('cantidadVendida')?.value || 0;
    if (valor > 1) {
      this.formVenta.patchValue({ cantidadVendida: valor - 1 });
    }
  }

  get totalVenta(): number {
    const cantidad = this.formVenta.get('cantidadVendida')?.value || 0;
    const precio = this.venta.precio?.precioPorGarrafon || this.clienteRuta.precio?.precioPorGarrafon || 0;
    return cantidad * precio;
  }

  async guardarCambios() {
    if (this.formVenta.invalid) {
      this.mostrarToast('Cantidad inválida', 'warning');
      return;
    }

    this.guardando = true;

    const cambios = {
      cantidadVendida: this.formVenta.value.cantidadVendida
    };

    this.ventaService.actualizarVenta(this.venta.id, cambios).subscribe({
      next: () => {
        this.mostrarToast('Venta actualizada', 'success');
        this.modalController.dismiss({
          actualizado: true,
          cantidadVendida: this.formVenta.value.cantidadVendida
        });
      },
      error: (err) => {
        console.error('Error actualizando venta:', err);
        this.mostrarToast('Error al actualizar venta', 'danger');
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