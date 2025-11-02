import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ModalController, NavParams, ToastController,AlertController } from '@ionic/angular';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-modificarruta',
  templateUrl: './modificarruta.page.html',
  styleUrls: ['./modificarruta.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule,ReactiveFormsModule,CommonModule],
})
export class ModificarrutaPage {
grupoSeleccionado: any;
 nombre: string = '';
  grupoCarreraId: number = 0;
  grupos: any[] = [];
  selectedGrupoId: string='';
  constructor(private modalController: ModalController,
    private toastController: ToastController,
    private http: HttpClient,
    private readonly navParams: NavParams
  ) {
      this.grupoSeleccionado = this.navParams.get('grupoSeleccionado');
      this.nombre = this.grupoSeleccionado.nombre;
      this.grupoCarreraId = this.grupoSeleccionado.carreraId;
      this.loadGrupos();
       addIcons({
          close,
          'close-outline': close,
        });
  }
  loadGrupos() {
  this.http.get<any[]>('https://backescolar-production.up.railway.app/grupos/getAll').subscribe({
    next: (data) => this.grupos = data,
    error: () => this.mostrarToastError('Error al cargar los grupos')
  });
}

modificarGrupo() {
  const grupoActualizado = {
    nombre: this.nombre
  };

  this.http.patch(`https://backescolar-production.up.railway.app/grupos/update/${this.grupoCarreraId}`, grupoActualizado)
    .subscribe({
      next: () => {
        this.mostrarToastSuccess('Grupo modificado correctamente');
        this.cerrarModal();
      },
      error: () => this.mostrarToastError('Error al modificar el grupo')
    });
}

  onGrupoChange(event: any) {
  const grupo = this.grupos.find(g => g.id === this.grupoCarreraId);
  if (grupo) {
    this.nombre = grupo.nombre;
  }
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