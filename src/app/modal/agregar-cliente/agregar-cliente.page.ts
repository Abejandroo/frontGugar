import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, personOutline, callOutline, mailOutline, pricetagOutline, saveOutline, mapOutline, homeOutline, locationOutline } from 'ionicons/icons';
import { Cliente } from 'src/app/service/cliente'; 
import { PrecioService } from 'src/app/service/precio';
import { GoogleMapsModule } from '@angular/google-maps'; 

@Component({
  selector: 'app-agregar-cliente',
  templateUrl: './agregar-cliente.page.html',
  styleUrls: ['./agregar-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule] 
})
export class AgregarClientePage {

  formCliente: FormGroup;
  cargando: boolean = false;
  listaPrecios: any[] = [];

  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 }; 
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral | undefined; 
  
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true, 
    zoomControl: true,
    streetViewControl: false
  };
  pinOptions: google.maps.MarkerOptions = {
    draggable: false,
    animation: google.maps.Animation.DROP, 
  };

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private clienteService: Cliente,
    private precioService: PrecioService,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, personOutline, callOutline, mailOutline, pricetagOutline, saveOutline, mapOutline, homeOutline, locationOutline });

    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      correo: ['', [Validators.required, Validators.email]],
      tipoPrecioId: [null, [Validators.required]],
      
      calle: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      referencia: [''],
      
      latitud: [null, [Validators.required]], 
      longitud: [null, [Validators.required]]
    });
     this.cargarPreciosReales();
    this.obtenerUbicacionActual();
  }

  precioSeleccionado(event: any) {
    console.log('Precio seleccionado ID:', event.detail.value);
  }

  cargarPreciosReales() {
    this.precioService.obtenerPrecios().subscribe({
      next: (res) => this.listaPrecios = res,
      error: (err) => console.error(err)
    });
  }

  agregarMarcador(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      this.markerPosition = { lat, lng };
      
      this.formCliente.patchValue({
        latitud: lat,
        longitud: lng
      });
    }
  }

  obtenerUbicacionActual() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      });
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async guardarCliente() {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      // Si falta el mapa, avisamos
      if (!this.formCliente.value.latitud) {
        this.mostrarToast('Por favor, selecciona la ubicación en el mapa.', 'warning');
      }
      return;
    }

    this.cargando = true;
    const datos = this.formCliente.value;

    this.clienteService.crearCliente(datos).subscribe({
      next: async (res) => {
        this.cargando = false;
        await this.mostrarToast('Cliente registrado con éxito', 'success');
        this.modalCtrl.dismiss({ registrado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error(err);
        const msg = err.error?.message || 'Error al guardar';
        await this.mostrarToast(msg, 'danger');
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}