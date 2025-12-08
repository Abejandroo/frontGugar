import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { PerfilPopoverComponent } from '../perfil-popover/perfil-popover.component';
import { addIcons } from 'ionicons';
import { home, compass, people, settings, person } from 'ionicons/icons';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
  standalone: true,
  imports: [ CommonModule, ...IonicSharedComponents]
})
export class AdminNavbarComponent {

  @Input() paginaActual: string = 'inicio';

  constructor(
    private router: Router,
    private popoverController: PopoverController
  ) {
    addIcons({ home, compass, people, settings, person });
  }

  navegar(pagina: string) {
    if (pagina === this.paginaActual) return;

    switch (pagina) {
      case 'inicio':
        this.router.navigate(['/usuario/admin']);
        break;
      case 'rutas':
        this.router.navigate(['/gestion-rutas']);
        break;
      case 'usuarios':
        this.router.navigate(['/conductores']);
        break;
      case 'precios':
        this.router.navigate(['/admin/precios']);
        break;
      case 'clientes':
        this.router.navigate(['/admin/clientes']);
        break;
    }
  }

async abrirMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: PerfilPopoverComponent,
      event: ev,
      translucent: true,
      alignment: 'end',
      side: 'top', 
      showBackdrop: true,
      backdropDismiss: true,
      cssClass: 'perfil-popover' 
    });
    await popover.present();
  }
}