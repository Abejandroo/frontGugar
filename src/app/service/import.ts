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
  private apiUrl = 'https://backgugar-production.up.railway.app'; 

  constructor(private http: HttpClient) { }


  importarClientes(
    clientes: ClienteImport[],
    fechaReporte: string,
    nombreRuta: string,
    supervisorId?: number,
    repartidorId?: number
  ): Observable<ImportResult> {



    const diasACodigoMap: { [key: string]: string } = {
      'Lunes - Jueves': 'LJ',
      'Martes - Viernes': 'MV',
      'Miércoles - Sábado': 'IS'
    };

    const payload = {
      fechaReporte: fechaReporte,
      nombreRuta: nombreRuta,
      supervisorId: supervisorId || null,
      repartidorId: repartidorId || null,
      clientes: clientes.map(c => ({
        numeroCliente: c.numeroCliente,
        nombreNegocio: c.nombreNegocio,
        representante: c.representante,
        colonia: c.colonia,
        direccion: c.direccion,
        codigoPostal: c.codigoPostal || null,
        ciudad: c.ciudad || 'Oaxaca',
        latitud: c.latitud || null,
        longitud: c.longitud || null,
        precioGarrafon: c.precioGarrafon.toString(),
        esCredito: c.esCredito,
        requiereFactura: c.requiereFactura,
        diasVisita: diasACodigoMap[c.diasVisita[0]],
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
          message: response.message || 'Importación exitosa',
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
          console.error('Error importando:', error);
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



  verificarConexion(): Observable<boolean> {


    return this.http.get(`${this.apiUrl}/rutas`, { observe: 'response' })
      .pipe(
        map(response => {
          console.log(' Backend conectado:', response.status);
          return true;
        }),
        catchError(error => {
          console.error('Backend no disponible:', error.message);
          return of(false);
        })
      );
  }

  getRutas(): Observable<any[]> {

    return this.http.get<any[]>(`${this.apiUrl}/rutas`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo rutas:', error);
          return of([]);
        })
      );
  }

  getRutaDetalle(rutaId: number): Observable<any> {


    return this.http.get<any>(`${this.apiUrl}/rutas/${rutaId}`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo detalle de ruta:', error);
          return of(null);
        })
      );
  }

  getClientesDiaRuta(diaRutaId: number): Observable<any[]> {


    return this.http.get<any[]>(`${this.apiUrl}/rutas/dia-ruta/${diaRutaId}/clientes`)
      .pipe(
        catchError(error => {
          console.error('Error obteniendo clientes del día de ruta:', error);
          return of([]);
        })
      );
  }

  eliminarRuta(rutaId: number): Observable<any> {


    return this.http.delete(`${this.apiUrl}/rutas/${rutaId}`)
      .pipe(
        catchError(error => {
          console.error('Error eliminando ruta:', error);
          return of({ success: false, message: error.message });
        })
      );
  }

  verificarPrecioExiste(precio: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/precios/verificar/${precio}`)
      .pipe(catchError(() => of(false)));
  }

  crearPrecio(precioPorGarrafon: number, tipoCompra: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/precios`, {
      precioPorGarrafon,
      tipoCompra
    });
  }

  getSupervisores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/supervisores`)
      .pipe(catchError(() => of([])));
  }

  getRepartidores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuarios/repartidores`)
      .pipe(catchError(() => of([])));
  }

}