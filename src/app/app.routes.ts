import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Auth } from './service/auth';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // ========================================
  // RUTAS PÚBLICAS (sin autenticación)
  // ========================================
  {
    path: '',
    redirectTo: 'home1',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./supervisor/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage),
    providers: [Auth, provideHttpClient()]
  },
  {
    path: 'home1',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },

  // ========================================
  // RUTAS ADMIN
  // ========================================
  {
    path: 'usuario/admin',
    loadComponent: () => import('./usuario/admin/admin.page').then(m => m.AdminPage),
    canActivate: [authGuard],
    data: { role: 'admin' },
    providers: [Auth, provideHttpClient()]
  },
  {
    path: 'gestion-rutas',
    loadComponent: () => import('./pages/gestion-rutas/gestion-rutas.page').then(m => m.GestionRutasPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'detalle-ruta/:id',
    loadComponent: () => import('./pages/detalle-ruta/detalle-ruta.page').then(m => m.DetalleRutaPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'detalle-ruta',
    loadComponent: () => import('./pages/detalle-ruta/detalle-ruta.page').then(m => m.DetalleRutaPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'conductores',
    loadComponent: () => import('./pages/conductores/conductores.page').then(m => m.ConductoresPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'agregarconductor',
    loadComponent: () => import('./modal/agregarconductor/agregarconductor.page').then(m => m.AgregarconductorPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'editarconductor',
    loadComponent: () => import('./modal/editarconductor/editarconductor.page').then(m => m.EditarconductorPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'agregarruta',
    loadComponent: () => import('./modal/agregarruta/agregarruta.page').then(m => m.AgregarrutaPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },
  {
    path: 'modificarruta',
    loadComponent: () => import('./modal/modificarruta/modificarruta.page').then(m => m.ModificarrutaPage),
    canActivate: [authGuard],
    data: { role: 'admin' }
  },

  // ========================================
  // RUTAS SUPERVISOR
  // ========================================
  {
    path: 'usuario/supervisor',
    loadComponent: () => import('./usuario/supervisor/supervisor.page').then(m => m.SupervisorPage),
    canActivate: [authGuard],
    data: { role: 'supervisor' },
    providers: [Auth, provideHttpClient()]
  },
  {
    path: 'home',
    loadComponent: () => import('./supervisor/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'repartidores',
    loadComponent: () => import('./supervisor/repartidores/repartidores.component').then((m) => m.RepartidoresComponent),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'rutas',
    loadComponent: () => import('./supervisor/repartidores/repartidores.component').then((m) => m.RepartidoresComponent),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },

  // ========================================
  // RUTAS REPARTIDOR
  // ========================================
  {
    path: 'usuario/repartidor',
    loadComponent: () => import('./usuario/repartidor/repartidor.page').then(m => m.RepartidorPage),
    canActivate: [authGuard],
    data: { role: 'repartidor' },
    providers: [Auth, provideHttpClient()]
  },
  {
    path: 'repartidor',
    canActivate: [authGuard],
    data: { role: 'repartidor' },
    children: [
      {
        path: 'rutas',
        loadComponent: () => import('./pages/repartidor/repartidor-rutas/repartidor-rutas.page').then(m => m.RepartidorRutasPage)
      },
      {
        path: 'ruta/:id',
        loadComponent: () => import('./pages/repartidor/repartidor-detalle-ruta/repartidor-detalle-ruta.page').then(m => m.RepartidorDetalleRutaPage)
      }
    ]
  },
  
  // RUTAS INDIVIDUALES DEL REPARTIDOR (por si se usan sin children)
  {
    path: 'repartidor-rutas',
    loadComponent: () => import('./pages/repartidor/repartidor-rutas/repartidor-rutas.page').then(m => m.RepartidorRutasPage),
    canActivate: [authGuard],
    data: { role: 'repartidor' }
  },
  {
    path: 'repartidor-detalle-ruta',
    loadComponent: () => import('./pages/repartidor/repartidor-detalle-ruta/repartidor-detalle-ruta.page').then(m => m.RepartidorDetalleRutaPage),
    canActivate: [authGuard],
    data: { role: 'repartidor' }
  },

  // ========================================
  // MODALES (no necesitan guard, se abren desde páginas protegidas)
  // ========================================
  {
    path: 'modal-todos-clientes',
    loadComponent: () => import('./pages/repartidor/modal-todos-clientes/modal-todos-clientes.page').then(m => m.ModalTodosClientesPage)
  },
  {
    path: 'modal-agregar-venta',
    loadComponent: () => import('./pages/repartidor/modal-agregar-venta/modal-agregar-venta.page').then(m => m.ModalAgregarVentaPage)
  },
  {
    path: 'modal-editar-cliente',
    loadComponent: () => import('./pages/repartidor/modal-editar-cliente/modal-editar-cliente.page').then(m => m.ModalEditarClientePage)
  },  {
    path: 'modal-editar-venta',
    loadComponent: () => import('./pages/repartidor/modal-editar-venta/modal-editar-venta.page').then( m => m.ModalEditarVentaPage)
  },
  {
    path: 'modal-saltar-cliente',
    loadComponent: () => import('./pages/repartidor/modal-saltar-cliente/modal-saltar-cliente.page').then( m => m.ModalSaltarClientePage)
  }

];