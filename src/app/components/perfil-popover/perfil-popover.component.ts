import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from 'src/app/service/auth';
import { addIcons } from 'ionicons';
import { personCircle, logOutOutline } from 'ionicons/icons';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

@Component({
  selector: 'app-perfil-popover',
  template: `
    <ion-content class="ion-padding-vertical">
      <div class="user-info ion-text-center ion-padding-bottom">
        <ion-avatar style="margin: 0 auto; width: 60px; height: 60px;">
          <div class="avatar-placeholder">
            <ion-icon name="person-circle" style="font-size: 64px; color: var(--ion-color-medium);"></ion-icon>
          </div>
        </ion-avatar>
        
        <h3 style="font-size: 1.1rem; font-weight: bold; margin: 10px 0 5px 0;">
          {{ userName }}
        </h3>
        
        <p style="font-size: 0.9rem; color: var(--ion-color-medium); margin: 0;">
          {{ userRole | titlecase }}
        </p>
      </div>
      <div style="height: 1px; background: var(--ion-color-light); margin: 5px 0;"></div>
      <ion-list lines="none">
        <ion-item button (click)="logout()" detail="false">
          <ion-icon slot="start" name="log-out-outline" color="danger"></ion-icon>
          <ion-label color="danger">Cerrar Sesión</ion-label>
        </ion-item>
      </ion-list>

    </ion-content>
  `,
  styles: [`
    .avatar-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ion-color-light);
      border-radius: 50%;
      width: 100%;
      height: 100%;
    }
  `],
  standalone: true,
  imports: [ CommonModule, ...IonicSharedComponents]
})
export class PerfilPopoverComponent {
  
  userName: string = 'Usuario';
  userRole: string = 'Rol';

  constructor(
    private popoverController: PopoverController,
    private authService: Auth,
    private router: Router
  ) {
    addIcons({ personCircle, logOutOutline });
      const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      const user = JSON.parse(usuarioStr);
      this.userName = user.name || 'Usuario';
      this.userRole = user.role || 'Invitado';
    }
  }

  logout() {
    this.authService.logout();
    this.popoverController.dismiss();
    this.router.navigate(['/home']);
  }
}