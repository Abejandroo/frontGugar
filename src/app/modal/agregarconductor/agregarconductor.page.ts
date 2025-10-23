import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular'; 
interface Grupo {
  id: number;
  nombre: string;
}
@Component({
  selector: 'app-agregarconductor',
  templateUrl: './agregarconductor.page.html',
  styleUrls: ['./agregarconductor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})

export class AgregarconductorPage {
  formInstructor!: FormGroup;
  showPassword: boolean = false;
fotoPreview: string | ArrayBuffer | null = null;
  fotoArchivo: File | null = null;
    grupos: Grupo[] = [];
  constructor(
    private fb: FormBuilder,
   // private _Service: AuthService,
    private toastController: ToastController,
    private modalController: ModalController,
   // private grupoService: GrupoService,
   // private maestrosService: MaestrosService
  ) {
    this.formInstructor = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      nombre: ['', [Validators.required,Validators.maxLength(30)]],
      apellido: ['', [Validators.required,Validators.maxLength(30)]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(10)]],
      grupoId: ['', Validators.required],  

    });
    //  this.cargarGrupos();
  }

async agregarInstructor() {
  if (this.formInstructor.invalid) {
    const toast = await this.toastController.create({
      message: 'Por favor llena todos los campos correctamente.',
      duration: 2000,
      color: 'warning',
    });
    toast.present();
    return;
  }

  const formValue = this.formInstructor.value;

  const maestroData: any = {
    nombre: formValue.nombre,
    apellido: formValue.apellido,
    telefono: Number(formValue.telefono),
    correo: formValue.correo,
    contrasena: formValue.contrasena,
    grupoId: Number(formValue.grupoId),
  };


 /* if (this.fotoArchivo) {
    const base64 = await this.convertirImagenABase64(this.fotoArchivo);
    maestroData.imagenBase64 = base64;
  }*/

/*  this.maestrosService.agregarMaestro(maestroData).subscribe({
    next: async () => {
      const toast = await this.toastController.create({
        message: 'Maestro agregado correctamente',
        duration: 2000,
        color: 'success',
      });
      toast.present();
      this.modalController.dismiss(true);
    },
    error: async (err) => {
      const toast = await this.toastController.create({
        message: 'Error al agregar maestro',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
      console.error(err);
    },
  });
}*/
}
  cerrarModal() {
    this.modalController.dismiss();
  }

  convertToUpperCase(event: any, controlName: string) {
    const value = (event.target as HTMLInputElement).value.toUpperCase();
    this.formInstructor.get(controlName)?.setValue(value, { emitEvent: false });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
 /*cargarGrupos() {
    this.grupoService.obtenerGrupos().subscribe({
      next: (res: any) => {
        this.grupos = res;
      },
      error: async (err) => {
        const toast = await this.toastController.create({
          message: 'Error al cargar grupos',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
        console.error(err);
      },
    });
  }
*/
onImageSelected(event: any) {
    const archivo = event.target.files[0];
    if (archivo) {
      this.fotoArchivo = archivo;

      const lector = new FileReader();
      lector.onload = () => {
        this.fotoPreview = lector.result;
      };
      lector.readAsDataURL(archivo);
    }
  }
  cargarAlumnosDelGrupo() {
    const grupoId = this.formInstructor.get('grupoId')?.value;

  }

}

