import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-agregarruta',
  templateUrl: './agregarruta.page.html',
  styleUrls: ['./agregarruta.page.scss'],
  standalone: true,
  imports: [IonicModule,CommonModule,FormsModule],
})
export class AgregarrutaPage {
nombre: string = '';
selectedCarreraId: any;
constructor(
  private readonly modalController: ModalController,
  private readonly toastController: ToastController,
  //private grupoService: GrupoService
  ) {
     addIcons({
          close,
          'close-outline': close,
        });
  }
agregarGrupo() {
  if (!this.nombre.trim()) {
    this.mostrarToast2();
    return;
  }

 /* this.grupoService.crearGrupo({ nombre: this.nombre.toUpperCase() }).subscribe({
    next: (res) => {
      this.mostrarToast();
      this.cerrarModal();
    },
    error: (err) => {
      console.error(err);
      this.mostrarToast2();
    },
  });*/
}
  async mostrarToast() {
    const toast = await this.toastController.create({
      message: `Grupo ${this.nombre.toUpperCase()} creado de manera exitosa`,
      duration: 2000,
      position:'top',
      color: 'success'
    });
    toast.present();
  }
  async mostrarToast2() {
    const toast = await this.toastController.create({
      message: `Grupo ${this.nombre.toUpperCase()}  no creado de manera exitosa`,
      duration: 2000,
      position:'top',
      color: 'danger'
    });
    toast.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }


}