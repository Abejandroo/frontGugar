import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [ IonApp, IonRouterOutlet, IonMenu, ],
  
})
export class AppComponent {
 constructor(private readonly menu: MenuController, private readonly router: Router) {}
  isAdmin() {
   return this.router.url.startsWith('/usuario/admin');
  }

  isInstructor() {
    return this.router.url.startsWith('/dashboard') || this.router.url.startsWith('/docente');
  }
  isPadre() {
    return this.router.url.startsWith('/padres-home') || this.router.url.startsWith('/padre');
  }

  isAlumno() {
    return this.router.url.startsWith('/home');
  }
  toggleMenu() {
    this.menu.toggle();
  }

}
