import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';
import { ClienteService } from 'src/app/service/cliente.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  standalone: true,
  imports: [ CommonModule, SupervisorNavbarComponent,...IonicSharedComponents],
  providers: [...IonicControllers]
})
export class RutasComponent implements OnInit {

  rutas: any[] = [];
  cargando: boolean = true;
    supervisorId: number = 0; 


  constructor(
    private rutaService: RutaService,
    private router: Router,
    private modalCtrl: ModalController,
    private clienteService: ClienteService,
  ) {
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
    this.cargarDatosSupervisor();
    this.cargarRutas();
  }


    cargarDatosSupervisor() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const usuario = JSON.parse(usuarioStr);
      this.supervisorId = usuario.id;
      console.log('✅ Supervisor ID:', this.supervisorId);
    }
  }

  cargarRutas() {
    this.cargando = true;
 this.clienteService.obtenerRutasDeSupervisor(this.supervisorId).subscribe({
      next: (datos) => {
        this.rutas = datos.asignados || [];
        this.cargando = false;
        console.log('✅ Rutas del supervisor:', this.rutas);
      },
      error: (err) => {
        console.error('Error al cargar rutas:', err);
        this.cargando = false;
      }
    });
  }

  async verDetalleRuta(ruta: any) {
    const modal = await this.modalCtrl.create({
      component: MonitoreoRutaPage,
      componentProps: { rutaId: ruta.id }
    });
    await modal.present();
  }

  // --- HELPERS VISUALES ---

  obtenerDiasTexto(ruta: any): string {
    if (!ruta.diasRuta || ruta.diasRuta.length === 0) return 'Sin días asignados';

    const dias = ruta.diasRuta.map((d: any) => d.diaSemana);
    return [...new Set(dias)].join(', ');
  }

  contarClientes(ruta: any): number {
    return ruta.totalClientes || 0;

  }
  
}