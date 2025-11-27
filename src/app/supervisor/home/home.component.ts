import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Auth } from 'src/app/service/auth';
import { AdminNavbarComponent } from 'src/app/components/admin-navbar/admin-navbar.component'; // O SupervisorNavbar si creas uno
import { addIcons } from 'ionicons';
import { 
  mapOutline, checkmarkDoneCircleOutline, alertCircleOutline, 
  bicycleOutline, personCircleOutline, arrowForward, leafOutline 
} from 'ionicons/icons';
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent], 
})
export class HomeComponent {
 userName: string = '';
  fechaHoy: string = '';
  
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
    this.cargarInformacionUsuario();
    this.generarFechaActual();
    this.cargarDatosEnTiempoReal();
  }

  cargarInformacionUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      this.userName = user.name || 'Supervisor';
    } else {
      this.userName = 'Supervisor';
    }
  }

  generarFechaActual() {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    };
    let fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
    this.fechaHoy = fechaTexto.replace(/^\w/, (c) => c.toUpperCase());
  }

  cargarDatosEnTiempoReal() {
    this.authService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.repartidoresCount = usuarios.filter(u => u.role === 'conductor' || u.role === 'repartidor').length;
      },
      error: (err) => console.error('Error cargando repartidores', err)
    });

    this.authService.obtenerRutas().subscribe({
      next: (rutas: any[]) => {
        this.todasLasRutas = rutas;

        this.rutasAsignadasCount = rutas.filter(r => r.driver_id && r.status !== 'completada').length;
        
        this.rutasCompletadasCount = rutas.filter(r => r.status === 'completada').length;
        
        this.incidenciasCount = rutas.filter(r => r.status === 'incidencia').length;

        this.filtrarRutas();
      },
      error: (err) => console.error('Error cargando rutas', err)
    });
  }

  cambiarSegmento(event: any) {
    this.segmentoActual = event.detail.value;
    this.filtrarRutas();
  }

  filtrarRutas() {
    if (this.segmentoActual === 'activas') {
      this.rutasFiltradas = this.todasLasRutas.filter(r => r.status === 'en_curso' || r.status === 'asignada');
    } else if (this.segmentoActual === 'pendientes') {
      this.rutasFiltradas = this.todasLasRutas.filter(r => r.status === 'pendiente');
    } else if (this.segmentoActual === 'completadas') {
      this.rutasFiltradas = this.todasLasRutas.filter(r => r.status === 'completada');
    } else {
      this.rutasFiltradas = this.todasLasRutas;
    }
  }

  getColorEstado(estado: string) {
    switch (estado) {
      case 'en_curso': return 'success';
      case 'asignada': return 'primary';
      case 'pendiente': return 'warning';
      case 'completada': return 'medium';
      case 'incidencia': return 'danger';
      default: return 'medium';
    }
  }

  goToRepartidores() {
    this.router.navigate(['/conductores']); 
  }

  verDetalleRuta(ruta: any) {
    console.log('Ver detalle de:', ruta);
  }
}