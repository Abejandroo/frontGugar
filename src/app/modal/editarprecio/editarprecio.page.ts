import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, pricetagOutline, cashOutline, saveOutline } from 'ionicons/icons';
import { PrecioService } from 'src/app/service/precio';

@Component({
  selector: 'app-editarprecio',
  templateUrl: './editarprecio.page.html',
  styleUrls: ['./editarprecio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class EditarprecioPage  {

  @Input() precio: any; 
  
  formPrecio: FormGroup;
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private precioService: PrecioService,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, pricetagOutline, cashOutline, saveOutline });

    this.formPrecio = this.fb.group({
      tipoCompra: ['', [Validators.required, Validators.minLength(3)]],
      precioPorGarrafon: ['', [Validators.required, Validators.min(0)]]
    });
     if (this.precio) {
      this.formPrecio.patchValue({
        tipoCompra: this.precio.tipoCompra,
        precioPorGarrafon: this.precio.precioPorGarrafon
      });
    }
  }


  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async actualizarPrecio() {
    if (this.formPrecio.invalid) {
      this.formPrecio.markAllAsTouched();
      return;
    }

    this.cargando = true;

    const rawData = this.formPrecio.value;
    const datos = {
      tipoCompra: rawData.tipoCompra,
      precioPorGarrafon: Number(rawData.precioPorGarrafon)
    };

    this.precioService.actualizarPrecio(this.precio.id, datos).subscribe({
      next: async (res) => {
        this.cargando = false;
        await this.mostrarToast('Precio actualizado correctamente', 'success');
        this.modalCtrl.dismiss({ actualizado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error(err);
        const msg = err.error?.message ? err.error.message.toString() : 'Error al actualizar';
        await this.mostrarToast(msg, 'danger');
      }
    });
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}