import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, NavParams, ToastController } from '@ionic/angular';
import { close, trash, fingerPrint } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GoogleMapsModule } from '@angular/google-maps';
import { Auth } from 'src/app/service/auth';

@Component({
  selector: 'app-modificarruta',
  templateUrl: './modificarruta.page.html',
  styleUrls: ['./modificarruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GoogleMapsModule, ReactiveFormsModule],
})
export class ModificarrutaPage  {
  
  formRuta!: FormGroup;
  rutaSeleccionada: any; 
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
    private fb: FormBuilder,
    private authService: Auth,
    private navParams: NavParams
  ) {
    addIcons({ close, 'close-outline': close, trash, 'finger-print': fingerPrint });
    
    this.formRuta = this.fb.group({
      nombre: ['', Validators.required],
      rutaId: [null, Validators.required],
      lugarEntrega: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      acciones: [''],
    });
      this.cargarRepartidores();

    this.rutaSeleccionada = this.navParams.get('grupoSeleccionado');

    if (this.rutaSeleccionada) {
      console.log('Editando ruta:', this.rutaSeleccionada);
      
      this.formRuta.patchValue({
        nombre: this.rutaSeleccionada.nombre,
        rutaId: this.rutaSeleccionada.repartidor?.id || this.rutaSeleccionada.idRepartidor,
        lugarEntrega: this.rutaSeleccionada.lugarEntrega,
        cantidad: this.rutaSeleccionada.cantidad,
        acciones: this.rutaSeleccionada.acciones
      });

      this.cargarMapaExistente();
    }
  }


  cargarRepartidores() {
    this.authService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.repartidores = usuarios.filter(u => u.role === 'repartidor');
      }
    });
  }

  cargarMapaExistente() {
    if (this.rutaSeleccionada.coordenadas) {
      try {
        this.puntosRuta = typeof this.rutaSeleccionada.coordenadas === 'string'
          ? JSON.parse(this.rutaSeleccionada.coordenadas)
          : this.rutaSeleccionada.coordenadas;
        
        if (this.puntosRuta.length > 0) {
          this.center = this.puntosRuta[0];
          this.zoom = 15;
        }
      } catch (e) {
        console.error('Error cargando mapa:', e);
      }
    }
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

  async modificarGrupo() {
    if (this.formRuta.invalid) {
      this.mostrarToast('Revisa los campos obligatorios', 'warning');
      this.formRuta.markAllAsTouched();
      return;
    }
    
    if (this.puntosRuta.length < 2) {
       this.mostrarToast('La ruta debe tener un trazo en el mapa', 'warning');
       return;
    }

    const formValues = this.formRuta.value;
    
    const dataFinal = {
      nombre: formValues.nombre.toUpperCase(),
      idRepartidor: formValues.rutaId,
      lugarEntrega: formValues.lugarEntrega.toUpperCase(),
      cantidad: Number(formValues.cantidad),
      acciones: formValues.acciones ? formValues.acciones.toUpperCase() : '',
      coordenadas: this.puntosRuta
    };

    this.authService.actualizarRuta(this.rutaSeleccionada.id, dataFinal).subscribe({
      next: () => {
        this.mostrarToast('Ruta actualizada con éxito', 'success');
        this.modalController.dismiss(true);
      },
      error: (err) => {
        this.mostrarToast('Error al actualizar la ruta', 'danger');
      }
    });
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