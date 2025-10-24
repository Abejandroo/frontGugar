import { Routes } from '@angular/router';

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
    loadComponent: () => import('./auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'usuario/admin',
    loadComponent: () => import('./usuario/admin/admin.page').then( m => m.AdminPage)
  },
  {
    path: 'usuario/supervisor',
    loadComponent: () => import('./usuario/supervisor/supervisor.page').then( m => m.SupervisorPage)
  },
  {
    path: 'usuario/repartidor',
    loadComponent: () => import('./usuario/repartidor/repartidor.page').then( m => m.RepartidorPage)
  },  {
    path: 'lista-domicilios',
    loadComponent: () => import('./pages/chofer/lista-domicilios/lista-domicilios.page').then( m => m.ListaDomiciliosPage)
  },
  {
    path: 'detalle-domicilio',
    loadComponent: () => import('./pages/chofer/detalle-domicilio/detalle-domicilio.page').then( m => m.DetalleDomicilioPage)
  },



];
