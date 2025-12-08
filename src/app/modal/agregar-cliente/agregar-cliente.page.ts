import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  close, personOutline, callOutline, mailOutline, pricetagOutline,
  saveOutline, mapOutline, homeOutline, locationOutline, businessOutline,
  calendarOutline, checkmarkCircle } from 'ionicons/icons';
import { ClienteService } from 'src/app/service/cliente.service';
import { PrecioService } from 'src/app/service/precio';
import { RutaService } from 'src/app/service/ruta.service';
import { GoogleMapsModule } from '@angular/google-maps';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

// ✅ FIX: Declarar google como variable global
declare var google: any;

@Component({
  selector: 'app-agregar-cliente',
  templateUrl: './agregar-cliente.page.html',
  styleUrls: ['./agregar-cliente.page.scss'],
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule],
providers: [...IonicControllers]
})
export class AgregarClientePage implements OnInit {

  @Input() supervisorId?: number;

  formCliente: FormGroup;
  cargando: boolean = false;
  listaPrecios: any[] = [];
  rutasDisponibles: any[] = [];

  // ✅ FIX: Valores iniciales SIN usar google.maps
  center = { lat: 17.0732, lng: -96.7266 };
  zoom = 15;
  markerPosition: { lat: number; lng: number } | undefined;

  mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false
  };

  // ✅ FIX: pinOptions sin Animation (se asigna en ngOnInit)
  pinOptions: any = {
    draggable: false
  };

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private clienteService: ClienteService,
    private precioService: PrecioService,
    private rutaService: RutaService,
    private toastCtrl: ToastController
  ) {
    addIcons({close,personOutline,businessOutline,callOutline,mailOutline,pricetagOutline,mapOutline,homeOutline,locationOutline,calendarOutline,checkmarkCircle,saveOutline});

    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      correo: ['', [Validators.email]],
      tipoPrecioId: [null, [Validators.required]],
      calle: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      referencia: [''],
      latitud: [null],
      longitud: [null],
      cte: [null],
      negocio: [''],
      diaRutaId: [null]
    });
  }

  ngOnInit() {
    // ✅ FIX: Configurar Animation DESPUÉS de que el componente se inicializa
    // Para este momento, Google Maps ya debería estar cargado
    if (typeof google !== 'undefined' && google.maps) {
      this.pinOptions = {
        draggable: false,
        animation: google.maps.Animation.DROP
      };
    }

    this.cargarPreciosReales();
    this.cargarRutas();
    this.obtenerUbicacionActual();
  }

  cargarPreciosReales() {
    this.precioService.obtenerPrecios().subscribe({
      next: (res) => this.listaPrecios = res,
      error: (err) => console.error(err)
    });
  }

  cargarRutas() {
    this.rutaService.obtenerTodasLasRutas().subscribe({
      next: (rutas) => {
        this.rutasDisponibles = [];

        rutas.forEach(ruta => {
          if (this.supervisorId && ruta.supervisor?.id !== this.supervisorId) {
            return;
          }

          if (ruta.diasRuta && ruta.diasRuta.length > 0) {
            ruta.diasRuta.forEach((dia: any) => {
              this.rutasDisponibles.push({
                diaRutaId: dia.id,
                label: `${ruta.nombre} - ${dia.diaSemana}`,
                ruta: ruta.nombre,
                dia: dia.diaSemana
              });
            });
          }
        });
      },
      error: (err) => console.error('Error cargando rutas:', err)
    });
  }

  agregarMarcador(event: any) {
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
      this.mostrarToast('Por favor, completa los campos requeridos.', 'warning');
      return;
    }

    if (!this.formCliente.value.latitud || !this.formCliente.value.longitud) {
      this.mostrarToast('Por favor, selecciona la ubicación en el mapa.', 'warning');
      return;
    }

    this.cargando = true;

    const datos: any = {
      nombre: this.formCliente.value.nombre,
      telefono: this.formCliente.value.telefono,
      tipoPrecioId: this.formCliente.value.tipoPrecioId,
      calle: this.formCliente.value.calle,
      colonia: this.formCliente.value.colonia,
    };

    if (this.formCliente.value.correo) {
      datos.correo = this.formCliente.value.correo;
    }

    if (this.formCliente.value.referencia) {
      datos.referencia = this.formCliente.value.referencia;
    }

    if (this.formCliente.value.latitud) {
      datos.latitud = this.formCliente.value.latitud;
    }

    if (this.formCliente.value.longitud) {
      datos.longitud = this.formCliente.value.longitud;
    }

    if (this.formCliente.value.cte) {
      datos.cte = Number(this.formCliente.value.cte);
    }

    if (this.formCliente.value.negocio) {
      datos.negocio = this.formCliente.value.negocio;
    }

    if (this.formCliente.value.diaRutaId) {
      datos.diaRutaId = this.formCliente.value.diaRutaId;
    }

    this.clienteService.crearCliente(datos).subscribe({
      next: async (clienteCreado) => {
        if (datos.diaRutaId) {
          await this.asignarClienteARuta(clienteCreado.id, datos.diaRutaId, datos.tipoPrecioId);
        } else {
          this.cargando = false;
          await this.mostrarToast('Cliente registrado con éxito', 'success');
          this.modalCtrl.dismiss({ registrado: true });
        }
      },
      error: async (err) => {
        this.cargando = false;
        console.error(err);
        const msg = err.error?.message || 'Error al guardar';
        await this.mostrarToast(msg, 'danger');
      }
    });
  }

  async asignarClienteARuta(clienteId: number, diaRutaId: number, precioId: number) {
    this.rutaService.asignarClienteARuta({
      clienteId,
      diaRutaId,
      precioId
    }).subscribe({
      next: async () => {
        this.cargando = false;
        await this.mostrarToast('Cliente registrado y asignado a ruta', 'success');
        this.modalCtrl.dismiss({ registrado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error('Error al asignar a ruta:', err);
        await this.mostrarToast('Cliente creado pero no se pudo asignar a la ruta', 'warning');
        this.modalCtrl.dismiss({ registrado: true });
      }
    });
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}