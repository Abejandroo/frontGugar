import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ModalController,
  NavParams,
  ToastController,
} from '@ionic/angular';
import { Auth } from 'src/app/service/auth';
import { addIcons } from 'ionicons';
import { close, eye, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-editarconductor',
  templateUrl: './editarconductor.page.html',
  styleUrls: ['./editarconductor.page.scss'],
  standalone: true,
  imports: [...IonicSharedComponents, ReactiveFormsModule, CommonModule, FormsModule],
  providers: [...IonicControllers]
})
export class EditarconductorPage {
  formUsuario!: FormGroup;
  usuario: any;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private modalController: ModalController,
    private navParams: NavParams,
    private authService: Auth,
  ) {
    this.usuario = this.navParams.get('maestroSeleccionado');
    this.formUsuario = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required]],
      password: ['', [Validators.minLength(8)]],
      role: [null, Validators.required],
    });
    addIcons({ close, 'close-outline': close, eye, eyeOffOutline, eyeOutline });
    if (this.usuario) {
      this.formUsuario.patchValue({
        name: this.usuario.name,
        email: this.usuario.email,
        role: this.usuario.role,
      });
    }
  }
  async actualizarUsuario() {
    if (this.formUsuario.invalid) {
      this.mostrarToast('Por favor revisa los campos.', 'warning');
      this.formUsuario.markAllAsTouched();
      return;
    }
    const usuarioData = this.formUsuario.value;
    if (!usuarioData.password) {
      delete usuarioData.password;
    }

    console.log('Datos listos para enviar:', usuarioData);
    this.authService.actualizarUsuario(this.usuario.id, usuarioData).subscribe({
      next: async () => {
        this.mostrarToast('Usuario actualizado correctamente', 'success');
        this.modalController.dismiss(true);
      },
      error: async (err) => {
        const mensaje =
          err.error?.message === 'El correo ya existe'
            ? 'Este nombre de usuario ya está registrado'
            : 'Error al actualizar el usuario';
        this.mostrarToast(mensaje, 'danger');
        console.error(err);
      },
    });
  }
  cerrarModal() {
    this.modalController.dismiss();
  }
  convertToUpperCase(event: any, controlName: string) {
    const value = (event.target as HTMLInputElement).value.toUpperCase();
    this.formUsuario.get(controlName)?.setValue(value, { emitEvent: false });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color,
    });
    toast.present();
  }
}