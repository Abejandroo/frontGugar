import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Asegúrate de importar Router si lo usas
import { HttpClient } from '@angular/common/http';
import { IonicModule, ToastController, ModalController } from '@ionic/angular'; // <-- Importa IonicModule y los controladores aquí
import { AgregarconductorPage } from 'src/app/modal/agregarconductor/agregarconductor.page';
import { EditarconductorPage } from 'src/app/modal/editarconductor/editarconductor.page';
import { EliminarconductorPage } from 'src/app/modal/eliminarconductor/eliminarconductor.page';
@Component({
  selector: 'app-conductores',
  templateUrl: './conductores.page.html',
  styleUrls: ['./conductores.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule,IonicModule],
})
export class ConductoresPage  {
 //formTutoria!: FormGroup;
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
   // this.obtenerInstructores();
  }

/*obtenerInstructores() {
  this.http.get<any[]>('https://backescolar-production.up.railway.app/maestros').subscribe(data => {
    this.instructores = data;
  });
}*/

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
    });
    toast.present();
  }


  async abrirModalAgregarConductor() {
    const modal = await this.modalController.create({
    component: AgregarconductorPage,
      componentProps: {
        instructores: this.instructores
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
    //  this.obtenerInstructores();
    });
  }

  async abrirModalEditarConductor(instructor: any) {
    const modal = await this.modalController.create({
     component: EditarconductorPage,
      componentProps: {
        maestroSeleccionado: instructor

      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
    //  this.obtenerInstructores();
    });
  }
  async abrirModalEliminarConductor(instructor: any) {
    const modal = await this.modalController.create({
   component: EliminarconductorPage,
      componentProps: {
        maestroId: instructor.id
      }
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
   //   this.obtenerInstructores();
    });
  }
}
