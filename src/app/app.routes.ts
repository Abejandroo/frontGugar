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
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage),
    providers: [Auth, provideHttpClient()]
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
    path: 'supervisores/home',
    loadComponent: () => import('./supervisor/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'supervisores/clientes',
    loadComponent: () => import('./supervisor/clientes/clientes.component').then((m) => m.ClientesComponent),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'supervisores/rutas',
    loadComponent: () => import('./supervisor/rutas/rutas.component').then((m) => m.RutasComponent),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'supervisores/precios',
    loadComponent: () => import('./supervisor/precios/precios.page').then(m => m.PreciosPage),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'supervisor/detalle-ruta/:id',
    loadComponent: () => import('./pages/detalle-ruta/detalle-ruta.page').then(m => m.DetalleRutaPage),
    canActivate: [authGuard],
    data: { role: 'supervisor' }
  },
  {
    path: 'repartidores',
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
  // MODALES COMPARTIDOS
  // ========================================
  {
    path: 'agregar-cliente',
    loadComponent: () => import('./modal/agregar-cliente/agregar-cliente.page').then(m => m.AgregarClientePage)
  },
  {
    path: 'editar-cliente',
    loadComponent: () => import('./modal/editar-cliente/editar-cliente.page').then(m => m.EditarClientePage)
  },
  {
    path: 'agregarprecio',
    loadComponent: () => import('./modal/agregarprecio/agregarprecio.page').then(m => m.AgregarprecioPage)
  },
  {
    path: 'editarprecio',
    loadComponent: () => import('./modal/editarprecio/editarprecio.page').then(m => m.EditarprecioPage)
  },
  {
    path: 'monitoreo-ruta',
    loadComponent: () => import('./modal/monitoreo-ruta/monitoreo-ruta.page').then(m => m.MonitoreoRutaPage)
  },

  // ========================================
  // MODALES REPARTIDOR
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
  },
  {
    path: 'modal-editar-venta',
    loadComponent: () => import('./pages/repartidor/modal-editar-venta/modal-editar-venta.page').then(m => m.ModalEditarVentaPage)
  },
  {
    path: 'modal-saltar-cliente',
    loadComponent: () => import('./pages/repartidor/modal-saltar-cliente/modal-saltar-cliente.page').then(m => m.ModalSaltarClientePage)
  }
];