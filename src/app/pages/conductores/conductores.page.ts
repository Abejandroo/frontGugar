import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonicModule,
  ToastController,
  ModalController,
  AlertController, // Lo dejamos por si lo usas en otro lado
} from '@ionic/angular';
import { Auth } from 'src/app/service/auth';
import { AgregarconductorPage } from 'src/app/modal/agregarconductor/agregarconductor.page';
import { EditarconductorPage } from 'src/app/modal/editarconductor/editarconductor.page';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  personAddOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.page.html',
  styleUrls: ['./conductores.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ConductoresPage implements OnInit {
  usuarios: any[] = [];

  constructor(
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private authService: Auth,
    private alertController: AlertController,
  ) {
    addIcons({
      createOutline,
      trashOutline,
      personAddOutline,
      personCircleOutline,
      shieldCheckmarkOutline,
    });
  }

  ngOnInit() {
    this.obtenerUsuarios();
  }

  ionViewWillEnter() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.authService.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        this.mostrarToast('Error al cargar los usuarios', 'danger');
      },
    });
  }

  async abrirModalAgregarConductor() {
    const modal = await this.modalController.create({
      component: AgregarconductorPage,
    });
    await modal.present();
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.obtenerUsuarios();
      }
    });
  }

  async abrirModalEditarConductor(usuario: any) {
    const modal = await this.modalController.create({
      component: EditarconductorPage,
      componentProps: {
        maestroSeleccionado: usuario,
      },
    });
    await modal.present();
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.obtenerUsuarios();
      }
    });
  }

  async confirmarEliminacion(usuario: any) {
    console.log(
      usuario.name,
    );

    const toast = await this.toastController.create({
      message: `¿Seguro que quieres eliminar a ${usuario.name}?`,
      color: 'danger',
      position: 'top', 
      duration: 5000, 
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('PASO 2: Eliminación cancelada (Toast).');
          },
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarUsuario(usuario.id);
          },
        },
      ],
    });

    await toast.present();
  }

  eliminarUsuario(id: number) {

    this.authService.eliminarUsuario(id).subscribe({
      next: async (res) => {
        this.mostrarToast('Usuario eliminado exitosamente', 'success');
        this.obtenerUsuarios();
      },
      error: async (err) => {

        let mensaje = 'Error al eliminar el usuario';
        if (err.status === 409) {
          mensaje = err.error.message;
        } else if (err.status === 404) {
          mensaje = 'Error: Usuario no encontrado en la BD.';
        } else if (err.status === 500) {
          mensaje = 'Error interno del servidor.';
        } else if (err.status === 0) {
          mensaje = 'Error de CORS o el backend está caído.';
        }
        this.mostrarToast(mensaje, 'danger');
      },
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
    });
    toast.present();
  }
}