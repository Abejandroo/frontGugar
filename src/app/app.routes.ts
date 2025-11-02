
import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Auth } from './service/auth'; 
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then( m => m.LoginPage),
    // Proveedores para la página de login
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'usuario/admin',
    loadComponent: () => import('./usuario/admin/admin.page').then( m => m.AdminPage),
    // ¡Aquí está la magia! Proveedores para la página de admin
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'usuario/supervisor',
    loadComponent: () => import('./usuario/supervisor/supervisor.page').then( m => m.SupervisorPage),
    // También lo agregamos aquí, ¡es muy probable que lo necesite!
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'usuario/repartidor',
    loadComponent: () => import('./usuario/repartidor/repartidor.page').then( m => m.RepartidorPage),
    // Y aquí también, por si acaso
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'menu-admin',
    loadComponent: () => import('./menu/menu-admin/menu-admin.page').then( m => m.MenuAdminPage)
  },
  {
    path: 'gestion-rutas',
    loadComponent: () => import('./pages/gestion-rutas/gestion-rutas.page').then( m => m.GestionRutasPage)
  },
  {
    path: 'conductores',
    loadComponent: () => import('./pages/conductores/conductores.page').then( m => m.ConductoresPage)
  },
  {
    path: 'supervisores',
    loadComponent: () => import('./pages/supervisores/supervisores.page').then( m => m.SupervisoresPage)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes.page').then( m => m.ReportesPage)
  },
  {
    path: 'agregarconductor',
    loadComponent: () => import('./modal/agregarconductor/agregarconductor.page').then( m => m.AgregarconductorPage)
  },
  {
    path: 'editarconductor',
    loadComponent: () => import('./modal/editarconductor/editarconductor.page').then( m => m.EditarconductorPage)
  },
  {
    path: 'eliminarconductor',
    loadComponent: () => import('./modal/eliminarconductor/eliminarconductor.page').then( m => m.EliminarconductorPage)
  },  {
    path: 'agregarruta',
    loadComponent: () => import('./modal/agregarruta/agregarruta.page').then( m => m.AgregarrutaPage)
  },
  {
    path: 'modificarruta',
    loadComponent: () => import('./modal/modificarruta/modificarruta.page').then( m => m.ModificarrutaPage)
  },
  {
    path: 'eliminarrruta',
    loadComponent: () => import('./modal/eliminarrruta/eliminarrruta.page').then( m => m.EliminarrrutaPage)
  },



];