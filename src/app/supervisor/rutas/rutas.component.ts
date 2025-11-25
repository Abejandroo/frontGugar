import { Component, OnInit } from '@angular/core';
import { IonFooter } from "@ionic/angular/standalone";
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  imports: [IonFooter, SupervisorNavbarComponent],
  styleUrls: ['./rutas.component.scss'],
})
export class RutasComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
