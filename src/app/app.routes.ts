
import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { Auth } from './service/auth'; 
import { authGuard } from './guards/auth-guard';
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
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'usuario/admin',
    loadComponent: () => import('./usuario/admin/admin.page').then( m => m.AdminPage),
    canActivate: [authGuard],  
    data: { role: 'admin' },      
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'usuario/supervisor',
    loadComponent: () => import('./usuario/supervisor/supervisor.page').then( m => m.SupervisorPage),
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'usuario/repartidor',
    loadComponent: () => import('./usuario/repartidor/repartidor.page').then( m => m.RepartidorPage),
    providers: [
      Auth,
      provideHttpClient()
    ]
  },
  {
    path: 'gestion-rutas',
    loadComponent: () => import('./pages/gestion-rutas/gestion-rutas.page').then( m => m.GestionRutasPage),
    canActivate: [authGuard],  
    data: { role: 'admin' },       
  },
  {
    path: 'conductores',
    loadComponent: () => import('./pages/conductores/conductores.page').then( m => m.ConductoresPage),
    canActivate: [authGuard],     
    data: { role: 'admin' },      
  },
  {
    path: 'agregarconductor',
    loadComponent: () => import('./modal/agregarconductor/agregarconductor.page').then( m => m.AgregarconductorPage),
    canActivate: [authGuard], data: { role: 'admin' }

  },
  {
    path: 'editarconductor',
    loadComponent: () => import('./modal/editarconductor/editarconductor.page').then( m => m.EditarconductorPage),
    canActivate: [authGuard], data: { role: 'admin' }
  },
   {
    path: 'agregarruta',
    loadComponent: () => import('./modal/agregarruta/agregarruta.page').then( m => m.AgregarrutaPage),
    canActivate: [authGuard], data: { role: 'admin' }
  },
  {
    path: 'modificarruta',
    loadComponent: () => import('./modal/modificarruta/modificarruta.page').then( m => m.ModificarrutaPage),
    canActivate: [authGuard], data: { role: 'admin' }

  },
  
  {
    path: 'detalle-ruta',
    loadComponent: () => import('./modal/detalle-ruta/detalle-ruta.page').then( m => m.DetalleRutaPage),
    canActivate: [authGuard], data: { role: 'admin' }

  },





];