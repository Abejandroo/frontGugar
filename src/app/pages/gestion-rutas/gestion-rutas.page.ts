import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonButtons, IonCol, IonBackButton, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonNote } from '@ionic/angular/standalone';
import { AgregarrutaPage } from 'src/app/modal/agregarruta/agregarruta.page';
import { ModificarrutaPage } from 'src/app/modal/modificarruta/modificarruta.page';
import { EliminarrrutaPage } from 'src/app/modal/eliminarrruta/eliminarrruta.page';

@Component({
  selector: 'app-gestion-rutas',
  templateUrl: './gestion-rutas.page.html',
  styleUrls: ['./gestion-rutas.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule, FormsModule],
})
export class GestionRutasPage  {

 carreras: any[] = [];
  grupos: any[] = [];
  selectedCarreraId: string = '';

  constructor(
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    //private readonly grupoService: GrupoService  
  ) {
    this.actualizarGrupos();
  }

  actualizarGrupos() {
   /* this.grupoService.obtenerGrupos().subscribe(
      (data) => {
        this.grupos = data as any[];
      },
      (error) => {
        console.error('Error al obtener grupos:', error);
        this.grupos = [];
      }
    );*/
  }

  async abrirModalAgregarGrupo() {
 const modal = await this.modalController.create({
      component: AgregarrutaPage,
      componentProps: {
        carreras: this.carreras
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.actualizarGrupos();
    });
  }

  async abrirModalEditarGrupo(grupo: any) {
    const modal = await this.modalController.create({
      component: ModificarrutaPage,
      componentProps: {
        grupoCarreraId: grupo.id ,
        grupoSeleccionado: grupo
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.actualizarGrupos();
    });
  }

  async abrirModalEliminarGrupo(grupo: any) {
   const modal = await this.modalController.create({
      component: EliminarrrutaPage,
      componentProps: {
        grupoId: grupo.id,
    grupoCarreraId: grupo.id
          }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.actualizarGrupos();
    });
  }


}