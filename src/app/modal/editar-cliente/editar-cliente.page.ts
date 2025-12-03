import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps'; 
import { addIcons } from 'ionicons';
import { close, personOutline, callOutline, mailOutline, pricetagOutline, saveOutline, mapOutline, homeOutline, locationOutline, fingerPrint, checkmarkCircle } from 'ionicons/icons';
import { ClienteService } from 'src/app/service/cliente.service'; 
import { PrecioService } from 'src/app/service/precio';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.page.html',
  styleUrls: ['./editar-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule]
})
export class EditarClientePage{

  @Input() cliente: any; 

  formCliente: FormGroup;
  cargando: boolean = false;
  listaPrecios: any[] = [];

  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 };
  zoom = 15;
  markerPosition: google.maps.LatLngLiteral | undefined;
  mapOptions: google.maps.MapOptions = { disableDefaultUI: true, zoomControl: true };
  pinOptions: google.maps.MarkerOptions = { draggable: false, animation: google.maps.Animation.DROP };

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private clienteService: ClienteService,
    private precioService: PrecioService,
    private toastCtrl: ToastController
  ) {
    addIcons({ close, personOutline, callOutline, mailOutline, pricetagOutline, saveOutline, mapOutline, homeOutline, locationOutline, fingerPrint, checkmarkCircle });

    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      tipoPrecioId: [null, [Validators.required]],
      calle: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      referencia: [''],
      latitud: [null],
      longitud: [null]
    });
     this.cargarPrecios();
    
    if (this.cliente) {
      this.formCliente.patchValue({
        nombre: this.cliente.nombre,
        telefono: this.cliente.telefono,
        correo: this.cliente.correo,
        tipoPrecioId: this.cliente.tipoPrecioId,
        calle: this.cliente.calle,
        colonia: this.cliente.colonia,
        referencia: this.cliente.referencia,
        latitud: this.cliente.latitud,
        longitud: this.cliente.longitud
      });

      if (this.cliente.latitud && this.cliente.longitud) {
        const pos = { 
          lat: Number(this.cliente.latitud), 
          lng: Number(this.cliente.longitud) 
        };
        this.markerPosition = pos;
        this.center = pos;
      }
    }
  }

  cargarPrecios() {
    this.precioService.obtenerPrecios().subscribe({
      next: (res) => this.listaPrecios = res
    });
  }

  agregarMarcador(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.markerPosition = { lat, lng };
      this.formCliente.patchValue({ latitud: lat, longitud: lng });
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async actualizarCliente() {
    if (this.formCliente.invalid) {
      this.formCliente.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const datos = this.formCliente.value;

    this.clienteService.actualizarClientePorId(this.cliente.id, datos).subscribe({
      next: async () => {
        this.cargando = false;
        await this.mostrarToast('Cliente actualizado correctamente', 'success');
        this.modalCtrl.dismiss({ actualizado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error(err);
        await this.mostrarToast('Error al actualizar', 'danger');
      }
    });
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}