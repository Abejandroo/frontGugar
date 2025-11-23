import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← AGREGAR ESTO
import { IonicModule, ModalController, NavParams, AlertController } from '@ionic/angular';
import { GoogleMapsModule } from '@angular/google-maps';
import { RutaServiceTs } from 'src/app/service/ruta.service.ts';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  close,
  personOutline,
  carOutline,
  calendarOutline,
  location,
  searchOutline,
  businessOutline,
  locationOutline,
  trashOutline,
  createOutline,
  warningOutline,
  cutOutline
} from 'ionicons/icons';

interface MarkerData {
  position: google.maps.LatLngLiteral;
  label: google.maps.MarkerLabel;
  title: string;
}

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.page.html',
  styleUrls: ['./detalle-ruta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, GoogleMapsModule] // ← FormsModule agregado
})
export class DetalleRutaPage implements OnInit {

  mapaExpandido: boolean = false;
  ruta: any;

  // Día seleccionado
  diaSeleccionado: string = '';
  diasDisponibles: any[] = [];
  clientesDia: any[] = [];
  
  // Búsqueda
  textoBusqueda: string = '';
  clientesFiltrados: any[] = [];

  // Mapa
  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 };
  zoom = 13;
  markers: MarkerData[] = []; // ← Tipo corregido

  // Stats
  totalClientes: number = 0;
  visitados: number = 0;
  pendientes: number = 0;

  mapOptions: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true
};

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private rutasService: RutaServiceTs,
    private alertController: AlertController
  ) {
    addIcons({
      arrowBack,
      close,
      personOutline,
      carOutline,
      calendarOutline,
      location,
      searchOutline,
      businessOutline,
      locationOutline,
      trashOutline,
      createOutline,
      warningOutline,
      cutOutline
    });

    this.ruta = this.navParams.get('ruta');
  }

  ngOnInit() {
    this.cargarDiasDisponibles();
  }

  toggleMapa() {
  this.mapaExpandido = !this.mapaExpandido;
}

  cargarDiasDisponibles() {
    if (this.ruta.diasRuta && this.ruta.diasRuta.length > 0) {
      this.diasDisponibles = this.ruta.diasRuta;
      
      // Seleccionar el día actual por defecto
      const hoy = new Date().getDay();
      let diaDefault = this.diasDisponibles[0];
      
      if (hoy === 1 || hoy === 4) {
        diaDefault = this.diasDisponibles.find(d => d.diaSemana === 'Lunes - Jueves') || diaDefault;
      } else if (hoy === 2 || hoy === 5) {
        diaDefault = this.diasDisponibles.find(d => d.diaSemana === 'Martes - Viernes') || diaDefault;
      } else if (hoy === 3 || hoy === 6) {
        diaDefault = this.diasDisponibles.find(d => d.diaSemana === 'Miércoles - Sábado') || diaDefault;
      }
      
      this.diaSeleccionado = diaDefault.diaSemana;
      this.cambiarDia();
    }
  }

  cambiarDia() {
    const dia = this.diasDisponibles.find(d => d.diaSemana === this.diaSeleccionado);
    
    if (dia && dia.clientesRuta) {
      // Ordenar por ordenVisita
      this.clientesDia = dia.clientesRuta.sort((a: any, b: any) => 
        (a.ordenVisita || 0) - (b.ordenVisita || 0)
      );
      
      this.clientesFiltrados = [...this.clientesDia];
      this.calcularEstadisticas();
      this.actualizarMapa();
    }
  }

  calcularEstadisticas() {
    this.totalClientes = this.clientesDia.length;
    this.visitados = this.clientesDia.filter(c => c.visitado).length;
    this.pendientes = this.totalClientes - this.visitados;
  }

  actualizarMapa() {
    this.markers = [];
    const bounds = new google.maps.LatLngBounds();

    this.clientesDia.forEach((clienteRuta, index) => {
      const cliente = clienteRuta.cliente;
      const direccion = cliente.direcciones?.[0];
      
      if (direccion && direccion.latitud && direccion.longitud) {
        const position: google.maps.LatLngLiteral = { 
          lat: direccion.latitud, 
          lng: direccion.longitud 
        };

        this.markers.push({
          position,
          label: {
            text: `${clienteRuta.ordenVisita || index + 1}`,
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          title: cliente.representante
        });

        bounds.extend(position);
      }
    });

    // Ajustar vista del mapa
    if (this.markers.length > 0) {
      this.center = this.markers[0].position;
    }
  }

  buscarCliente(event: any) {
    const busqueda = event.target.value.toLowerCase();
    
    if (!busqueda) {
      this.clientesFiltrados = [...this.clientesDia];
      return;
    }

    this.clientesFiltrados = this.clientesDia.filter(cr => {
      const cliente = cr.cliente;
      return cliente.representante.toLowerCase().includes(busqueda) ||
             cliente.negocio?.toLowerCase().includes(busqueda) ||
             cliente.direcciones?.[0]?.direccion.toLowerCase().includes(busqueda);
    });
  }

  async eliminarCliente(clienteRuta: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar Cliente',
      message: `¿Eliminar a ${clienteRuta.cliente.representante} de esta ruta?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // TODO: Llamar al servicio para eliminar
            console.log('Eliminar cliente de ruta:', clienteRuta.id);
          }
        }
      ]
    });

    await alert.present();
  }

  editarCliente(clienteRuta: any) {
    // TODO: Abrir modal de edición
    console.log('Editar cliente:', clienteRuta);
  }

  async dividirRuta() {
    const alert = await this.alertController.create({
      header: 'Dividir Ruta',
      message: `Dividir "${this.diaSeleccionado}" en 2 sub-rutas?`,
      inputs: [
        {
          name: 'puntoCorte',
          type: 'number',
          placeholder: 'Dividir en el cliente número...',
          min: 1,
          max: this.clientesDia.length - 1
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Dividir',
          handler: (data) => {
            this.ejecutarDivision(parseInt(data.puntoCorte));
          }
        }
      ]
    });

    await alert.present();
  }

  ejecutarDivision(puntoCorte: number) {
    // TODO: Implementar división
    console.log(`Dividir ruta en cliente ${puntoCorte}`);
  }

  getDiaActual(): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[new Date().getDay()];
  }

  cerrar() {
    this.modalController.dismiss();
  }
}