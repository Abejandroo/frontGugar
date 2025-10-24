import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { ModalController, ToastController, AlertController, IonicModule } from '@ionic/angular';
@Component({
  selector: 'app-eliminarconductor',
  templateUrl: './eliminarconductor.page.html',
  styleUrls: ['./eliminarconductor.page.scss'],
  standalone: true,
  imports: [IonicModule,FormsModule,CommonModule,ReactiveFormsModule]
})
export class EliminarconductorPage {
 formEliminar!: FormGroup;
  instructores: any[] = []
  maestroId!: number;
  constructor(
    private readonly fb: FormBuilder,
    private readonly toastController: ToastController,
    private readonly modalController: ModalController,
    private readonly alertController: AlertController,
   // private readonly maestrosService: MaestrosService
  ) { 
      this.formEliminar = this.fb.group({
      id: ['', Validators.required]
    });
     if (this.maestroId) {
  this.formEliminar.patchValue({ id: this.maestroId });
}
   // this.obtenerInstructores();
  
  }
/*obtenerInstructores() {
  this.maestrosService.obtenerMaestros().subscribe({
    next: (res: any) => {
      this.instructores = res;
    },
    error: async () => {
      const toast = await this.toastController.create({
        message: 'Error al cargar docentes',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  });
}
*/
  async confirmarEliminacion() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este instructor?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          handler: () => {
          //  this.eliminarInstructor();
          }
        }
      ]
    });

    await alert.present();
  }
 /*eliminarInstructor() {
  const id = this.formEliminar.value.id;
  this.maestrosService.eliminarMaestro(id).subscribe({
    next: async () => {
      const toast = await this.toastController.create({
        message: 'Docente eliminado exitosamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();
      this.cerrarModal();
    },
    error: async () => {
      const toast = await this.toastController.create({
        message: 'Error al eliminar el docente',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  });
}*/

  cerrarModal() {
    this.modalController.dismiss();
  }
} 