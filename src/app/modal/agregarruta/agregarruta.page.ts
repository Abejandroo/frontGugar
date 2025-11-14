import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { close } from 'ionicons/icons';
import { addIcons } from 'ionicons';
// 1. Importamos el módulo de Google Maps
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-agregarruta',
  templateUrl: './agregarruta.page.html',
  styleUrls: ['./agregarruta.page.scss'],
  standalone: true,
  // 2. Agregamos GoogleMapsModule a los imports
  imports: [IonicModule, CommonModule, FormsModule, GoogleMapsModule],
})
export class AgregarrutaPage {
  nombre: string = '';
  
  // Configuración del Mapa 🗺️
  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 }; // Coordenadas de Oaxaca (o tu zona)
  zoom = 14;
  
  // Aquí guardaremos los puntos de la ruta que dibuje el usuario
  puntosRuta: google.maps.LatLngLiteral[] = [];
  
  // Opciones para la línea que une los puntos (Polyline)
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#3880ff', // Color primary de Ionic
    strokeOpacity: 1.0,
    strokeWeight: 4,
  };

  constructor(
    private readonly modalController: ModalController,
    private readonly toastController: ToastController
  ) {
    addIcons({ close, 'close-outline': close });
  }

  // Función para agregar un punto cuando tocan el mapa
  agregarPuntoAlMapa(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const nuevoPunto = event.latLng.toJSON();
      this.puntosRuta.push(nuevoPunto);
      // Forzamos la actualización del arreglo para que Angular detecte el cambio
      this.puntosRuta = [...this.puntosRuta]; 
    }
  }

  // Función para limpiar la ruta si se equivocan
  limpiarRuta() {
    this.puntosRuta = [];
  }

  agregarGrupo() {
    if (!this.nombre.trim()) {
      this.mostrarToast('Por favor escribe un nombre', 'warning');
      return;
    }
    
    if (this.puntosRuta.length < 2) {
       this.mostrarToast('Dibuja al menos 2 puntos en el mapa', 'warning');
       return;
    }

    // AQUÍ TIENES LA RUTA LISTA EN: this.puntosRuta
    console.log('Ruta a guardar:', this.puntosRuta);

    // Simulación de guardado exitoso
    this.mostrarToast(`Grupo ${this.nombre.toUpperCase()} creado con ruta`, 'success');
    this.cerrarModal();
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color
    });
    toast.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}