import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { home, compass, people, settings } from 'ionicons/icons';
import { PerfilPopoverSupervisorComponent } from '../perfil-popover-supervisor/perfil-popover-supervisor.component';
@Component({
  selector: 'app-supervisor-navbar',
  templateUrl: './supervisor-navbar.component.html',
  styleUrls: ['./supervisor-navbar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ]
})
export class SupervisorNavbarComponent {
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
        this.router.navigate(['/supervisores/home']); 
        break;
      case 'clientes':
        this.router.navigate(['/supervisores/clientes']); 
        break;
      case 'rutas':
        this.router.navigate(['/supervisores/rutas']); 
        break;
    }
  }

  async abrirMenu(ev: any) {
    const popover = await this.popoverController.create({
      component: PerfilPopoverSupervisorComponent,
      event: ev,
      translucent: true,
      alignment: 'end',
      showBackdrop: false
    });
    await popover.present();
  }
}