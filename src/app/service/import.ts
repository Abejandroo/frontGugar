// src/app/services/import.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ClienteImport, ImportResult } from '../models/excel-import.model';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  // CONFIGURACIÓN
  private apiUrl = 'http://localhost:3000'; // ← CAMBIAR A TU URL DE PRODUCCIÓN
  private modoDesarrollo = false; // ← Cambiar a false para usar backend real

  constructor(private http: HttpClient) { }

  /**
   * Importar clientes al backend
   * 
   * Estructura esperada en el backend:
   * - 1 Ruta padre (ej: "Ruta - 2024-01-15") SIN supervisor/repartidor
   * - 3 DiaRuta (Lunes-Jueves, Martes-Viernes, Miércoles-Sábado)
   * - N ClienteRuta (cada cliente asignado a su DiaRuta correspondiente)
   * - El supervisor/repartidor se asignará después desde el frontend
   */
  importarClientes(
    clientes: ClienteImport[],
    fechaReporte: string,
    nombreRuta: string,
    supervisorId?: number,
    repartidorId?: number  
  ): Observable<ImportResult> {

    if (this.modoDesarrollo) {
      // Modo desarrollo - datos mock
      return this.importarClientesMock(clientes, nombreRuta);
    }

    const diasACodigoMap: { [key: string]: string } = {
      'Lunes - Jueves': 'LJ',
      'Martes - Viernes': 'MV',
      'Miércoles - Sábado': 'IS'
    };

    // MODO PRODUCCIÓN - Enviar al backend
    const payload = {
      fechaReporte: fechaReporte,
      nombreRuta: nombreRuta,
      clientes: clientes.map(c => ({
        numeroCliente: c.numeroCliente,
        nombreNegocio: c.nombreNegocio,
        representante: c.representante,
        colonia: c.colonia,
        direccion: c.direccion,
        codigoPostal: c.codigoPostal || null,
        ciudad: c.ciudad || 'Oaxaca',
        latitud: c.latitud || 17.0732,
        longitud: c.longitud || -96.7266,
        precioGarrafon: c.precioGarrafon.toString(),
        esCredito: c.esCredito,
        requiereFactura: c.requiereFactura,
        diasVisita: diasACodigoMap[c.diasVisita[0]], // Solo envía la ruta asignada (ej: "Lunes-Jueves")
        ordenVisita: c.ordenVisita.toString()
      }))
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/rutas/importar-excel`, payload, { headers })
      .pipe(
        map(response => ({
          success: response.success || true,
          message: response.message || '✅ Importación exitosa',
          totalRows: clientes.length,
          processedRows: response.clientesCreados || clientes.length,
          errors: response.errors || [],
          warnings: response.warnings || [],
          rutasCreadas: response.rutasCreadas,
          diasRutaCreados: response.diasRutaCreados,
          clientesCreados: response.clientesCreados,
          detalles: response.detalles
        })),
        catchError(error => {
          console.error('❌ Error importando:', error);
          return of({
            success: false,
            message: error.error?.message || 'Error al importar clientes',
            totalRows: clientes.length,
            processedRows: 0,
            errors: [error.error?.message || error.message || 'Error desconocido'],
            warnings: []
          });
        })
      );
  }

  /**
   * Modo mock para desarrollo (sin backend)
   */
  private importarClientesMock(
    clientes: ClienteImport[],
    nombreRuta: string
  ): Observable<ImportResult> {
    console.log('📦 MODO DESARROLLO - Datos mock');
    console.log('Nombre Ruta:', nombreRuta);
    console.log('Clientes a importar:', clientes.length);

    // Agrupar por días para simular la estructura de la BD
    const agrupados = clientes.reduce((acc, cliente) => {
      const dia = cliente.diasVisita[0];
      if (!acc[dia]) acc[dia] = [];
      acc[dia].push(cliente);
      return acc;
    }, {} as { [key: string]: ClienteImport[] });

    console.log('Agrupación por días:', agrupados);

    // Simular delay de red
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: `✅ ${clientes.length} clientes importados (MODO DESARROLLO)`,
          totalRows: clientes.length,
          processedRows: clientes.length,
          errors: [],
          warnings: ['⚠️ Modo desarrollo activado - no se guardó en base de datos'],
          rutasCreadas: 1,
          diasRutaCreados: Object.keys(agrupados).length,
          clientesCreados: clientes.length,
          detalles: {
            rutaPadre: nombreRuta,
            diasCreados: Object.keys(agrupados),
            distribucion: Object.entries(agrupados).map(([dia, clts]) => ({
              dia,
              cantidad: clts.length
            }))
          }
        });
        observer.complete();
      }, 1500);
    });
  }

  /**
   * Verificar conexión con el backend
   */
  verificarConexion(): Observable<boolean> {
    if (this.modoDesarrollo) {
      console.log('🔧 Modo desarrollo - conexión simulada');
      return of(true);
    }

    return this.http.get(`${this.apiUrl}/rutas`, { observe: 'response' })
      .pipe(
        map(response => {
          console.log('✅ Backend conectado:', response.status);
          return true;
        }),
        catchError(error => {
          console.error('❌ Backend no disponible:', error.message);
          return of(false);
        })
      );
  }

  /**
   * Obtener todas las rutas (opcional)
   */
  getRutas(): Observable<any[]> {
    if (this.modoDesarrollo) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/rutas`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo rutas:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener detalles de una ruta específica
   */
  getRutaDetalle(rutaId: number): Observable<any> {
    if (this.modoDesarrollo) {
      return of(null);
    }

    return this.http.get<any>(`${this.apiUrl}/rutas/${rutaId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo detalle de ruta:', error);
          return of(null);
        })
      );
  }

  /**
   * Obtener clientes de un día de ruta específico
   */
  getClientesDiaRuta(diaRutaId: number): Observable<any[]> {
    if (this.modoDesarrollo) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/rutas/dia-ruta/${diaRutaId}/clientes`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo clientes del día de ruta:', error);
          return of([]);
        })
      );
  }

  /**
   * Eliminar una ruta completa (con sus días y clientes)
   */
  eliminarRuta(rutaId: number): Observable<any> {
    if (this.modoDesarrollo) {
      console.log('🗑️ MODO DESARROLLO - Ruta eliminada (simulado)');
      return of({ success: true, message: 'Ruta eliminada (mock)' });
    }

    return this.http.delete(`${this.apiUrl}/rutas/${rutaId}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando ruta:', error);
          return of({ success: false, message: error.message });
        })
      );
  }

  /**
 * Verificar si un precio existe en la BD
 */
verificarPrecioExiste(precio: number): Observable<boolean> {
  return this.http.get<boolean>(`${this.apiUrl}/precios/verificar/${precio}`)
    .pipe(catchError(() => of(false)));
}

/**
 * Crear un nuevo precio
 */
crearPrecio(precioPorGarrafon: number, tipoCompra: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/precios`, {
    precioPorGarrafon,
    tipoCompra
  });
}

/**
 * Obtener lista de supervisores
 */
getSupervisores(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/usuarios/supervisores`)
    .pipe(catchError(() => of([])));
}

/**
 * Obtener lista de repartidores
 */
getRepartidores(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/usuarios/repartidores`)
    .pipe(catchError(() => of([])));
}

}