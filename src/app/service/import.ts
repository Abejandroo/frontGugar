import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { ClienteImport, ImportResult } from '../models/excel-import.model.';

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  // TODO: Cambiar por tu URL real del backend
  private apiUrl = 'http://localhost:3000/api';
  
  // Modo de desarrollo (datos mock)
  private modoDesarrollo = true; // Cambiar a false cuando tengas el backend

  constructor(private http: HttpClient) {}

  /**
   * Importar clientes desde Excel a la base de datos
   */
  importarClientes(
    clientes: ClienteImport[], 
    supervisor: string,
    fecha: string
  ): Observable<ImportResult> {
    
    // Si está en modo desarrollo, retorna datos mock
    if (this.modoDesarrollo) {
      return this.importarClientesMock(clientes);
    }

    // Modo producción: llamada real al backend
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      clientes: clientes,
      supervisor: supervisor,
      fecha: fecha,
      totalClientes: clientes.length,
      totalVisitas: this.calcularTotalVisitas(clientes)
    };

    return this.http.post<ImportResult>(`${this.apiUrl}/import/clientes`, body, { headers })
      .pipe(
        map(response => {
          console.log('✅ Respuesta del servidor:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Error en la importación:', error);
          return of({
            success: false,
            message: `Error al conectar con el servidor: ${error.message}`,
            totalRows: clientes.length,
            processedRows: 0,
            errors: [error.message],
            warnings: []
          });
        })
      );
  }

  /**
   * Validar datos antes de importar
   */
  validarDatos(clientes: ClienteImport[]): Observable<any> {
    if (this.modoDesarrollo) {
      return this.validarDatosMock(clientes);
    }

    return this.http.post(`${this.apiUrl}/import/validar`, { clientes })
      .pipe(
        catchError(error => {
          console.error('Error validando datos:', error);
          return of({ valid: false, errors: [error.message] });
        })
      );
  }

  /**
   * Obtener historial de importaciones
   */
  getHistorialImportaciones(): Observable<any[]> {
    if (this.modoDesarrollo) {
      return this.getHistorialMock();
    }

    return this.http.get<any[]>(`${this.apiUrl}/import/historial`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo historial:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener detalles de una importación específica
   */
  getDetallesImportacion(importacionId: number): Observable<any> {
    if (this.modoDesarrollo) {
      return of({
        id: importacionId,
        fecha: new Date().toISOString(),
        supervisor: 'Mock Supervisor',
        totalClientes: 10,
        exitosos: 8,
        fallidos: 2
      }).pipe(delay(300));
    }

    return this.http.get(`${this.apiUrl}/import/${importacionId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo detalles:', error);
          return of(null);
        })
      );
  }

  /**
   * Verificar si un cliente ya existe
   */
  verificarClienteExistente(numeroCliente: string): Observable<boolean> {
    if (this.modoDesarrollo) {
      // Simular que el 10% de clientes ya existen
      return of(Math.random() < 0.1).pipe(delay(100));
    }

    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/clientes/verificar/${numeroCliente}`)
      .pipe(
        map(response => response.existe),
        catchError(() => of(false))
      );
  }

  /**
   * Descargar plantilla de ejemplo
   */
  descargarPlantilla(): void {
    // Esta función se puede implementar en el componente usando XLSX
    console.log('Descargando plantilla...');
  }

  // ==========================================
  // MÉTODOS PRIVADOS Y MOCK DATA
  // ==========================================

  private calcularTotalVisitas(clientes: ClienteImport[]): number {
    return clientes.reduce((total, cliente) => {
      return total + cliente.diasVisita.length;
    }, 0);
  }

  /**
   * Simular importación (datos mock para desarrollo)
   */
  private importarClientesMock(clientes: ClienteImport[]): Observable<ImportResult> {
    console.log('🔧 Modo desarrollo: Simulando importación...');
    console.log('📦 Clientes a importar:', clientes);

    // Simular un delay de 2 segundos como si fuera una llamada real
    return of({
      success: true,
      message: 'Importación completada exitosamente (MODO DESARROLLO)',
      totalRows: clientes.length,
      processedRows: Math.floor(clientes.length * 0.95), // Simular 95% éxito
      errors: this.generarErroresMock(clientes),
      warnings: this.generarWarningsMock(clientes)
    }).pipe(delay(2000));
  }

  private generarErroresMock(clientes: ClienteImport[]): string[] {
    const errors: string[] = [];
    const numErrores = Math.min(2, Math.floor(clientes.length * 0.05));
    
    for (let i = 0; i < numErrores; i++) {
      const indice = Math.floor(Math.random() * clientes.length);
      errors.push(
        `Cliente ${clientes[indice].numeroCliente} (${clientes[indice].representante}): Error de validación simulado`
      );
    }
    
    return errors;
  }

  private generarWarningsMock(clientes: ClienteImport[]): string[] {
    const warnings: string[] = [];
    
    // Simular algunas advertencias
    const clientesSinNegocio = clientes.filter(c => !c.nombreNegocio).length;
    if (clientesSinNegocio > 0) {
      warnings.push(`${clientesSinNegocio} clientes sin nombre de negocio`);
    }

    const clientesConCredito = clientes.filter(c => c.esCredito).length;
    if (clientesConCredito > 0) {
      warnings.push(`${clientesConCredito} clientes configurados con crédito`);
    }

    const clientesConFactura = clientes.filter(c => c.requiereFactura).length;
    if (clientesConFactura > 0) {
      warnings.push(`${clientesConFactura} clientes requieren factura`);
    }

    return warnings;
  }

  private validarDatosMock(clientes: ClienteImport[]): Observable<any> {
    console.log('🔧 Validando datos (MODO DESARROLLO)...');
    
    const erroresValidacion: string[] = [];
    
    clientes.forEach((cliente, index) => {
      // Validaciones básicas
      if (!cliente.numeroCliente) {
        erroresValidacion.push(`Fila ${index + 1}: Falta número de cliente`);
      }
      if (!cliente.direccion) {
        erroresValidacion.push(`Fila ${index + 1}: Falta dirección`);
      }
      if (cliente.precioGarrafon <= 0) {
        erroresValidacion.push(`Fila ${index + 1}: Precio inválido`);
      }
      if (cliente.diasVisita.length === 0) {
        erroresValidacion.push(`Fila ${index + 1}: Días de visita inválidos`);
      }
    });

    return of({
      valid: erroresValidacion.length === 0,
      errors: erroresValidacion,
      totalValidados: clientes.length,
      validos: clientes.length - erroresValidacion.length
    }).pipe(delay(1000));
  }

  private getHistorialMock(): Observable<any[]> {
    return of([
      {
        id: 1,
        fecha: '2025-01-15',
        supervisor: 'ADAN FERNANDO CANSECO RODRIGUEZ',
        totalClientes: 45,
        exitosos: 43,
        fallidos: 2,
        estado: 'completado'
      },
      {
        id: 2,
        fecha: '2025-01-10',
        supervisor: 'MARIA GARCIA LOPEZ',
        totalClientes: 38,
        exitosos: 38,
        fallidos: 0,
        estado: 'completado'
      },
      {
        id: 3,
        fecha: '2025-01-05',
        supervisor: 'JUAN PEREZ MARTINEZ',
        totalClientes: 52,
        exitosos: 50,
        fallidos: 2,
        estado: 'completado'
      }
    ]).pipe(delay(500));
  }

  /**
   * Cambiar modo de desarrollo/producción
   */
  setModoDesarrollo(modo: boolean): void {
    this.modoDesarrollo = modo;
    console.log(`🔧 Modo ${modo ? 'DESARROLLO' : 'PRODUCCIÓN'} activado`);
  }

  /**
   * Verificar estado de conexión con el backend
   */
  verificarConexion(): Observable<boolean> {
    if (this.modoDesarrollo) {
      return of(true).pipe(delay(200));
    }

    return this.http.get(`${this.apiUrl}/health`, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(() => of(false))
      );
  }

  /**
   * Obtener configuración del servicio
   */
  getConfig(): { apiUrl: string; modoDesarrollo: boolean } {
    return {
      apiUrl: this.apiUrl,
      modoDesarrollo: this.modoDesarrollo
    };
  }

  /**
   * Actualizar URL del API
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
    console.log(`🔗 API URL actualizada: ${url}`);
  }
}