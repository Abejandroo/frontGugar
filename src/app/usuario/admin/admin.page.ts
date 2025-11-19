import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Auth } from 'src/app/service/auth';
import { AdminNavbarComponent } from 'src/app/components/admin-navbar/admin-navbar.component';
import { addIcons } from 'ionicons';
import { ModalController } from '@ionic/angular';
import { 
  menu, logOutOutline, carSportOutline, timeOutline, 
  checkmarkCircleOutline, alertCircleOutline, close, 
  addCircleOutline, gitBranchOutline, personOutline,
  home, map, people, settings, compass, barChart, chevronForwardOutline,
  personAddOutline
} from 'ionicons/icons';
import { AgregarrutaPage } from 'src/app/modal/agregarruta/agregarruta.page';
import { AgregarconductorPage } from 'src/app/modal/agregarconductor/agregarconductor.page';
import { ModificarrutaPage } from 'src/app/modal/modificarruta/modificarruta.page';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, AdminNavbarComponent],
})
export class AdminPage  { 

  userName: string = '';
  fechaHoy: string = '';

  rutasTotales: number = 0;
  repartidoresTotales: number = 0;
  supervisoresTotales: number = 0;
  rutasAsignadas: number = 0;
  
  constructor(
    private router: Router,
    private authService: Auth, 
    private menuC: MenuController,
    private modalCtrl: ModalController
  ) {
    addIcons({ 
      menu, logOutOutline, carSportOutline, timeOutline, 
      checkmarkCircleOutline, alertCircleOutline, close,
      addCircleOutline, gitBranchOutline, personAddOutline,
      home, map, people, settings, compass, barChart, chevronForwardOutline,
    });
      this.cargarInformacionUsuario();
    this.generarFechaActual();
    this.cargarEstadisticasReales(); 
  }

  cargarEstadisticasReales() {
    
    this.authService.getUsuarios().subscribe({
      next: (usuarios: any[]) => {

        this.repartidoresTotales = usuarios.filter(u => u.role === 'conductor' || u.role === 'repartidor').length;
        
        this.supervisoresTotales = usuarios.filter(u => u.role === 'supervisor').length;
        
        console.log('Usuarios cargados:', usuarios.length);
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
      }
    });

    this.authService.obtenerRutas().subscribe({
      next: (rutas: any[]) => {
        this.rutasTotales = rutas.length;
        this.rutasAsignadas = rutas.filter(r => r.driver_id !== null && r.driver_id !== 0 && r.status !== 'pendiente').length;
        
        console.log('Rutas cargadas:', rutas.length);
      },
      error: (err) => {
        console.error('Error al cargar rutas', err);
      }
    });
  }

  cargarInformacionUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const user = JSON.parse(usuarioGuardado);
      this.userName = user.name || 'Administrador';
    } else {
      this.userName = 'Administrador';
    }
  }

  generarFechaActual() {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    };
    let fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
    fechaTexto = fechaTexto.replace(/^\w/, (c) => c.toUpperCase());
    this.fechaHoy = fechaTexto;
  }

  toggleMenu() { this.menuC.toggle('admin-menu'); }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  irARutas() { this.router.navigate(['/gestion-rutas']); }
  irARepartidores() { this.router.navigate(['/conductores']); }
  async abrirModalCrearRuta() {
     const modal = await this.modalCtrl.create({
      component: AgregarrutaPage,
    });
    await modal.present();
    
  }
  async abrirModalAgregarUsuario() {
    const modal = await this.modalCtrl.create({
      component: AgregarconductorPage, 
    });
    
    modal.onDidDismiss().then((data) => {
      if (data.role === 'creado') { 
        this.cargarEstadisticasReales(); 
      }
    });

    await modal.present();
    
  }
  
  
}