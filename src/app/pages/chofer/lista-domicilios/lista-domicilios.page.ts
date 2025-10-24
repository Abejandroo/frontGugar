import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DomicilioService } from '../../../services/domicilio.service';
import { Domicilio } from '../../../models/domicilio.models';

@Component({
  selector: 'app-lista-domicilios',
  templateUrl: './lista-domicilios.page.html',
  styleUrls: ['./lista-domicilios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ListaDomiciliosPage implements OnInit {
  domicilios: Domicilio[] = [];
  domicilioActualId: number | null = null;
  loading: boolean = true;

  constructor(
    private domicilioService: DomicilioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarDomicilios();
  }

  cargarDomicilios() {
    this.loading = true;
    this.domicilioService.getDomicilios().subscribe(domicilios => {
      this.domicilios = domicilios;
      const actual = domicilios.find(d => d.estado === 'actual');
      this.domicilioActualId = actual ? actual.id : null;
      this.loading = false;
    });
  }

  volverAtras() {
    this.router.navigate(['/detalle-domicilio']);
  }

  getIconoEstado(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'time';
      case 'realizado':
        return 'checkmark-circle';
      case 'saltado':
        return 'close-circle';
      case 'actual':
        return 'time';
      default:
        return 'time';
    }
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'realizado':
        return 'success';
      case 'saltado':
        return 'danger';
      case 'actual':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getTextoBadge(domicilio: Domicilio): string {
    switch (domicilio.estado) {
      case 'pendiente':
        return 'PENDIENTE';
      case 'realizado':
        return 'EDITAR';
      case 'saltado':
        return 'SALTADO';
      case 'actual':
        return 'ACTUAL';
      default:
        return '';
    }
  }

  getColorBadge(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'realizado':
        return 'success';
      case 'saltado':
        return 'danger';
      case 'actual':
        return 'warning';
      default:
        return 'medium';
    }
  }

  seleccionarDomicilio(domicilio: Domicilio) {
    if (domicilio.estado === 'actual') {
      this.router.navigate(['/detalle-domicilio']);
    } else {
      console.log('Domicilio seleccionado:', domicilio);
    }
  }

  abrirMenu() {
    console.log('Abrir menú');
  }
}