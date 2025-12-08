import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from 'src/app/service/auth';
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { MonitoreoRutaPage } from 'src/app/modal/monitoreo-ruta/monitoreo-ruta.page';
import { addIcons } from 'ionicons';
import {
  mapOutline, checkmarkDoneCircleOutline, alertCircleOutline,
  bicycleOutline, personCircleOutline, arrowForward, leafOutline
} from 'ionicons/icons';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [ CommonModule, SupervisorNavbarComponent, ...IonicSharedComponents],
  providers:[...IonicControllers]
})
export class HomeComponent implements OnInit {

  userName: string = '';
  fechaHoy: string = '';
  diaSeleccionado: string = '';
  rutasAsignadasCount: number = 0;
  rutasCompletadasCount: number = 0;
  incidenciasCount: number = 0;
  repartidoresCount: number = 0;

  segmentoActual: string = 'activas';
  todasLasRutas: any[] = [];
  rutasFiltradas: any[] = [];

  constructor(
    private router: Router,
    private authService: Auth,
    private modalCtrl: ModalController
  ) {
    addIcons({
      mapOutline, checkmarkDoneCircleOutline, alertCircleOutline,
      bicycleOutline, personCircleOutline, arrowForward, leafOutline
    });
  }

  ngOnInit() {
    this.cargarInformacionUsuario();
    this.generarFechaActual();
    this.cargarDatosEnTiempoReal();
  }


  cargarInformacionUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      this.userName = user.name || 'Supervisor';
    }
  }

  generarFechaActual() {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    };
    this.fechaHoy = fecha.toLocaleDateString('es-ES', opciones);
    this.fechaHoy = this.fechaHoy.charAt(0).toUpperCase() + this.fechaHoy.slice(1);
  }

  cargarDatosEnTiempoReal() {
    this.authService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.repartidoresCount = usuarios.filter(u => u.role === 'repartidor').length;
      }
    });

    this.authService.obtenerRutas().subscribe({
      next: (rutas: any[]) => {
        this.todasLasRutas = rutas;
        this.calcularIndicadores();
        this.filtrarRutas();
      },
      error: (err) => console.error('Error cargando rutas', err)
    });
  }

  getEstadoDiaActual(ruta: any): string {
    if (!ruta.diasRuta || ruta.diasRuta.length === 0) return 'pendiente';

    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDiaHoy = diasSemana[new Date().getDay()];

    const diaDeHoy = ruta.diasRuta.find((d: any) => d.diaSemana.includes(nombreDiaHoy));

    if (diaDeHoy) {
      return diaDeHoy.estado;
    }

    return 'pendiente';
  }

  calcularIndicadores() {
    this.rutasAsignadasCount = this.todasLasRutas.length;
    this.rutasCompletadasCount = this.todasLasRutas.filter(r => this.getEstadoDiaActual(r) === 'completada').length;
    this.incidenciasCount = 0;
  }

  cambiarSegmento(event: any) {
    this.segmentoActual = event.detail.value;
    this.filtrarRutas();
  }

  filtrarRutas() {
    this.rutasFiltradas = this.todasLasRutas.filter(ruta => {
      const estado = this.getEstadoDiaActual(ruta);

      if (this.segmentoActual === 'activas') {
        return estado === 'en_curso' || estado === 'activa' || estado === 'asignada';
      }
      else if (this.segmentoActual === 'pendientes') {
        return estado === 'pendiente' || estado === 'importada';
      }
      else if (this.segmentoActual === 'completadas') {
        return estado === 'completada' || estado === 'finalizada';
      }
      return true;
    });
  }

  getColorEstado(estado: string) {
    switch (estado) {
      case 'en_curso': return 'success';
      case 'activa': return 'success';
      case 'asignada': return 'primary';
      case 'pendiente': return 'warning';
      case 'completada': return 'medium';
      default: return 'medium';
    }
  }


  goToRepartidores() {
    this.router.navigate(['/supervisor/conductores']);
  }

  async verDetalleRuta(ruta: any) {
    const modal = await this.modalCtrl.create({
      component: MonitoreoRutaPage,
      componentProps: { rutaId: ruta.id }
    });
    await modal.present();
  }
}