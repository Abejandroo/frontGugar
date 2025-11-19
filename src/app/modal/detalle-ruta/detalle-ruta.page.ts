import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { addIcons } from 'ionicons';
import { close, navigateCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GoogleMapsModule],
})
export class DetalleRutaPage{
  
  ruta: any;
  
  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 };
  zoom = 14;
  puntosRuta: google.maps.LatLngLiteral[] = [];
  
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#3880ff',
    strokeOpacity: 1.0,
    strokeWeight: 5,
  };

  constructor(
    private modalController: ModalController,
    private navParams: NavParams
  ) {
    addIcons({ close, navigateCircleOutline });
     this.ruta = this.navParams.get('ruta');
    console.log('🗺️ Modal Detalle - Ruta recibida:', this.ruta);

    if (this.ruta && this.ruta.coordenadas) {
      try {
        this.puntosRuta = typeof this.ruta.coordenadas === 'string' 
          ? JSON.parse(this.ruta.coordenadas) 
          : this.ruta.coordenadas;
        if (this.puntosRuta.length > 0) {
          this.center = { 
            lat: Number(this.puntosRuta[0].lat), 
            lng: Number(this.puntosRuta[0].lng) 
          };
          this.zoom = 15;
        }
      } catch (e) {
        console.error('Error al leer coordenadas:', e);
      }
    } else {
      console.warn('⚠️ La ruta no tiene coordenadas guardadas.');
    }
  }


  abrirEnGoogleMaps() {
    if (this.puntosRuta.length === 0) return;

    const origen = this.puntosRuta[0];
    const destino = this.puntosRuta[this.puntosRuta.length - 1];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origen.lat},${origen.lng}&destination=${destino.lat},${destino.lng}&travelmode=driving`;
    window.open(url, '_system');
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}