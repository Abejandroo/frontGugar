import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonMenu, } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  homeOutline,
  settingsOutline,
  logOutOutline,
  menuOutline,
  closeOutline,
  addOutline,
  trashOutline,
  createOutline,
  searchOutline,
  chevronForwardOutline,
  chevronBackOutline,
  locationOutline,
  callOutline,
  mailOutline,
  peopleOutline,
  checkmarkDoneOutline,
  calendarOutline,
  ellipseOutline,
  arrowBack,
  playCircle,
  navigate,
  navigateCircle,
  time,
  storefrontOutline,
  cashOutline,
  checkmarkCircle,
  playSkipForward,
  chevronForward,
  close,
  saveOutline,
  add,
  remove,
  car,
  star,
  eyeOutline,
  warningOutline,
  waterOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [ IonApp, IonRouterOutlet, IonMenu, ],
  
})
export class AppComponent {
 constructor(private readonly menu: MenuController, private readonly router: Router) {
  addIcons({
  'person-circle-outline': personCircleOutline,
  'home-outline': homeOutline,
  'settings-outline': settingsOutline,
  'log-out-outline': logOutOutline,
  'menu-outline': menuOutline,
  'close-outline': closeOutline,
  'add-outline': addOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'search-outline': searchOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'chevron-back-outline': chevronBackOutline,
  'location-outline': locationOutline,
  'call-outline': callOutline,
  'mail-outline': mailOutline,
  'people-outline': peopleOutline,
  'checkmark-done-outline': checkmarkDoneOutline,
  'calendar-outline': calendarOutline,
  'ellipse-outline': ellipseOutline,
  'arrow-back':arrowBack,
  'play-circle':playCircle,
  'navigate':navigate,
  'navigate-circle':navigateCircle,
  'time':time,
  'storefront-outline':storefrontOutline,
  'cash-outline':cashOutline,
  'checkmark-circle': checkmarkCircle,
  'play-skip-forward': playSkipForward,
  'chevron-forward':chevronForward,
  'close':close,
  'save-outline':saveOutline,
  'add':add,
  'remove':remove,
  'car':car,
  'eye-outline': eyeOutline,
  'warning-outline': warningOutline,
  'water-outline': waterOutline,
  
});
 }
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
