import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AgregarSupervisorPage } from 'src/app/modal/agregar-supervisor/agregar-supervisor.page';
import { EditarSupervisorPage } from 'src/app/modal/editar-supervisor/editar-supervisor.page';
import { EliminarSupervisorPage } from 'src/app/modal/eliminar-supervisor/eliminar-supervisor.page';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-supervisores',
  templateUrl: './supervisores.page.html',
  styleUrls: ['./supervisores.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, FormsModule, ],
})
export class SupervisoresPage {
 formTutoria!: FormGroup;
  isEdit: boolean = false;
  id!: number;
  diasArray: string[] = [];
  selectedFile: File | null = null;
  instructores: any[] = [];

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private http: HttpClient
  ) {
      addIcons({
              close,
              'close-outline': close,
            });
    this.obtenerInstructores();
  }

obtenerInstructores() {
  this.http.get<any[]>('https://backescolar-production.up.railway.app/maestros').subscribe(data => {
    this.instructores = data;
  });
}

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
    });
    toast.present();
  }


  async abrirModalAgregarMaestro() {
    const modal = await this.modalController.create({
      component: AgregarSupervisorPage,
      componentProps: {
        instructores: this.instructores
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.obtenerInstructores();
    });
  }

  async abrirModalEditarMaestro(instructor: any) {
    const modal = await this.modalController.create({
      component: EditarSupervisorPage,
      componentProps: {
        maestroSeleccionado: instructor

      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.obtenerInstructores();
    });
  }

  async abrirModalEliminarMaestro(instructor: any) {
    const modal = await this.modalController.create({
      component: EliminarSupervisorPage,
      componentProps: {
        maestroId: instructor.id
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.obtenerInstructores();
    });
  }
}
