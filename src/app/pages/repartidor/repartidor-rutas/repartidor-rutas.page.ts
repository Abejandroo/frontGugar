import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { RutaService } from 'src/app/service/ruta.service';

@Component({
  selector: 'app-repartidor-rutas',
  templateUrl: './repartidor-rutas.page.html',
  styleUrls: ['./repartidor-rutas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RepartidorRutasPage implements OnInit {
  
  rutasAsignadas: any[] = [];
  usuarioActual: any = null;
  cargando: boolean = false;

  constructor(
    private router: Router,
    private rutasService: RutaService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

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
      this.cargarRutasAsignadas();
    } else {
      console.error('No hay usuario en sesión');
      this.router.navigate(['/auth/login']);
      this.cargando = false;
    }
  }

  cargarRutasAsignadas() {
    if (!this.usuarioActual) {
      console.error('No hay usuarioActual');
      return;
    }

    this.rutasService.obtenerRutasRepartidor(this.usuarioActual.id).subscribe({
      next: (rutas) => {
        this.rutasAsignadas = rutas;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar rutas:', err);
        this.mostrarToast('Error al cargar rutas asignadas', 'danger');
        this.cargando = false;
      }
    });
  }

  // ⭐ MÉTODOS QUE FALTABAN
  
  getDiaActual(): string {
    const hoy = new Date().getDay();
    if (hoy === 1 || hoy === 4) return 'Lunes - Jueves';
    if (hoy === 2 || hoy === 5) return 'Martes - Viernes';
    if (hoy === 3 || hoy === 6) return 'Miércoles - Sábado';
    return 'Domingo';
  }

  abrirRuta(ruta: any) {
    this.router.navigate([`/repartidor/ruta/${ruta.id}`]);
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

  getClientesTotales(diasRuta: any[]): number {
    if (!diasRuta || diasRuta.length === 0) return 0;
    const diaActual = diasRuta.find(dr => dr.diaSemana === this.getDiaActual());
    return diaActual?.clientesRuta?.length || 0;
  }

  getClientesCompletados(diasRuta: any[]): number {
    // Este método requeriría cargar las ventas, pero para la lista solo mostramos info básica
    // Si quieres mostrar ventas aquí, deberías cargarlas antes
    return 0;
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

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}