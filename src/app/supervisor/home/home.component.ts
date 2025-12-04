import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
// Servicios
import { Auth } from 'src/app/service/auth'; 
// Componentes y Modales
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { MonitoreoRutaPage } from 'src/app/modal/monitoreo-ruta/monitoreo-ruta.page'; // <--- IMPORTANTE
// Iconos
import { addIcons } from 'ionicons';
import { 
  mapOutline, checkmarkDoneCircleOutline, alertCircleOutline, 
  bicycleOutline, personCircleOutline, arrowForward, leafOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent], 
})
export class HomeComponent implements OnInit {

  userName: string = '';
  fechaHoy: string = '';
   diaSeleccionado: string = '';
  // Contadores
  rutasAsignadasCount: number = 0;
  rutasCompletadasCount: number = 0;
  incidenciasCount: number = 0;
  repartidoresCount: number = 0;

  // Filtros
  segmentoActual: string = 'activas'; // 'activas', 'pendientes', 'completadas'
  todasLasRutas: any[] = []; 
  rutasFiltradas: any[] = []; 

  constructor(
    private router: Router,
    private authService: Auth, // O RutaServiceTs si prefieres usar ese
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
    // 1. Cargar Usuarios (para contar repartidores)
    this.authService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {
        this.repartidoresCount = usuarios.filter(u => u.role === 'repartidor').length;
      }
    });

    // 2. Cargar Rutas y Calcular Estados
    // Nota: Asegúrate de que este servicio traiga las relaciones 'diasRuta'
    this.authService.obtenerRutas().subscribe({
      next: (rutas: any[]) => {
        this.todasLasRutas = rutas;
        this.calcularIndicadores();
        this.filtrarRutas();
      },
      error: (err) => console.error('Error cargando rutas', err)
    });
  }

  // --- LÓGICA INTELIGENTE PARA FILTRAR ---

  // Helper para saber el estado de la ruta HOY
 getEstadoDiaActual(ruta: any): string {
    if (!ruta.diasRuta || ruta.diasRuta.length === 0) return 'pendiente';

    // 1. Obtenemos qué día es hoy (0=Domingo, 1=Lunes...)
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDiaHoy = diasSemana[new Date().getDay()]; // Ej: "Lunes"

    // 2. Buscamos si esta ruta trabaja hoy
    // (Tu BD guarda strings como "Lunes - Jueves", así que buscamos si incluye el nombre de hoy)
    const diaDeHoy = ruta.diasRuta.find((d: any) => d.diaSemana.includes(nombreDiaHoy));

    // 3. Si encontramos el día, devolvemos SU ESTADO REAL de la BD
    if (diaDeHoy) {
      return diaDeHoy.estado; // 'en_curso', 'completada', etc.
    }

    // Si la ruta no trabaja hoy, la mostramos como pendiente o inactiva
    return 'pendiente';
  }

  calcularIndicadores() {
    this.rutasAsignadasCount = this.todasLasRutas.length;
    // Aquí puedes refinar la lógica
    this.rutasCompletadasCount = this.todasLasRutas.filter(r => this.getEstadoDiaActual(r) === 'completada').length;
    this.incidenciasCount = 0; // Implementar cuando tengas incidencias
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
      case 'en_curso': return 'success';  // Verde
      case 'activa': return 'success';
      case 'asignada': return 'primary';  // Azul
      case 'pendiente': return 'warning'; // Amarillo
      case 'completada': return 'medium'; // Gris
      default: return 'medium';
    }
  }

  // --- NAVEGACIÓN ---

  goToRepartidores() {
    this.router.navigate(['/supervisor/conductores']); // Ajusta la ruta si es diferente
  }

  // ABRIR EL MODAL DE MONITOREO (El que acabamos de hacer)
  async verDetalleRuta(ruta: any) {
    const modal = await this.modalCtrl.create({
      component: MonitoreoRutaPage,
      componentProps: { rutaId: ruta.id }
    });
    await modal.present();
  }
}