import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const toastController = inject(ToastController);
  const usuarioStr = localStorage.getItem('usuario');
  const token = localStorage.getItem('token');
  if (!usuarioStr || !token) {
    console.warn('🔒 Acceso denegado: No hay sesión activa.');
    router.navigate(['/auth/login']);
    return false;
  }
  const usuario = JSON.parse(usuarioStr);
  const rolRequerido = route.data['role']; 
  if (rolRequerido && usuario.role !== rolRequerido) {
    console.warn(`🔒 Acceso denegado: Se requiere rol ${rolRequerido}, pero eres ${usuario.role}`);
    
    const toast = await toastController.create({
      message: '⛔ No tienes permisos para acceder a esta zona.',
      duration: 3000,
      color: 'danger',
      position: 'top',
      icon: 'lock-closed'
    });
    await toast.present();
    if (usuario.role === 'repartidor') router.navigate(['/usuario/repartidor']);
    else if (usuario.role === 'supervisor') router.navigate(['/usuario/supervisor']);
    else router.navigate(['/auth/login']);
    
    return false;
  }
  return true;
};