import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Auth } from 'src/app/service/auth';
import { AdminNavbarComponent } from 'src/app/components/admin-navbar/admin-navbar.component';
import { addIcons } from 'ionicons';
import { 
  menu, logOutOutline, carSportOutline, timeOutline, 
  checkmarkCircleOutline, alertCircleOutline, close, 
  addCircleOutline, gitBranchOutline, personOutline,
  home, map, people, settings, compass, barChart, chevronForwardOutline
} from 'ionicons/icons';
import { MenuController } from '@ionic/angular';

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
  
  constructor(
    private router: Router,
    private authService: Auth,
    private menuC: MenuController
  ) {
    addIcons({ 
      menu, logOutOutline, carSportOutline, timeOutline, 
      checkmarkCircleOutline, alertCircleOutline, close,
      addCircleOutline, gitBranchOutline, personOutline,
      home, map, people, settings, compass, barChart, chevronForwardOutline
    });
    this.cargarInformacionUsuario();
    this.generarFechaActual();
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
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
        let fechaTexto = fecha.toLocaleDateString('es-ES', opciones);
    fechaTexto = fechaTexto.replace(/^\w/, (c) => c.toUpperCase());
    
    this.fechaHoy = fechaTexto;
  }

  toggleMenu() { 
    this.menuC.toggle('admin-menu'); 
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  irARutas() { this.router.navigate(['/gestion-rutas']); }
  irARepartidores() { this.router.navigate(['/conductores']); }
  irASupervisores() { this.router.navigate(['/admin/supervisores']); }
  irAReportes() { this.router.navigate(['/admin/reportes']); }
  
  crearNuevaRuta() { this.irARutas(); } 
  dividirRuta() { console.log('Dividir ruta'); }
  reasignarChofer() { console.log('Reasignar'); }
  
}