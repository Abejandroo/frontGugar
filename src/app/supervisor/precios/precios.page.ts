import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular'; // Quitamos Alert y ActionSheet
import { SupervisorNavbarComponent } from "src/app/components/supervisor-navbar/supervisor-navbar.component";
import { addIcons } from 'ionicons';
import { add, pricetag, createOutline, trashOutline, walletOutline, close } from 'ionicons/icons';
import { AgregarprecioPage } from 'src/app/modal/agregarprecio/agregarprecio.page';
import { EditarprecioPage } from 'src/app/modal/editarprecio/editarprecio.page';
import { PrecioService } from 'src/app/service/precio';

@Component({
  selector: 'app-precios',
  templateUrl: './precios.page.html',
  styleUrls: ['./precios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, SupervisorNavbarComponent]
})
export class PreciosPage implements OnInit {

  precios: any[] = [];
  cargando: boolean = true;

  constructor(
    private precioService: PrecioService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    addIcons({ add, pricetag, createOutline, trashOutline, walletOutline, close });
  }

  ngOnInit() {
    this.cargarPrecios();
  }

  cargarPrecios() {
    this.cargando = true;
    this.precioService.obtenerPrecios().subscribe({
      next: (res) => {
        this.precios = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }
// Función para CREAR
  async abrirModalCrear() {
    const modal = await this.modalCtrl.create({
      component: AgregarprecioPage
    });
    await modal.present();
    
    const { data } = await modal.onDidDismiss();

    // --- CORRECCIÓN AQUÍ ---
    // Verificamos si existe 'data' y si tiene ALGUNA señal de éxito
    if (data && (data.registrado || data.actualizado)) {
      this.cargarPrecios(); // <--- ¡Recargamos la lista!
    }
  }

  // Función para EDITAR
  async abrirModalEditar(precioSeleccionado: any) {
    const modal = await this.modalCtrl.create({
      component: EditarprecioPage,
      componentProps: { precio: precioSeleccionado }
    });
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
    
    // --- CORRECCIÓN AQUÍ ---
    if (data && (data.registrado || data.actualizado)) {
      this.cargarPrecios(); // <--- ¡Recargamos la lista!
    }
  }
  // --- SOLUCIÓN: CONFIRMACIÓN NATIVA ---
  confirmarEliminar(precio: any) {
    // window.confirm es del navegador, no depende de Ionic. ¡Siempre sale!
    if (window.confirm(`¿Estás seguro de eliminar "${precio.tipoCompra}"?`)) {
      this.eliminar(precio.id);
    }
  }

  eliminar(id: number) {
    // Ponemos cargando para que se note que algo pasa
    this.cargando = true; 
    
    this.precioService.eliminarPrecio(id).subscribe({
      next: () => {
        this.cargando = false;
        this.mostrarToast('Precio eliminado correctamente', 'success');
        this.cargarPrecios();
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.mostrarToast('No se pudo eliminar. Verifique que no tenga clientes asignados.', 'danger');
      }
    });
  }

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'bottom' });
    toast.present();
  }
}