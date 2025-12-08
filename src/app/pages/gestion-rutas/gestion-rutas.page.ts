import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ModalController, ToastController,  AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RutaService } from 'src/app/service/ruta.service';
import { AgregarrutaPage } from 'src/app/modal/agregarruta/agregarruta.page';
import { ModificarrutaPage } from 'src/app/modal/modificarruta/modificarruta.page';
import { ImportarClientesModalComponent } from '../../modal/importar-clientes-modal/importar-clientes-modal.component';
import { AdminNavbarComponent } from "src/app/components/admin-navbar/admin-navbar.component";
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  searchOutline,
  chevronForwardOutline,
  mapOutline,
  cloudUpload,
  filterOutline
} from 'ionicons/icons';
import { OpcionesRutaModalComponent } from 'src/app/modal/opciones-ruta-modal/opciones-ruta-modal.component';
import { Router } from '@angular/router';
import { ReporteVentasService } from 'src/app/service/reporte-ventas.service';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';
import { IonicControllers } from 'src/app/ionic-controller.providers';

@Component({
  selector: 'app-gestion-rutas',
  templateUrl: './gestion-rutas.page.html',
  styleUrls: ['./gestion-rutas.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, AdminNavbarComponent, ...IonicSharedComponents],
  providers:[...IonicControllers]
})
export class GestionRutasPage implements OnInit {
  rutas: any[] = [];
  rutasFiltradas: any[] = [];

  filtroEstado: string = 'todos';
  textoBusqueda: string = '';
  mostrarFiltros: boolean = false;

  private diasSemanaMap: { [key: string]: string } = {
    'Lunes - Jueves': 'Lun - Jue',
    'Martes - Viernes': 'Mar - Vie',
    'Miércoles - Sábado': 'Mié - Sáb'
  };

  constructor(
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private rutasService: RutaService,
    private router: Router,
    private reporteService: ReporteVentasService
  ) {
    addIcons({
      addCircleOutline,
      searchOutline,
      chevronForwardOutline,
      mapOutline,
      cloudUpload,
      filterOutline
    });
  }

  ngOnInit() {
    this.cargarRutas();
  }

  ionViewWillEnter() {
    this.cargarRutas();
  }

  cargarRutas() {
    this.rutasService.obtenerTodasLasRutas().subscribe({
      next: (data: any[]) => {
        this.rutas = data;
        this.aplicarFiltros();
      },
      error: () => {
        this.mostrarToast('Error al cargar rutas', 'danger');
        this.rutas = [];
      }
    });
  }


  toggleFiltros() {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  aplicarFiltros() {
    let resultado = [...this.rutas];

    if (this.filtroEstado !== 'todos') {
      resultado = resultado.filter(ruta => {
        const diaActual = this.getDiaRutaActual(ruta);
        return diaActual?.estado === this.filtroEstado;
      });
    }

    if (this.textoBusqueda.trim()) {
      const busqueda = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(ruta =>
        ruta.nombre.toLowerCase().includes(busqueda) ||
        ruta.supervisor?.name.toLowerCase().includes(busqueda) ||
        ruta.repartidor?.name.toLowerCase().includes(busqueda)
      );
    }

    this.rutasFiltradas = resultado;
  }

  onBuscar(event: any) {
    this.textoBusqueda = event.target.value || '';
    this.aplicarFiltros();
  }

  private getDiaRutaActual(ruta: any): any {
    if (!ruta.diasRuta || ruta.diasRuta.length === 0) return null;

    const hoy = new Date().getDay();

    let diaRutaBuscado = '';
    if (hoy === 1 || hoy === 4) {
      diaRutaBuscado = 'Lunes - Jueves';
    } else if (hoy === 2 || hoy === 5) {
      diaRutaBuscado = 'Martes - Viernes';
    } else if (hoy === 3 || hoy === 6) {
      diaRutaBuscado = 'Miércoles - Sábado';
    } else {
      return ruta.diasRuta[0];
    }

    return ruta.diasRuta.find((dr: any) => dr.diaSemana === diaRutaBuscado) || ruta.diasRuta[0];
  }

  getDiaVisitaActual(ruta: any): string {
    const diaActual = this.getDiaRutaActual(ruta);
    return this.diasSemanaMap[diaActual?.diaSemana] || 'N/A';
  }

  getEstadoDiaActual(ruta: any): string {
    const diaActual = this.getDiaRutaActual(ruta);
    const estado = diaActual?.estado || 'pendiente';
    return estado.toUpperCase().replace('_', ' ');
  }

  getColorEstadoDiaActual(ruta: any): string {
    const diaActual = this.getDiaRutaActual(ruta);
    const estado = diaActual?.estado || 'pendiente';

    const colores: any = {
      'en_curso': '#ff3b30',
      'pausada': '#ff9500',
      'completada': '#34c759',
      'pendiente': '#8e8e93'
    };

    return colores[estado] || '#8e8e93';
  }


  getClientesTotalesDia(ruta: any): number {
    const diaActual = this.getDiaRutaActual(ruta);
    return diaActual?.clientesRuta?.length || 0;
  }

  getClientesVisitados(ruta: any): number {
    const diaActual = this.getDiaRutaActual(ruta);

    if (!diaActual || !diaActual.clientesRuta) {
      return 0;
    }

    const visitados = diaActual.clientesRuta.filter((clienteRuta: any) => {
      return clienteRuta.venta &&
        (clienteRuta.venta.estado === 'realizado' || clienteRuta.venta.estado === 'saltado');
    }).length;

    return visitados;
  }

  getProgresoRuta(ruta: any): number {
    const total = this.getClientesTotalesDia(ruta);
    const visitados = this.getClientesVisitados(ruta);
    return total > 0 ? visitados / total : 0;
  }

  getColorProgreso(ruta: any): string {
    const progreso = this.getProgresoRuta(ruta);
    if (progreso === 1) return 'success';
    if (progreso > 0.5) return 'warning';
    return 'danger';
  }


  async abrirOpcionesRuta(ruta: any) {
    const modal = await this.modalController.create({
      component: OpcionesRutaModalComponent,
      componentProps: { ruta },
      breakpoints: [0, 0.5, 0.75],
      initialBreakpoint: 0.5
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.accion) {
      switch (data.accion) {
        case 'ver':
          await this.verDetallesRuta(ruta);
          break;
        case 'editar':
          await this.editarRuta(ruta);
          break;
        case 'eliminar':
          await this.eliminarRuta(ruta);
          break;
      }
    }
  }

  verDetallesRuta(ruta: any) {
    this.router.navigate(['/detalle-ruta', ruta.id]);
  }

  async editarRuta(ruta: any) {
    const modal = await this.modalController.create({
      component: ModificarrutaPage,
      componentProps: { grupoSeleccionado: ruta }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.cargarRutas();
    }
  }

  async eliminarRuta(ruta: any) {
    const totalClientes = ruta.diasRuta?.reduce((sum: number, dia: any) =>
      sum + (dia.clientesRuta?.length || 0), 0) || 0;

    const alert = await this.alertController.create({
      header: '⚠️ Eliminar Ruta',
      message: `
        <div style="text-align: left;">
          <p><strong>¿Estás seguro de eliminar "Ruta Centro"?</strong></p>
          <ul>
            <li><strong>45</strong> clientes asignados</li>
            <li><strong>3</strong> días de ruta</li>
          </ul>
        </div>
    `,
      cssClass: 'alert-eliminar-ruta',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          cssClass: 'alert-button-eliminar',
          handler: () => {
            this.confirmarEliminacion(ruta);
          }
        }
      ]
    });

    await alert.present();
  }

  private confirmarEliminacion(ruta: any) {
    this.rutasService.eliminarRuta(ruta.id).subscribe({
      next: () => {
        this.mostrarToast(`Ruta "${ruta.nombre}" eliminada correctamente`, 'success');
        this.cargarRutas();
      },
      error: (err) => {
        console.error('Error eliminando ruta:', err);
        this.mostrarToast('Error al eliminar la ruta', 'danger');
      }
    });
  }


  async abrirImportador() {
    const modal = await this.modalController.create({
      component: ImportarClientesModalComponent,
      cssClass: 'importar-modal'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.cargarRutas();
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  async generarReporteSemanal() {
    this.reporteService.obtenerVentasSemana().subscribe({
      next: async (ventas) => {
        await this.reporteService.generarExcelSemanal(ventas);
        this.mostrarToast('Reporte generado correctamente', 'success');
      },
      error: (err) => {
        console.error('Error generando reporte:', err);
        this.mostrarToast('Error al generar reporte', 'danger');
      }
    });
  }

  async abrirModalAgregarGrupo() {
    const modal = await this.modalController.create({
      component: AgregarrutaPage
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data === true) {
      this.mostrarToast('Ruta guardada exitosamente', 'success');
      this.cargarRutas();
    }
  }
}