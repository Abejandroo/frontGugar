import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { addIcons } from 'ionicons';
import {
  close, personOutline, callOutline, mailOutline, pricetagOutline,
  saveOutline, mapOutline, homeOutline, locationOutline, fingerPrint,
  checkmarkCircle, businessOutline, calendarOutline, swapHorizontalOutline
} from 'ionicons/icons';
import { ClienteService } from 'src/app/service/cliente.service';
import { PrecioService } from 'src/app/service/precio';
import { RutaService } from 'src/app/service/ruta.service';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

// ✅ FIX: Declarar google como variable global
declare var google: any;

@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.page.html',
  styleUrls: ['./editar-cliente.page.scss'],
  standalone: true,
  imports: [...IonicSharedComponents, CommonModule, FormsModule, ReactiveFormsModule, GoogleMapsModule]
})
export class EditarClientePage implements OnInit {

  @Input() cliente: any;

  formCliente: FormGroup;
  cargando: boolean = false;
  listaPrecios: any[] = [];
  rutasDisponibles: any[] = [];

  rutaActual: { rutaNombre: string; diaSemana: string; diaRutaId: number } | null = null;

  // ✅ FIX: Valores iniciales SIN usar google.maps en la declaración
  center = { lat: 17.0732, lng: -96.7266 };
  zoom = 15;
  markerPosition: { lat: number; lng: number } | undefined;
  mapOptions = { disableDefaultUI: true, zoomControl: true };
  
  // ✅ FIX: pinOptions sin Animation (se asigna en ngOnInit)
  pinOptions: any = { draggable: false };

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
      checkmarkCircle, businessOutline, calendarOutline, swapHorizontalOutline
    });

    this.formCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      negocio: [''],
      cte: [''],
      telefono: [''],
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
    // ✅ FIX: Configurar Animation DESPUÉS de que el componente se inicializa
    if (typeof google !== 'undefined' && google.maps) {
      this.pinOptions = {
        draggable: false,
        animation: google.maps.Animation.DROP
      };
    }

    this.cargarPrecios();
    this.cargarRutas();

    if (this.cliente) {
      console.log('📝 Editando cliente:', this.cliente);

      this.formCliente.patchValue({
        nombre: this.cliente.nombre || '',
        negocio: this.cliente.negocio || '',
        cte: this.cliente.cte || '',
        telefono: this.cliente.telefono || '',
        correo: this.cliente.correo || '',
        tipoPrecioId: this.cliente.tipoPrecio?.id || this.cliente.tipoPrecioId,
        calle: this.cliente.calle || '',
        colonia: this.cliente.colonia || '',
        referencia: this.cliente.referencia || '',
        latitud: this.cliente.latitud,
        longitud: this.cliente.longitud
      });

      if (this.cliente.ruta && this.cliente.diaRuta) {
        this.rutaActual = {
          rutaNombre: this.cliente.ruta.nombre,
          diaSemana: this.cliente.diaRuta.diaSemana,
          diaRutaId: this.cliente.diaRuta.id
        };
      }

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
      next: (res) => {
        this.listaPrecios = res;
      },
      error: (err) => console.error('Error cargando precios:', err)
    });
  }

  cargarRutas() {
    this.rutaService.obtenerTodasLasRutas().subscribe({
      next: (rutas) => {
        this.rutasDisponibles = [];
        rutas.forEach(ruta => {
          if (ruta.diasRuta && ruta.diasRuta.length > 0) {
            ruta.diasRuta.forEach((dia: any) => {

              if (dia.dividida === false || dia.dividida === 0) {
                this.rutasDisponibles.push({
                  diaRutaId: dia.id,
                  label: `${ruta.nombre} - ${dia.diaSemana}`,
                  ruta: ruta.nombre,
                  dia: dia.diaSemana
                });
              }
            });
          }
        });
      },
      error: (err) => console.error('Error cargando rutas:', err)
    });
  }

  // ✅ FIX: Tipo cambiado de google.maps.MapMouseEvent a any
  agregarMarcador(event: any) {
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

      Object.keys(this.formCliente.controls).forEach(key => {
        const control = this.formCliente.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido: ${key}`, control.errors);
        }
      });

      await this.mostrarToast('Por favor completa los campos requeridos', 'warning');
      return;
    }

    this.cargando = true;
    const formValue = this.formCliente.value;

    const datos: any = {
      nombre: formValue.nombre?.trim() || '',
      tipoPrecioId: Number(formValue.tipoPrecioId),
      calle: formValue.calle?.trim() || '',
      colonia: formValue.colonia?.trim() || '',

      negocio: formValue.negocio?.trim() || null,
      cte: formValue.cte ? Number(formValue.cte) : null,
      telefono: formValue.telefono?.trim() || null,
      correo: formValue.correo?.trim() || null,
      referencia: formValue.referencia?.trim() || null,
      latitud: formValue.latitud ? Number(formValue.latitud) : null,
      longitud: formValue.longitud ? Number(formValue.longitud) : null
    };

    this.clienteService.actualizarCliente(this.cliente.id, datos).subscribe({
      next: async (response) => {
        this.cargando = false;
        await this.mostrarToast('Cliente actualizado correctamente', 'success');
        this.modalCtrl.dismiss({ actualizado: true });
      },
      error: async (err) => {
        this.cargando = false;
        console.error('Error completo:', err);
        console.error('Error.error:', err.error);
        console.error('Error.message:', err.message);
        console.error('Error.status:', err.status);

        let mensaje = 'Error al actualizar cliente';

        if (err.status === 400) {
          if (err.error?.message && Array.isArray(err.error.message)) {
            mensaje = err.error.message.join(', ');
          } else if (err.error?.message) {
            mensaje = err.error.message;
          } else {
            mensaje = 'Datos inválidos. Verifica los campos.';
          }
        } else if (err.status === 404) {
          mensaje = 'Cliente no encontrado';
        } else if (err.status === 500) {
          mensaje = 'Error en el servidor. Intenta de nuevo.';
        } else if (err.status === 0) {
          mensaje = 'No se pudo conectar con el servidor';
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

    if (this.rutaActual) {
      this.rutaService.desasignarClienteDeRuta(this.cliente.id, this.rutaActual.diaRutaId).subscribe({
        next: () => {
          this.asignarANuevaRuta(nuevoDiaRutaId);
        },
        error: async (err) => {
          this.cargando = false;
          console.error('Error al desasignar:', err);
          await this.mostrarToast('Error al cambiar de ruta', 'danger');
        }
      });
    } else {
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
      duration: 2500,
      color,
      position: 'top'
    });
    toast.present();
  }
}