import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { close, eye, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { Auth } from 'src/app/service/auth';

@Component({
  selector: 'app-agregarconductor',
  templateUrl: './agregarconductor.page.html',
  styleUrls: ['./agregarconductor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class AgregarconductorPage {
  formUsuario!: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController,
    private modalController: ModalController,
    private authService: Auth,
  ) {
    this.formUsuario = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', Validators.required],
    });

    addIcons({
      close,
      'close-outline': close,
      eye,
      'eye-off-outline': eyeOffOutline,
      eyeOutline,
    });
  }

  async registrarUsuario() {
    if (this.formUsuario.invalid) {
      this.mostrarToast(
        'Por favor llena todos los campos correctamente.',
        'warning',
      );
      this.formUsuario.markAllAsTouched();
      return;
    }

    const usuarioData = this.formUsuario.value;
    console.log('Datos listos para enviar:', usuarioData);

    this.authService.registrar(usuarioData).subscribe({
      next: async () => {
        this.mostrarToast('Usuario registrado correctamente', 'success');
        this.modalController.dismiss(true);
      },
      error: async (err) => {
        const mensaje =
          err.error?.message === 'El correo ya existe'
            ? 'Este nombre de usuario ya está registrado'
            : 'Error al registrar usuario';

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