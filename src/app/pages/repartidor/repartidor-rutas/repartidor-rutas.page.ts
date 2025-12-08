import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RutaService } from 'src/app/service/ruta.service';
import { Auth } from 'src/app/service/auth';
import { addIcons } from 'ionicons';
import { circle } from 'leaflet';
import { logOutOutline, person, personCircle } from 'ionicons/icons';

interface DiaRuta {
  id: number;
  diaSemana: string;
  estado: string;
  dividida: boolean;
  idRepartidor?: number | null;
  clientesRuta: any[];
  ruta: {
    id: number;
    nombre: string;
    idRepartidor?: number | null;
    supervisor: { name: string }
  }
}


@Component({
  selector: 'app-repartidor-rutas',
  templateUrl: './repartidor-rutas.page.html',
  styleUrls: ['./repartidor-rutas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RepartidorRutasPage implements OnInit {

  rutasAsignadas: any[] = [];
  rutasDelDia: DiaRuta[] = [];
  diasRutaAsignados: DiaRuta[] = [];
  usuarioActual: any = null;
  cargando: boolean = false;
  fechaHoy: string = '';


  constructor(
    private router: Router,
    private rutasService: RutaService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: Auth,
  ) {
    addIcons({ personCircle, logOutOutline, person });
    this.generarFechaActual();
  }

  ngOnInit() {
    this.cargarUsuarioYRutas();
  }

  ionViewWillEnter() {
    this.cargarUsuarioYRutas();
  }

  async cargarUsuarioYRutas() {
    this.cargando = true;
    const userData = localStorage.getItem('usuario');
    if (userData) {
      this.usuarioActual = JSON.parse(userData);
      this.cargarDiasRutaAsignados();
    } else {
      console.error('No hay usuario en sesión');
      this.router.navigate(['/auth/login']);
      this.cargando = false;
    }
  }

  cargarDiasRutaAsignados() {
    if (!this.usuarioActual) {
      console.error('No hay usuarioActual');
      return;
    }

    this.rutasService.obtenerDiasrutasRepartidor(this.usuarioActual.id).subscribe({
      next: (diasRuta: any[]) => {
        this.diasRutaAsignados = diasRuta;
        this.filtrarRutasPorDia();
        this.cargando = false;
        console.log('diasRuta:', this.diasRutaAsignados, 'id usuario:', this.usuarioActual.id);
      },
      error: (err: any) => {
        console.error('Error al cargar días ruta:', err);
        this.mostrarToast('Error al cargar rutas asignadas', 'danger');
        this.cargando = false;
      }
    });
  }

  cargarRutasAsignadas() {
    if (!this.usuarioActual) {
      console.error('No hay usuarioActual');
      return;
    }

    this.rutasService.obtenerRutasRepartidor(this.usuarioActual.id).subscribe({
      next: (rutas) => {
        this.rutasAsignadas = rutas;
        this.filtrarRutasPorDia();
        this.cargando = false;
        console.log('rutas:', this.rutasAsignadas, 'id usuario:', this.usuarioActual.id);

      },
      error: (err: any) => {
        console.error('Error al cargar rutas:', err);
        this.mostrarToast('Error al cargar rutas asignadas', 'danger');
        this.cargando = false;
      }
    });
  }

  filtrarRutasPorDia() {
    this.rutasDelDia = this.diasRutaAsignados.filter((diaRuta: DiaRuta) => {
      return this.verificarSiEsHoyDiaVisita(diaRuta.diaSemana);
    });

  }

  verificarSiEsHoyDiaVisita(diaSemana: string): boolean {
    const hoy = new Date().getDay();
    const diaLower = diaSemana.toLowerCase();
    const mapaDias: { [key: number]: string[] } = {
      0: ['domingo'],
      1: ['lunes', 'lunes-jueves'],
      2: ['martes', 'martes-viernes'],
      3: ['miércoles', 'miercoles', 'miércoles-sábado', 'miercoles-sabado'],
      4: ['jueves', 'lunes-jueves'],
      5: ['viernes', 'martes-viernes'],
      6: ['sábado', 'sabado', 'miércoles-sábado', 'miercoles-sabado']
    };

    const diasValidos = mapaDias[hoy] || [];
    return diasValidos.some(d => diaLower.includes(d));
  }

  getDiaActual(): string {
    const hoy = new Date().getDay();
    if (hoy === 1) return 'Lunes y Jueves';
    if (hoy === 2) return 'Martes y Viernes';
    if (hoy === 3) return 'Miércoles y Sábado';
    if (hoy === 4) return 'Jueves y Lunes';
    if (hoy === 5) return 'Viernes y Martes';
    if (hoy === 6) return 'Sábado y Miércoles';
    return 'Domingo';
  }

  generarFechaActual() {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    };
    this.fechaHoy = fecha.toLocaleDateString('es-ES', opciones);
    this.fechaHoy = this.fechaHoy.charAt(0).toUpperCase() + this.fechaHoy.slice(1);
  }

  abrirRuta(diaRuta: DiaRuta) {
    this.router.navigate([`/repartidor/ruta/${diaRuta.id}`]);
  }

  getClientesTotales(diaRuta: DiaRuta): number {
    return diaRuta?.clientesRuta?.length || 0;
  }

  getClientesCompletados(diaRuta: DiaRuta): number {
    if (!diaRuta || !diaRuta.clientesRuta) return 0;

    return diaRuta.clientesRuta.filter((clienteRuta: any) => clienteRuta.visitado).length;
  }


  getColorEstado(estado: string): string {
    if (!estado) return 'medium';
    if (estado === 'en_curso') return 'warning';
    if (estado === 'completada') return 'success';
    if (estado === 'pausada') return 'tertiary';
    return 'medium';
  }

  getIconoEstado(estado: string): string {
    if (!estado) return 'ellipse-outline';
    if (estado === 'en_curso') return 'play-circle';
    if (estado === 'completada') return 'checkmark-circle';
    if (estado === 'pausada') return 'pause-circle';
    return 'ellipse-outline';
  }


  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}