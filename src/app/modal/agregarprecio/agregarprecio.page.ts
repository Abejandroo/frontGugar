import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {  ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, pricetagOutline, cashOutline, saveOutline } from 'ionicons/icons';
import { PrecioService } from 'src/app/service/precio';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-agregarprecio',
  templateUrl: './agregarprecio.page.html',
  styleUrls: ['./agregarprecio.page.scss'],
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule, FormsModule, ReactiveFormsModule] ,
  providers: [...IonicControllers]
})
export class AgregarprecioPage  {

  @Input() precioEditar: any; 
  
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

    const rawData = this.formPrecio.value;

    const datos = {
      tipoCompra: rawData.tipoCompra,
      precioPorGarrafon: Number(rawData.precioPorGarrafon) 
    };

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
        console.error('Error detallado:', err); 
        
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