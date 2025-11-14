import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ModalController, NavParams, ToastController, AlertController } from '@ionic/angular';
import { close, trash, map } from 'ionicons/icons'; // Agregué iconos nuevos
import { addIcons } from 'ionicons';
// 1. Importamos Google Maps
import { GoogleMapsModule } from '@angular/google-maps';

@Component({
  selector: 'app-modificarruta',
  templateUrl: './modificarruta.page.html',
  styleUrls: ['./modificarruta.page.scss'],
  standalone: true,
  // 2. Agregamos el módulo
  imports: [IonicModule, FormsModule, ReactiveFormsModule, CommonModule, GoogleMapsModule],
})
export class ModificarrutaPage {
  grupoSeleccionado: any;
  nombre: string = '';
  grupoCarreraId: number = 0;
  grupos: any[] = [];
  selectedGrupoId: string = '';

  // --- VARIABLES DEL MAPA ---
  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 }; // Oaxaca
  zoom = 14;
  puntosRuta: google.maps.LatLngLiteral[] = []; // Aquí se guarda el trazo
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#3880ff',
    strokeOpacity: 1.0,
    strokeWeight: 4,
  };
  // --------------------------

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private http: HttpClient,
    private readonly navParams: NavParams
  ) {
    this.grupoSeleccionado = this.navParams.get('grupoSeleccionado');
    
    // Inicialización segura
    if (this.grupoSeleccionado) {
      this.nombre = this.grupoSeleccionado.nombre;
      this.grupoCarreraId = this.grupoSeleccionado.carreraId;
      // Si al abrir el modal ya venía con ruta, intentamos cargarla
      this.cargarRutaEnMapa(this.grupoSeleccionado);
    }

    this.loadGrupos();
    addIcons({ close, 'close-outline': close, trash, map });
  }

  // --- LÓGICA DEL MAPA (IGUAL QUE EN AGREGAR) ---
  agregarPuntoAlMapa(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const nuevoPunto = event.latLng.toJSON();
      this.puntosRuta.push(nuevoPunto);
      this.puntosRuta = [...this.puntosRuta]; // Refresh para Angular
    }
  }

  limpiarRuta() {
    this.puntosRuta = [];
  }

  // Función auxiliar para leer las coordenadas del objeto
  cargarRutaEnMapa(grupo: any) {
    // AQUÍ ES IMPORTANTE: Asumo que en tu BD el campo se llama 'coordenadas' o 'ruta'
    // y que viene como un string JSON o un array.
    if (grupo && grupo.coordenadas) {
      try {
        // Si viene como string (ej: "[{lat:..., lng:...}]"), lo parseamos
        if (typeof grupo.coordenadas === 'string') {
           this.puntosRuta = JSON.parse(grupo.coordenadas);
        } else {
           // Si ya es objeto
           this.puntosRuta = grupo.coordenadas;
        }
        
        // Centrar el mapa en el primer punto de la ruta cargada
        if(this.puntosRuta.length > 0) {
            this.center = this.puntosRuta[0];
        }
      } catch (e) {
        console.error('Error al leer coordenadas', e);
      }
    } else {
      this.puntosRuta = []; // Si no tiene ruta, limpiamos
    }
  }
  // ----------------------------------------------

  loadGrupos() {
    this.http.get<any[]>('https://backescolar-production.up.railway.app/grupos/getAll').subscribe({
      next: (data) => this.grupos = data,
      error: () => this.mostrarToastError('Error al cargar los grupos')
    });
  }

  modificarGrupo() {
    // Preparamos el objeto con el nombre Y las coordenadas
    const grupoActualizado = {
      nombre: this.nombre,
      // Convertimos el array del mapa a string para enviarlo (o directo si tu backend recibe JSON)
      coordenadas: JSON.stringify(this.puntosRuta) 
    };

    this.http.patch(`https://backescolar-production.up.railway.app/grupos/update/${this.grupoCarreraId}`, grupoActualizado)
      .subscribe({
        next: () => {
          this.mostrarToastSuccess('Ruta modificada correctamente');
          this.cerrarModal();
        },
        error: () => this.mostrarToastError('Error al modificar la ruta')
      });
  }

  onGrupoChange(event: any) {
    const grupo = this.grupos.find(g => g.id === this.grupoCarreraId);
    if (grupo) {
      this.nombre = grupo.nombre;
      // ✨ MAGIA: Cuando cambias el select, cargamos el trazo en el mapa
      this.cargarRutaEnMapa(grupo);
    }
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  async mostrarToastSuccess(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }

  async mostrarToastError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: 'danger'
    });
    toast.present();
  }
}