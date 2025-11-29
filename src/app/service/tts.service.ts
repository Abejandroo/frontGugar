import { Injectable } from '@angular/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class TtsService {

  private habilitado = true;
  private velocidad = 1.0;
  private volumen = 1.0;

  constructor() {
    // Verificar si estamos en plataforma nativa
    if (!Capacitor.isNativePlatform()) {
      console.warn('⚠️ TTS solo funciona en dispositivos nativos (Android/iOS)');
    }
  }

  /**
   * Habilitar/deshabilitar TTS
   */
  setHabilitado(valor: boolean) {
    this.habilitado = valor;
  }

  /**
   * Configurar velocidad de habla (0.5 - 2.0)
   */
  setVelocidad(valor: number) {
    this.velocidad = Math.max(0.5, Math.min(2.0, valor));
  }

  /**
   * Configurar volumen (0.0 - 1.0)
   */
  setVolumen(valor: number) {
    this.volumen = Math.max(0.0, Math.min(1.0, valor));
  }

  /**
   * Hablar texto
   */
  async hablar(texto: string): Promise<void> {
    if (!this.habilitado) return;

    try {
      await TextToSpeech.speak({
        text: texto,
        lang: 'es-MX',
        rate: this.velocidad,
        pitch: 1.0,
        volume: this.volumen,
        category: 'ambient'
      });
    } catch (error) {
      console.error('Error en TTS:', error);
      // Fallback para web usando Web Speech API
      this.hablarWeb(texto);
    }
  }

  /**
   * Fallback para navegador web
   */
  private hablarWeb(texto: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-MX';
      utterance.rate = this.velocidad;
      utterance.volume = this.volumen;
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Detener cualquier habla en curso
   */
  async detener(): Promise<void> {
    try {
      await TextToSpeech.stop();
    } catch (error) {
      // Fallback para web
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  // ========================================
  // MÉTODOS ESPECÍFICOS PARA NAVEGACIÓN
  // ========================================

  /**
   * Anunciar siguiente cliente
   */
  async anunciarCliente(nombre: string, direccion: string): Promise<void> {
    const texto = `Siguiente cliente: ${nombre}. Dirección: ${direccion}`;
    await this.hablar(texto);
  }

  /**
   * Anunciar distancia al cliente
   */
  async anunciarDistancia(metros: number): Promise<void> {
    let texto = '';
    
    if (metros < 50) {
      texto = 'Has llegado a tu destino';
    } else if (metros < 100) {
      texto = `A ${Math.round(metros)} metros`;
    } else if (metros < 500) {
      texto = `A ${Math.round(metros)} metros de tu destino`;
    } else if (metros < 1000) {
      texto = `A ${Math.round(metros)} metros`;
    } else {
      const km = (metros / 1000).toFixed(1);
      texto = `A ${km} kilómetros`;
    }
    
    await this.hablar(texto);
  }

  /**
   * Anunciar llegada
   */
  async anunciarLlegada(nombreCliente: string): Promise<void> {
    await this.hablar(`Has llegado. Cliente: ${nombreCliente}`);
  }

  /**
   * Anunciar inicio de ruta
   */
  async anunciarInicioRuta(totalClientes: number): Promise<void> {
    await this.hablar(`Ruta iniciada. ${totalClientes} clientes por visitar.`);
  }

  /**
   * Anunciar fin de ruta
   */
  async anunciarFinRuta(visitados: number, total: number): Promise<void> {
    await this.hablar(`Ruta completada. ${visitados} de ${total} clientes visitados.`);
  }

  /**
   * Anunciar venta registrada
   */
  async anunciarVentaRegistrada(garrafones: number): Promise<void> {
    await this.hablar(`Venta registrada. ${garrafones} garrafones.`);
  }

  /**
   * Anunciar cliente saltado
   */
  async anunciarClienteSaltado(): Promise<void> {
    await this.hablar('Cliente saltado. Continuando con el siguiente.');
  }

  /**
   * Anunciar alerta de bajo combustible (si se implementa)
   */
  async anunciarAlerta(mensaje: string): Promise<void> {
    await this.hablar(`Alerta: ${mensaje}`);
  }
}