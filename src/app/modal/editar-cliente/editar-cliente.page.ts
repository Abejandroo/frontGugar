import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { addIcons } from 'ionicons';
import { 
  close, personOutline, callOutline, mailOutline, pricetagOutline, 
  saveOutline, mapOutline, homeOutline, locationOutline, fingerPrint, 
  checkmarkCircle, businessOutline,  calendarOutline, swapHorizontalOutline
} from 'ionicons/icons';
import { ClienteService } from 'src/app/service/cliente.service';
import { PrecioService } from 'src/app/service/precio';
import { RutaService } from 'src/app/service/ruta.service';

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.page.html',
  styleUrls: ['./editar-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule]
})
export class EditarClientePage implements OnInit {

  @Input() cliente: any;

  formCliente: FormGroup;
  cargando: boolean = false;
  listaPrecios: any[] = [];
  rutasDisponibles: any[] = [];
  
  // Info de ruta actual del cliente
  rutaActual: { rutaNombre: string; diaSemana: string; diaRutaId: number } | null = null;

  // Mapa
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
    private rutaService: RutaService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({ 
      close, personOutline, callOutline, mailOutline, pricetagOutline, 
      saveOutline, mapOutline, homeOutline, locationOutline, fingerPrint, 
      checkmarkCircle, businessOutline,  calendarOutline, swapHorizontalOutline
    });

    this.formCliente = this.fb.group({
      representante: ['', [Validators.required, Validators.minLength(3)]],
      negocio: [''],
      cte: [''],
      telefono: ['', [Validators.required]],
      correo: ['', [Validators.email]],
      tipoPrecioId: [null, [Validators.required]],
      calle: ['', [Validators.required]],
      colonia: ['', [Validators.required]],
      referencia: [''],
      latitud: [null],
      longitud: [null]
    });
  }

  ngOnInit() {
    this.cargarPrecios();
    this.cargarRutas();

    if (this.cliente) {
      console.log('Editando cliente:', this.cliente);

      // Cargar datos del cliente
      this.formCliente.patchValue({
        representante: this.cliente.representante,
        negocio: this.cliente.negocio,
        cte: this.cliente.cte,
        telefono: this.cliente.telefono,
        correo: this.cliente.correo,
        tipoPrecioId: this.cliente.tipoPrecio?.id || this.cliente.tipoPrecioId,
        calle: this.cliente.calle,
        colonia: this.cliente.colonia,
        referencia: this.cliente.referencia,
        latitud: this.cliente.latitud,
        longitud: this.cliente.longitud
      });

      // Si tiene ruta asignada, guardar la info
      if (this.cliente.ruta && this.cliente.diaRuta) {
        this.rutaActual = {
          rutaNombre: this.cliente.ruta.nombre,
          diaSemana: this.cliente.diaRuta.diaSemana,
          diaRutaId: this.cliente.diaRuta.id
        };
      }

      // Centrar mapa en ubicación del cliente
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
      next: (res) => this.listaPrecios = res,
      error: (err) => console.error('Error cargando precios', err)
    });
  }

  cargarRutas() {
    this.rutaService.obtenerTodasLasRutas().subscribe({
      next: (rutas) => {
        this.rutasDisponibles = [];
        rutas.forEach(ruta => {
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
    const formValue = this.formCliente.value;

    const datos = {
      ...formValue,
      cte: Number(formValue.cte),
      tipoPrecioId: Number(formValue.tipoPrecioId),
      latitud: formValue.latitud ? Number(formValue.latitud) : null,
      longitud: formValue.longitud ? Number(formValue.longitud) : null
    };

    this.clienteService.actualizarCliente(this.cliente.id, datos).subscribe({
      next: async () => {
        this.cargando = false;
        await this.mostrarToast('Cliente actualizado correctamente', 'success');
        this.modalCtrl.dismiss({ actualizado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error('Error detallado:', err);
        
        let mensaje = 'Error al actualizar';
        if (err.error?.message && Array.isArray(err.error.message)) {
          mensaje = err.error.message.join(', ');
        }
        await this.mostrarToast(mensaje, 'danger');
      }
    });
  }

  async cambiarRuta() {
    const alert = await this.alertCtrl.create({
      header: this.rutaActual ? 'Cambiar de Ruta' : 'Asignar a Ruta',
      message: this.rutaActual 
        ? `Actualmente en: ${this.rutaActual.rutaNombre} - ${this.rutaActual.diaSemana}` 
        : 'Selecciona la ruta a asignar',
      inputs: [
        {
          label: 'Sin asignar (Quitar de ruta)',
          type: 'radio',
          value: null,
          checked: !this.rutaActual
        },
        ...this.rutasDisponibles.map(rd => ({
          label: rd.label,
          type: 'radio' as const,
          value: rd.diaRutaId,
          checked: this.rutaActual?.diaRutaId === rd.diaRutaId
        }))
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (diaRutaId) => {
            await this.procesarCambioRuta(diaRutaId);
          }
        }
      ]
    });

    await alert.present();
  }

  async procesarCambioRuta(nuevoDiaRutaId: number | null) {
    this.cargando = true;

    // Si es null, desasignar de ruta
    if (nuevoDiaRutaId === null && this.rutaActual) {
      this.rutaService.desasignarClienteDeRuta(this.cliente.id, this.rutaActual.diaRutaId).subscribe({
        next: async () => {
          this.cargando = false;
          this.rutaActual = null;
          await this.mostrarToast('Cliente quitado de la ruta', 'success');
        },
        error: async (err) => {
          this.cargando = false;
          console.error('Error al desasignar:', err);
          await this.mostrarToast('Error al quitar de ruta', 'danger');
        }
      });
      return;
    }

    // Si hay ruta anterior, primero desasignar
    if (this.rutaActual) {
      this.rutaService.desasignarClienteDeRuta(this.cliente.id, this.rutaActual.diaRutaId).subscribe({
        next: () => {
          // Luego asignar a la nueva ruta
          this.asignarANuevaRuta(nuevoDiaRutaId);
        },
        error: async (err) => {
          this.cargando = false;
          console.error('Error al desasignar:', err);
          await this.mostrarToast('Error al cambiar de ruta', 'danger');
        }
      });
    } else {
      // Si no tiene ruta, asignar directamente
      this.asignarANuevaRuta(nuevoDiaRutaId);
    }
  }

 asignarANuevaRuta(diaRutaId: number | null) {
  if (!diaRutaId) {
    this.cargando = false;
    return;
  }

  const tipoPrecioId = this.formCliente.value.tipoPrecioId;

  this.rutaService.asignarClienteARuta({
    clienteId: this.cliente.id,
    diaRutaId,
    precioId: tipoPrecioId
  }).subscribe({
    next: async () => {
      this.cargando = false;
      
      const rutaSeleccionada = this.rutasDisponibles.find(r => r.diaRutaId === diaRutaId);
      if (rutaSeleccionada) {
        this.rutaActual = {
          rutaNombre: rutaSeleccionada.ruta,
          diaSemana: rutaSeleccionada.dia,
          diaRutaId: diaRutaId
        };
      }
      
      await this.mostrarToast('Cliente asignado a nueva ruta', 'success');
    },
    error: async (err) => {
      this.cargando = false;
      console.error('Error al asignar:', err);
      await this.mostrarToast('Error al asignar a ruta', 'danger');
    }
  });
}
  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ 
      message: msg, 
      duration: 2000, 
      color, 
      position: 'bottom' 
    });
    toast.present();
  }
}