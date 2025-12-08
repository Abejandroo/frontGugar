import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ============================================
  // CONFIGURACIÓN BÁSICA - PERSONALIZADA PARA GUGAR
  // ============================================
  appId: 'com.gugar.app',    // ID único para tu app
  appName: 'Gugar App',      // Nombre visible
  webDir: 'www',

  // ============================================
  // CONFIGURACIÓN DEL SERVIDOR
  // ============================================
  server: {
    // Usa HTTPS en producción
    androidScheme: 'https',
    
    // Permite navegación a cualquier URL (para tu API en Railway)
    allowNavigation: ['*']
  },

  // ============================================
  // CONFIGURACIÓN ANDROID
  // ============================================
  android: {
    // Permite HTTP si tu backend no tiene HTTPS
    allowMixedContent: true,
    
    // Útil para depuración - puedes desactivar en release
    webContentsDebuggingEnabled: true,
    
    // Color de fondo mientras carga
    backgroundColor: '#ffffff'
  },

  // ============================================
  // PLUGINS
  // ============================================
  plugins: {
    // Geolocation - Para GPS
    Geolocation: {
      enableHighAccuracy: true
    },
    
    // Status Bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#3880ff'
    },
    
    // Keyboard
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },
    
    // Splash Screen (opcional)
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false
    }
  }
};

export default config;