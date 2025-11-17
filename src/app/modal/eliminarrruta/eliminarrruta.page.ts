import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertController, IonicModule, ModalController, ToastController } from '@ionic/angular';
@Component({
  selector: 'app-eliminarrruta',
  templateUrl: './eliminarrruta.page.html',
  styleUrls: ['./eliminarrruta.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule,ReactiveFormsModule,CommonModule],
})
export class EliminarrrutaPage  {
  eliminarForm!: FormGroup;
  carreras: any[] = [];
  grupos: any[] = [];
  grupoCarreraId: number = 0;
  grupoId!: number;

constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
     private http: HttpClient
  ) {
  this.eliminarForm = this.formBuilder.group({
    grupoCarreraId: ['', Validators.required]
  });

  this.loadGrupos();
  }
loadGrupos() {
  this.http.get<any[]>('https://backescolar-production.up.railway.app/grupos/getAll').subscribe({
    next: (data) => {
      this.grupos = data;
      if (this.grupoCarreraId) {
        this.eliminarForm.patchValue({ grupoCarreraId: this.grupoCarreraId });
      }
    },
    error: () => this.mostrarToastError('Error al cargar los grupos')
  });
}

  onGrupoChange(event: any) {
    const grupo = this.grupos.find(g => g.id === event.detail.value);
    if (grupo) {
      this.eliminarForm.patchValue({ grupoCarreraId: grupo.id });
    }
  }
  async confirmarEliminacion() {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este grupo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarGrupo(this.eliminarForm.get('grupoCarreraId')?.value);
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarGrupo(id: number) {
    this.http.delete(`https://backescolar-production.up.railway.app/grupos/delete/${id}`).subscribe({
      next: () => {
        this.mostrarToastSuccess('Grupo eliminado con éxito');
        this.loadGrupos();
      },
      error: () => this.mostrarToastError('Error al eliminar el grupo, puede ser que el grupo tenga alumnos o maestros')
    });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
  async mostrarToastSuccess(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 2000,
    position: 'top',
    color: 'success'
  });
  toast.present();
}

async mostrarToastError(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 2000,
    position: 'top',
    color: 'danger'
  });
  toast.present();
}
}