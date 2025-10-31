import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home1',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
    {
    path: 'login',
    loadComponent: () => import('./supervisor/login/login.component').then((m) => m.LoginComponent),
  },
   {
    path: 'home',
    loadComponent: () => import('./supervisor/home/home.component').then((m) => m.HomeComponent),
  },
   {
    path: 'repartidores',
    loadComponent: () => import('./supervisor/repartidores/repartidores.component').then((m) => m.RepartidoresComponent),
  },
   {
    path: 'rutas',
    loadComponent: () => import('./supervisor/repartidores/repartidores.component').then((m) => m.RepartidoresComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
