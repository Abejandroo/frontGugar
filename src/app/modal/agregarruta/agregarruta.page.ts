import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos FormBuilder para crear el formulario correctamente
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { close, trash, fingerPrint } from 'ionicons/icons'; // Agregué iconos
import { addIcons } from 'ionicons';
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-agregarruta',
  templateUrl: './agregarruta.page.html',
  styleUrls: ['./agregarruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GoogleMapsModule, ReactiveFormsModule],
})
export class AgregarrutaPage{
  
  formRuta!: FormGroup;
  repartidores: any[] = [];

  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 };
  zoom = 14;
  puntosRuta: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#3880ff',
    strokeOpacity: 1.0,
    strokeWeight: 4,
  };

  constructor(
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private fb: FormBuilder
  ) {
    addIcons({ close, 'close-outline': close, trash, 'finger-print': fingerPrint });
    this.formRuta = this.fb.group({
      nombre: ['', Validators.required],
      rutaId: [null, Validators.required],
      lugarEntrega: ['', Validators.required],
      cantidad: ['', Validators.required],
      acciones: ['', Validators.required],
    });
  }
  agregarPuntoAlMapa(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const nuevoPunto = event.latLng.toJSON();
      this.puntosRuta.push(nuevoPunto);
      this.puntosRuta = [...this.puntosRuta]; 
    }
  }

  limpiarRuta() {
    this.puntosRuta = [];
  }

  async agregarGrupo() {
    if (this.formRuta.invalid) {
      this.mostrarToast('Por favor completa los campos obligatorios', 'warning');
      this.formRuta.markAllAsTouched(); // Muestra los errores rojos
      return;
    }
    
    if (this.puntosRuta.length < 2) {
       this.mostrarToast('Dibuja la ruta en el mapa', 'warning');
       return;
    }

    // Obtenemos los valores y los convertimos a mayúsculas aquí para limpieza
    const formValues = this.formRuta.value;
    
    const dataFinal = {
      nombre: formValues.nombre.toUpperCase(),
      repartidorId: formValues.rutaId,
      lugarEntrega: formValues.lugarEntrega?.toUpperCase(),
      cantidad: formValues.cantidad,
      acciones: formValues.acciones?.toUpperCase(),
      coordenadas: this.puntosRuta
    };

    console.log('✅ TODO LISTO:', dataFinal);
    this.mostrarToast('Ruta creada correctamente', 'success');
    this.cerrarModal();
  }

  cargarAlumnosDelGrupo() {
    
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje, duration: 2000, position: 'top', color: color
    });
    toast.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}