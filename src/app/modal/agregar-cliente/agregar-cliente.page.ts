import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  close, personOutline, callOutline, mailOutline, pricetagOutline, 
  saveOutline, mapOutline, homeOutline, locationOutline, businessOutline,
   calendarOutline 
} from 'ionicons/icons';
import { ClienteService } from 'src/app/service/cliente.service'; 
import { PrecioService } from 'src/app/service/precio';
import { RutaService } from 'src/app/service/ruta.service';
import { GoogleMapsModule } from '@angular/google-maps'; 

@Component({
  selector: 'app-agregar-cliente',
  templateUrl: './agregar-cliente.page.html',
  styleUrls: ['./agregar-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule] 
})
export class AgregarClientePage implements OnInit {

  @Input() supervisorId?: number; // Opcional: si viene, filtra solo rutas de este supervisor

  formCliente: FormGroup;
  cargando: boolean = false;
  listaPrecios: any[] = [];
  rutasDisponibles: any[] = [];

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
    private clienteService: ClienteService,
    private precioService: PrecioService,
    private rutaService: RutaService,
    private toastCtrl: ToastController
  ) {
    addIcons({ 
      close, personOutline, callOutline, mailOutline, pricetagOutline, 
      saveOutline, mapOutline, homeOutline, locationOutline, businessOutline,
       calendarOutline
    });

    // ✅ FORMULARIO AJUSTADO AL DTO
    this.formCliente = this.fb.group({
      // CAMPOS REQUERIDOS
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]], // ← Cambio: "representante" → "nombre"
      telefono: ['', [Validators.required, Validators.maxLength(15)]],
      correo: ['', [Validators.email]], // ← Opcional pero con validación de email
      tipoPrecioId: [null, [Validators.required]],
      calle: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      
      // CAMPOS OPCIONALES
      referencia: [''], // ← Opcional
      latitud: [null], // ← Opcional (aunque en el mapa lo marcamos como requerido)
      longitud: [null], // ← Opcional
      cte: [null], // ← Opcional
      negocio: [''], // ← Opcional
      diaRutaId: [null] // ← Opcional (para asignar a ruta)
    });
  }

  ngOnInit() {
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
        // Aplanar todas las rutas con sus días
        this.rutasDisponibles = [];
        
        rutas.forEach(ruta => {
          // Si hay supervisorId, filtrar solo las rutas de ese supervisor
          if (this.supervisorId && ruta.supervisor?.id !== this.supervisorId) {
            return; // Skip esta ruta
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
      this.mostrarToast('Por favor, completa los campos requeridos.', 'warning');
      return;
    }

    // ✅ Validar que tenga ubicación (aunque sea opcional en el DTO)
    if (!this.formCliente.value.latitud || !this.formCliente.value.longitud) {
      this.mostrarToast('Por favor, selecciona la ubicación en el mapa.', 'warning');
      return;
    }

    this.cargando = true;

    // ✅ PREPARAR DATOS SEGÚN EL DTO
    const datos: any = {
      nombre: this.formCliente.value.nombre, // ← Campo requerido
      telefono: this.formCliente.value.telefono, // ← Campo requerido
      tipoPrecioId: this.formCliente.value.tipoPrecioId, // ← Campo requerido
      calle: this.formCliente.value.calle, // ← Campo requerido
      colonia: this.formCliente.value.colonia, // ← Campo requerido
    };

    // ✅ Agregar campos opcionales solo si tienen valor
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
        // Si se seleccionó una ruta, asignar el cliente
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