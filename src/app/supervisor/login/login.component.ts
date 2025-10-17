import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
   imports: [
    IonContent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    IonicModule
  ]

})
export class LoginComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
