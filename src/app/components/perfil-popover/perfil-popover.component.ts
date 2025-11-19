import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from 'src/app/service/auth';
import { addIcons } from 'ionicons';
import { personCircleOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-perfil-popover',
  template: `
    <ion-list lines="none">
      <ion-item button (click)="verPerfil()">
        <ion-icon slot="start" name="person-circle-outline" color="primary"></ion-icon>
        <ion-label>Mi Perfil</ion-label>
      </ion-item>
      <ion-item button (click)="logout()" lines="none">
        <ion-icon slot="start" name="log-out-outline" color="danger"></ion-icon>
        <ion-label color="danger">Cerrar Sesión</ion-label>
      </ion-item>
    </ion-list>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PerfilPopoverComponent {
  constructor(
    private popoverController: PopoverController,
    private authService: Auth,
    private router: Router
  ) {
    addIcons({ personCircleOutline, logOutOutline });
  }

  verPerfil() {
    console.log('Ir a perfil...');
    this.popoverController.dismiss();
    // Aquí navegarías a tu página de perfil si la tuvieras
  }

  logout() {
    this.authService.logout();
    this.popoverController.dismiss();
    this.router.navigate(['/auth/login']);
  }
}