import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, personOutline, callOutline, mailOutline, pricetagOutline, saveOutline } from 'ionicons/icons';
import { Cliente } from 'src/app/service/cliente';

@Component({
  selector: 'app-agregar-cliente',
  templateUrl: './agregar-cliente.page.html',
  styleUrls: ['./agregar-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule] // <--- Importante: ReactiveFormsModule
})
export class AgregarClientePage implements OnInit {

  formCliente: FormGroup;
  cargando: boolean = false;

  // Lista temporal de precios (Lo ideal es traerlos de tu API)
  listaPrecios: any[] = [
    { id: 1, nombre: 'Precio Público' },
    { id: 2, nombre: 'Precio Mayorista' },
    { id: 3, nombre: 'Precio VIP' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private clienteService: Cliente,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, personOutline, callOutline, mailOutline, pricetagOutline, saveOutline });

    // Validaciones según tu DTO de NestJS
    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      correo: ['', [Validators.required, Validators.email]],
      tipoPrecioId: [null, [Validators.required]] // Obligatorio seleccionar precio
    });
  }

  ngOnInit() {
    // Aquí deberías llamar a: this.precioService.getPrecios().subscribe(...)
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async guardarCliente() {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched(); // Para que se pongan rojos los campos vacíos
      return;
    }

    this.cargando = true;
    const datos = this.formCliente.value;

    this.clienteService.crearCliente(datos).subscribe({
      next: async (res) => {
        this.cargando = false;
        await this.mostrarToast('Cliente registrado con éxito', 'success');
        this.modalCtrl.dismiss({ registrado: true }); // Avisamos que sí se guardó
      },
      error: async (err) => {
        this.cargando = false;
        console.error(err);
        await this.mostrarToast('Error al guardar el cliente', 'danger');
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}