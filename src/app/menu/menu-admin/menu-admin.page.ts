import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonApp, IonItem, IonList, IonLabel } from '@ionic/angular/standalone';
import { Auth } from 'src/app/service/auth';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu-admin',
  templateUrl: './menu-admin.page.html',
  styleUrls: ['./menu-admin.page.scss'],
  standalone: true,
  imports: [IonLabel, IonList, IonItem, IonApp, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MenuAdminPage  {

  @Input() titulo!: string;
  constructor(
  private readonly authS: Auth,
  private readonly menu: MenuController,
  private readonly router: Router) { }

  toggleMenu() {
    this.menu.toggle();
  }
  navigateToPerfil() {
    this.menu.close().then(() => {
      this.router.navigateByUrl('/perfil-admin');
    });
  }
   logout() {
    this.menu.close().then(() => {
    this.authS.logout();
    });
  }

}
