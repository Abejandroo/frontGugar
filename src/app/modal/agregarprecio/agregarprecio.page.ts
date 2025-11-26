import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, pricetagOutline, cashOutline, saveOutline } from 'ionicons/icons';
import { PrecioService } from 'src/app/service/precio';

@Component({
  selector: 'app-agregarprecio',
  templateUrl: './agregarprecio.page.html',
  styleUrls: ['./agregarprecio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule] // <--- Importante
})
export class AgregarprecioPage implements OnInit {

  @Input() precioEditar: any; // Por si lo usas para editar después
  
  formPrecio: FormGroup;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private precioService: PrecioService,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, pricetagOutline, cashOutline, saveOutline });

    // Validaciones según tu Entity de NestJS
    this.formPrecio = this.fb.group({
      tipoCompra: ['', [Validators.required, Validators.minLength(3)]], // Ej: "Mayorista"
      precioPorGarrafon: ['', [Validators.required, Validators.min(0)]] // Ej: 12.50
    });
  }

  ngOnInit() {
    // Si recibimos un precio para editar, llenamos el formulario
    if (this.precioEditar) {
      this.formPrecio.patchValue(this.precioEditar);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

 async guardarPrecio() {
    if (this.formPrecio.invalid) {
      this.formPrecio.markAllAsTouched();
      return;
    }

    this.cargando = true;

    // 1. OBTENEMOS LOS DATOS DEL FORMULARIO
    const rawData = this.formPrecio.value;

    // 2. HACEMOS LA CONVERSIÓN MANUAL (El truco mágico ✨)
    const datos = {
      tipoCompra: rawData.tipoCompra,
      // Convertimos "50" (string) a 50 (number)
      precioPorGarrafon: Number(rawData.precioPorGarrafon) 
    };

    // 3. ENVIAMOS 'datos' (YA CONVERTIDOS) EN LUGAR DE 'this.formPrecio.value'
    let peticion;
    if (this.precioEditar) {
      peticion = this.precioService.actualizarPrecio(this.precioEditar.id, datos);
    } else {
      peticion = this.precioService.crearPrecio(datos);
    }

    peticion.subscribe({
      next: async (res) => {
        this.cargando = false;
        await this.mostrarToast(
          this.precioEditar ? 'Precio actualizado' : 'Precio registrado con éxito', 
          'success'
        );
        this.modalCtrl.dismiss({ actualizado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error('Error detallado:', err); // Mira aquí en la consola
        
        // TIP: Esto te mostrará en el toast exactamente qué falló (ej: "precioPorGarrafon must be a number")
        const mensajeError = err.error?.message ? err.error.message.toString() : 'Error al guardar';
        
        await this.mostrarToast(mensajeError, 'danger');
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