import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // Importante para navegar
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { addIcons } from 'ionicons';
import { ModalController } from '@ionic/angular';

import { 
  mapOutline, calendarOutline, personOutline, bicycleOutline, 
  chevronForwardOutline, locationOutline, 
  pricetag
} from 'ionicons/icons';
import { MonitoreoRutaPage } from 'src/app/modal/monitoreo-ruta/monitoreo-ruta.page';
import { RutaService } from 'src/app/service/ruta.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent]
})
export class RutasComponent implements OnInit {

  rutas: any[] = [];
  cargando: boolean = true;

  constructor(
    private rutaService: RutaService,
    private router: Router,
    private modalCtrl: ModalController
  ) { 
    // Registramos los iconos que usamos en el HTML
    addIcons({ 
      mapOutline, 
      calendarOutline, 
      personOutline, 
      bicycleOutline, 
      chevronForwardOutline, 
      locationOutline,
      pricetag
    });
  }

  ngOnInit() {
    this.cargarRutas();
  }

  // 1. CARGAR LA LISTA DE RUTAS
  cargarRutas() {
    this.cargando = true;
    this.rutaService.obtenerTodasLasRutas().subscribe({
      next: (res) => {
        this.rutas = res;
        this.cargando = false;
        console.log('Rutas cargadas:', this.rutas);
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        this.cargando = false;
      }
    });
  }

  // 2. NAVEGAR AL DETALLE (MAPA Y CLIENTES)
  async verDetalleRuta(ruta: any) {
  const modal = await this.modalCtrl.create({
    component: MonitoreoRutaPage,
    componentProps: { rutaId: ruta.id }
  });
  await modal.present();
}

  // --- HELPERS VISUALES ---

  // Muestra los días asignados (ej: "Lunes, Martes")
  obtenerDiasTexto(ruta: any): string {
    if (!ruta.diasRuta || ruta.diasRuta.length === 0) return 'Sin días asignados';
    
    // Extraemos los días y quitamos duplicados
    const dias = ruta.diasRuta.map((d: any) => d.diaSemana);
    return [...new Set(dias)].join(', '); 
  }

  // Cuenta el total de clientes sumando los de cada día
  contarClientes(ruta: any): number {
    let total = 0;
    if (ruta.diasRuta) {
      ruta.diasRuta.forEach((dia: any) => {
        if (dia.clientes) total += dia.clientes.length;
      });
    }
    return total;
  }
}