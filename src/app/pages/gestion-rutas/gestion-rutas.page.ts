import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Auth } from 'src/app/service/auth';
import { AgregarrutaPage } from 'src/app/modal/agregarruta/agregarruta.page';
import { ModificarrutaPage } from 'src/app/modal/modificarruta/modificarruta.page';
import { DetalleRutaPage } from 'src/app/modal/detalle-ruta/detalle-ruta.page';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  addCircleOutline,
  mapOutline,
  personOutline,
  locationOutline,
  cubeOutline,
  informationCircleOutline,
  navigateOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-gestion-rutas',
  templateUrl: './gestion-rutas.page.html',
  styleUrls: ['./gestion-rutas.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, FormsModule],
})
export class GestionRutasPage  {
  grupos: any[] = [];

  constructor(
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private readonly authService: Auth,
  ) {
    addIcons({
      createOutline,
      trashOutline,
      addCircleOutline,
      mapOutline,
      personOutline,
      locationOutline,
      cubeOutline,
      informationCircleOutline,
      navigateOutline,
    });
        this.actualizarGrupos();

  }
  ionViewWillEnter() {
    this.actualizarGrupos();
  }

  actualizarGrupos() {
    this.authService.obtenerRutas().subscribe({
      next: (data) => {
        this.grupos = data;
      },
      error: (error) => {
        this.mostrarToast('Error al cargar las rutas', 'danger');
        this.grupos = [];
      },
    });
  }

  async verRutaEnMapa(grupo: any) {
    const modal = await this.modalController.create({
      component: DetalleRutaPage,
      componentProps: {
        ruta: grupo,
      },
    });
    await modal.present();
  }

  async abrirModalAgregarGrupo() {
    const modal = await this.modalController.create({
      component: AgregarrutaPage,
    });
    await modal.present();
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.actualizarGrupos();
      }
    });
  }

  async abrirModalEditarGrupo(grupo: any) {
    const modal = await this.modalController.create({
      component: ModificarrutaPage,
      componentProps: {
        grupoSeleccionado: grupo,
      },
    });
    await modal.present();
    modal.onDidDismiss().then((result) => {
      this.actualizarGrupos();
    });
  }

  async abrirModalEliminarGrupo(grupo: any) {
    const toast = await this.toastController.create({
      message: `¿Eliminar la ruta ${grupo.nombre}?`,
      position: 'top',
      color: 'danger',
      duration: 5000,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarRuta(grupo.id);
          },
        },
      ],
    });
    await toast.present();
  }

  eliminarRuta(id: number) {
    this.authService.eliminarRuta(id).subscribe({
      next: () => {
        this.mostrarToast('Ruta eliminada correctamente', 'success');
        this.actualizarGrupos();
      },
      error: (err) => {
        this.mostrarToast('Error al eliminar la ruta', 'danger');
      },
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
}