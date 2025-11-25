import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // Importante para *ngFor
import { Auth } from 'src/app/service/auth'; // Tu servicio
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
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent], // Asegúrate de importar AdminNavbar o el que uses
})
export class HomeComponent {
 userName: string = '';
  fechaHoy: string = '';
  
  // KPIs (Indicadores)
  rutasAsignadasCount: number = 0;
  rutasCompletadasCount: number = 0;
  incidenciasCount: number = 0;
  repartidoresCount: number = 0;

  // Control de Pestañas y Listas
  segmentoActual: string = 'activas'; // 'activas', 'pendientes', 'completadas'
  todasLasRutas: any[] = []; // Aquí guardamos todo lo que viene de la API
  rutasFiltradas: any[] = []; // Aquí guardamos lo que se ve en pantalla

  constructor(
    private router: Router,
    private authService: Auth,
    private modalCtrl: ModalController
  ) { 
    // Registramos iconos específicos para esta vista
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

  // 1. Cargar Nombre del Usuario
  cargarInformacionUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      this.userName = user.name || 'Supervisor';
    } else {
      this.userName = 'Supervisor';
    }
  }

  // 2. Generar Fecha Bonita
  generarFechaActual() {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    };
    let fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
    this.fechaHoy = fechaTexto.replace(/^\w/, (c) => c.toUpperCase());
  }

  // 3. Cargar Datos Reales desde tu Auth Service
  cargarDatosEnTiempoReal() {
    // A) Cargar Usuarios para contar Repartidores
    this.authService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.repartidoresCount = usuarios.filter(u => u.role === 'conductor' || u.role === 'repartidor').length;
      },
      error: (err) => console.error('Error cargando repartidores', err)
    });

    // B) Cargar Rutas para KPIs y Lista
    this.authService.obtenerRutas().subscribe({
      next: (rutas: any[]) => {
        this.todasLasRutas = rutas;

        // Calcular KPIs (Ejemplo de lógica)
        // Asignadas: Tienen chofer pero no han terminado
        this.rutasAsignadasCount = rutas.filter(r => r.driver_id && r.status !== 'completada').length;
        
        // Completadas: Status es completada
        this.rutasCompletadasCount = rutas.filter(r => r.status === 'completada').length;
        
        // Incidencias: (Si tienes un campo 'incidencias', úsalo aquí. Por ahora hardcodeo 0 o busco status 'problema')
        this.incidenciasCount = rutas.filter(r => r.status === 'incidencia').length;

        // Inicializar la lista visual
        this.filtrarRutas();
      },
      error: (err) => console.error('Error cargando rutas', err)
    });
  }

  // 4. Lógica de Pestañas (Tabs)
  cambiarSegmento(event: any) {
    this.segmentoActual = event.detail.value;
    this.filtrarRutas();
  }

  filtrarRutas() {
    // Filtramos el array 'todasLasRutas' según el segmento elegido
    if (this.segmentoActual === 'activas') {
      // Ejemplo: Rutas en progreso
      this.rutasFiltradas = this.todasLasRutas.filter(r => r.status === 'en_curso' || r.status === 'asignada');
    } else if (this.segmentoActual === 'pendientes') {
      // Ejemplo: Rutas sin chofer o sin iniciar
      this.rutasFiltradas = this.todasLasRutas.filter(r => r.status === 'pendiente');
    } else if (this.segmentoActual === 'completadas') {
      this.rutasFiltradas = this.todasLasRutas.filter(r => r.status === 'completada');
    } else {
      this.rutasFiltradas = this.todasLasRutas;
    }
  }

  // 5. Helpers Visuales
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

  // 6. Navegación
  goToRepartidores() {
    // Asegúrate de que esta ruta exista en tu app-routing.module
    this.router.navigate(['/conductores']); 
  }

  verDetalleRuta(ruta: any) {
    console.log('Ver detalle de:', ruta);
    // Aquí puedes abrir un modal o navegar
  }
}