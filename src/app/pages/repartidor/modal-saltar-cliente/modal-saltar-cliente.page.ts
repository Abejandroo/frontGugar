import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { VentaService } from 'src/app/service/venta.service';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-modal-saltar-cliente',
  templateUrl: './modal-saltar-cliente.page.html',
  styleUrls: ['./modal-saltar-cliente.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...IonicSharedComponents],
  providers: [...IonicControllers]
})
export class ModalSaltarClientePage implements OnInit {

  @Input() clienteRuta: any;
  @Input() diaRutaId: number = 0;

  formSaltar!: FormGroup;
  guardando: boolean = false;

  motivosSalto = [
    { valor: 'cliente_ausente', texto: 'Cliente no se encontraba' },
    { valor: 'cliente_rechazo', texto: 'Cliente no quiso comprar' },
    { valor: 'domicilio_incorrecto', texto: 'Domicilio equivocado' },
    { valor: 'negocio_cerrado', texto: 'Negocio cerrado' },
    { valor: 'sin_efectivo', texto: 'Cliente sin efectivo' },
    { valor: 'reprogramar', texto: 'Cliente pidió reprogramar' },
    { valor: 'otro', texto: 'Otro motivo' }
  ];

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private ventaService: VentaService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.formSaltar = this.fb.group({
      motivo: ['', Validators.required],
      observaciones: ['']
    });
  }

  async saltarCliente() {
    if (this.formSaltar.invalid) {
      this.mostrarToast('Selecciona un motivo', 'warning');
      return;
    }

    this.guardando = true;

    const motivoTexto = this.motivosSalto.find(m => m.valor === this.formSaltar.value.motivo)?.texto || '';
    const motivoCompleto = this.formSaltar.value.observaciones
      ? `${motivoTexto} - ${this.formSaltar.value.observaciones}`
      : motivoTexto;

    const venta = {
      clienteRutaId: this.clienteRuta.id,
      precioId: this.clienteRuta.precio?.id,
      cantidadVendida: 0,
      estado: 'saltado',
      motivoSalto: motivoCompleto
    };

    this.ventaService.registrarVenta(venta).subscribe({
      next: () => {
        this.marcarComoVisitado();
      },
      error: (err) => {
        console.error('Error al saltar cliente:', err);
        this.mostrarToast('Error al saltar cliente', 'danger');
        this.guardando = false;
      }
    });
  }

  marcarComoVisitado() {
    this.ventaService.marcarClienteVisitado(
      this.clienteRuta.id,
      true,
      0 // 0 garrafones porque fue saltado
    ).subscribe({
      next: () => {
        this.mostrarToast('Cliente saltado', 'warning');
        this.modalController.dismiss({
          saltado: true,
          motivo: this.formSaltar.value.motivo
        });
      },
      error: (err) => {
        console.error('Error marcando como visitado:', err);
        // Aún así cerrar el modal
        this.modalController.dismiss({
          saltado: true,
          motivo: this.formSaltar.value.motivo
        });
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