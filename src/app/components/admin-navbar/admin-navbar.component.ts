import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PerfilPopoverComponent } from '../perfil-popover/perfil-popover.component';
import { addIcons } from 'ionicons';
import { home, compass, people, settings } from 'ionicons/icons';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AdminNavbarComponent {
  
  @Input() paginaActual: string = 'inicio';

  constructor(
    private router: Router,
    private popoverController: PopoverController
  ) {
    addIcons({ home, compass, people, settings });
  }

  navegar(pagina: string) {
    if (pagina === this.paginaActual) return; 

    switch (pagina) {
      case 'inicio':
        // Ruta correcta según tu app.routes.ts
        this.router.navigate(['/usuario/admin']); 
        break;
      case 'rutas':
        // ✨ CORREGIDO: Quitamos '/pages/' ✨
        this.router.navigate(['/gestion-rutas']); 
        break;
      case 'usuarios':
        // ✨ CORREGIDO: Quitamos '/pages/' ✨
        this.router.navigate(['/conductores']); 
        break;
    }
  }

  async abrirMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: PerfilPopoverComponent,
      event: ev,
      translucent: true,
      alignment: 'end',
      showBackdrop: false
    });
    await popover.present();
  }
}