import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Para navegación
import { IonicModule, LoadingController } from '@ionic/angular';
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { GoogleMapsModule } from '@angular/google-maps';
import { RutaService } from 'src/app/service/ruta';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent, GoogleMapsModule]
})
export class RutasComponent implements OnInit {

  rutaId: number | null = null;
  rutaData: any = null;
  cargando: boolean = true;
  clientesLista: any[] = []; // Lista plana de clientes para mostrar

  // --- MAPA ---
  center: google.maps.LatLngLiteral = { lat: 17.0732, lng: -96.7266 }; // Default Oaxaca
  zoom = 13;
  mapOptions: google.maps.MapOptions = { 
    disableDefaultUI: true, // Mapa limpio
    styles: [ /* Aquí podrías poner un estilo oscuro si quieres */ ] 
  };
  
  // Marcadores (Clientes y Repartidor)
  marcadoresClientes: any[] = [];
  marcadorRepartidor: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rutaService: RutaService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    // 1. Obtener ID de la URL (ej: /supervisor/rutas/5)
    this.rutaId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.rutaId) {
      this.cargarDatosRuta();
    }
  }

  async cargarDatosRuta() {
    this.cargando = true;
    
    this.rutaService.obtenerRutaPorId(this.rutaId!).subscribe({
      next: (res) => {
        this.rutaData = res;
        this.procesarClientesYMapa();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  procesarClientesYMapa() {
    // Aplanar la estructura para la lista y el mapa
    // Tu backend devuelve: diasRuta -> clientesRuta -> cliente
    
    const clientesTemp: any[] = [];
    const markersTemp: any[] = [];

    // Recorremos los días y sus clientes
    this.rutaData.diasRuta?.forEach((dia: any) => {
      dia.clientesRuta?.forEach((cr: any) => {
        const c = cr.cliente;
        // Agregamos a la lista visual
        clientesTemp.push({
          ...c,
          diaVisita: dia.diaSemana, // Ej: "Lunes"
          precio: cr.precio // Precio específico de esa ruta
        });

        // Si tiene coordenadas, creamos marcador
        if (c.latitud && c.longitud) {
          markersTemp.push({
            position: { lat: Number(c.latitud), lng: Number(c.longitud) },
            title: c.nombre,
            // Icono de casita azul
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' 
          });
        }
      });
    });

    this.clientesLista = clientesTemp;
    this.marcadoresClientes = markersTemp;

    // Centrar mapa en el primer cliente (si hay)
    if (markersTemp.length > 0) {
      this.center = markersTemp[0].position;
    }

    // SIMULACIÓN DE REPARTIDOR (En el futuro esto vendrá del GPS en tiempo real)
    // Lo ponemos cerca del centro para que se vea
    this.marcadorRepartidor = {
      position: { lat: this.center.lat + 0.002, lng: this.center.lng + 0.002 },
      title: 'Repartidor',
      icon: 'http://maps.google.com/mapfiles/ms/icons/truck.png' // Icono de camión o diferente
    };
  }

  regresar() {
    this.router.navigate(['/supervisor/home']); // O la ruta de la lista
  }
}