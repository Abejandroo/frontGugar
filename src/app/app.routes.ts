
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
    path: 'supervisores/home',
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
   {
    path: 'supervisores/clientes',
    loadComponent: () => import('./supervisor/clientes/clientes.component').then((m) => m.ClientesComponent),
        canActivate: [authGuard], data: { role: 'supervisor' }
  },
  {
    path: 'supervisores/rutas',
    loadComponent: () => import('./supervisor/rutas/rutas.component').then((m) => m.RutasComponent),
      canActivate: [authGuard], data: { role: 'supervisor' }
  },
  {
    path: 'agregar-cliente',
    loadComponent: () => import('./modal/agregar-cliente/agregar-cliente.page').then( m => m.AgregarClientePage)
  },
  {
    path: 'editar-cliente',
    loadComponent: () => import('./modal/editar-cliente/editar-cliente.page').then( m => m.EditarClientePage)
  },
  {
    path: 'eliminar-cliente',
    loadComponent: () => import('./modal/eliminar-cliente/eliminar-cliente.page').then( m => m.EliminarClientePage)
  },
  {
    path: 'supervisores/precios',
    loadComponent: () => import('./supervisor/precios/precios.page').then( m => m.PreciosPage)
  },
  {
    path: 'agregarprecio',
    loadComponent: () => import('./modal/agregarprecio/agregarprecio.page').then( m => m.AgregarprecioPage)
  },
  {
    path: 'editarprecio',
    loadComponent: () => import('./modal/editarprecio/editarprecio.page').then( m => m.EditarprecioPage)
  },
  

  






];