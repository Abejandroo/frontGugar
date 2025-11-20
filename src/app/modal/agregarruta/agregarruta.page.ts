import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { close, trash, fingerPrint, arrowUndo, repeat, saveOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { GoogleMapsModule } from '@angular/google-maps';
import { Auth } from 'src/app/service/auth'; 

@Component({
  selector: 'app-agregarruta',
  templateUrl: './agregarruta.page.html',
  styleUrls: ['./agregarruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, GoogleMapsModule, ReactiveFormsModule],
})
export class AgregarrutaPage {
  
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
    private fb: FormBuilder,
    private authService: Auth 
  ) {
    addIcons({ 
      close, 'close-outline': close, 
      trash, 'finger-print': fingerPrint,
      'arrow-undo': arrowUndo,
      'repeat': repeat,
      'save-outline': saveOutline
    });
    
    this.formRuta = this.fb.group({
      nombre: ['', Validators.required],
      rutaId: [null, Validators.required], 
      lugarEntrega: ['', Validators.required],
      cantidad: ['', [Validators.required, Validators.min(1)]],
      acciones: [''],
    });
    
    this.cargarRepartidores();
  }

  cargarRepartidores() {
    this.authService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.repartidores = usuarios.filter(u => u.role === 'repartidor');
      },
      error: (err) => console.error('Error cargando repartidores', err)
    });
  }

  agregarPuntoAlMapa(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const nuevoPunto = event.latLng.toJSON();
      this.puntosRuta.push(nuevoPunto);
      this.puntosRuta = [...this.puntosRuta]; 
    }
  }

  obtenerLetraMarcador(index: number): string {
    return String.fromCharCode(65 + (index % 26));
  }

  deshacerUltimo() {
    if (this.puntosRuta.length > 0) {
      this.puntosRuta.pop();
      this.puntosRuta = [...this.puntosRuta];
    }
  }

  cerrarCircuito() {
    if (this.puntosRuta.length < 2) {
      this.mostrarToast('Necesitas al menos 2 puntos para cerrar un circuito', 'warning');
      return;
    }

    const puntoInicial = this.puntosRuta[0];
    
    this.puntosRuta.push(puntoInicial);
    this.puntosRuta = [...this.puntosRuta];
    
    this.mostrarToast('Circuito cerrado: Regreso al punto A', 'success');
  }

  limpiarRuta() {
    this.puntosRuta = [];
  }

  async agregarGrupo() {
    if (this.formRuta.invalid) {
      this.mostrarToast('Por favor completa los campos obligatorios', 'warning');
      this.formRuta.markAllAsTouched();
      return;
    }
    
    if (this.puntosRuta.length < 2) {
      this.mostrarToast('Dibuja la ruta en el mapa (mínimo 2 puntos)', 'warning');
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

    console.log('Enviando ruta:', dataFinal);

    this.authService.crearRuta(dataFinal).subscribe({
      next: () => {
        this.mostrarToast('Ruta creada correctamente', 'success');
        this.modalController.dismiss(true);
      },
      error: (err) => {
        console.error(err);
        this.mostrarToast('Error al guardar la ruta', 'danger');
      }
    });
  }

  cargarAlumnosDelGrupo() {} 

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