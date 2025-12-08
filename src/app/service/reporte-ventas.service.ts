import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

interface VentaReporte {
  id: number;
  fecha: Date;
  clienteNombre: string;
  clienteNegocio: string;
  clienteDireccion: string;
  rutaNombre: string;
  diaSemana: string;
  cantidadVendida: number;
  precioUnitario: number;
  total: number;
  estado: string;
  motivoSalto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteVentasService {

  private url = 'https://backgugar-production.up.railway.app';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las ventas de la semana actual
   */
  obtenerVentasSemana(): Observable<any[]> {
    const hoy = new Date();
    const inicioSemana = this.getInicioSemana(hoy);
    const finSemana = this.getFinSemana(hoy);

    return this.http.get<any[]>(
      `${this.url}/ventas/rango?inicio=${inicioSemana.toISOString()}&fin=${finSemana.toISOString()}`
    );
  }

  /**
   * Obtiene las ventas de una semana específica
   */
  obtenerVentasPorRango(inicio: Date, fin: Date): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.url}/ventas/rango?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`
    );
  }

  /**
   * Genera y descarga el Excel de ventas semanales
   */
  async generarExcelSemanal(ventas: any[]): Promise<void> {
    // Transformar datos para el Excel
    const datosExcel = ventas.map(v => ({
      'ID': v.id,
      'Fecha': new Date(v.fecha).toLocaleDateString('es-MX'),
      'Hora': new Date(v.fecha).toLocaleTimeString('es-MX'),
      'Cliente': v.clienteRuta?.cliente?.representante || 'N/A',
      'Negocio': v.clienteRuta?.cliente?.negocio || 'N/A',
      'Dirección': v.clienteRuta?.cliente?.direcciones?.[0]?.direccion || 'N/A',
      'Colonia': v.clienteRuta?.cliente?.direcciones?.[0]?.colonia || 'N/A',
      'Ruta': v.clienteRuta?.diaRuta?.ruta?.nombre || 'N/A',
      'Día': v.clienteRuta?.diaRuta?.diaSemana || 'N/A',
      'Cantidad': v.cantidadVendida,
      'Precio Unitario': v.precio?.precioPorGarrafon || 0,
      'Total': v.total,
      'Estado': this.traducirEstado(v.estado),
      'Motivo Salto': v.motivoSalto || ''
    }));

    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // ===== HOJA 1: VENTAS DETALLADAS =====
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 6 },   // ID
      { wch: 12 },  // Fecha
      { wch: 10 },  // Hora
      { wch: 25 },  // Cliente
      { wch: 20 },  // Negocio
      { wch: 30 },  // Dirección
      { wch: 20 },  // Colonia
      { wch: 20 },  // Ruta
      { wch: 18 },  // Día
      { wch: 10 },  // Cantidad
      { wch: 14 },  // Precio Unitario
      { wch: 12 },  // Total
      { wch: 12 },  // Estado
      { wch: 25 },  // Motivo Salto
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    // ===== HOJA 2: RESUMEN POR RUTA =====
    const resumenRutas = this.generarResumenPorRuta(ventas);
    const wsRutas = XLSX.utils.json_to_sheet(resumenRutas);
    wsRutas['!cols'] = [
      { wch: 25 },  // Ruta
      { wch: 18 },  // Clientes Visitados
      { wch: 10 },  // Ventas
      { wch: 10 },  // Saltados
      { wch: 12 },  // Garrafones
      { wch: 15 },  // Ingresos
    ];
    XLSX.utils.book_append_sheet(wb, wsRutas, 'Por Ruta');

    // ===== HOJA 3: RESUMEN GENERAL =====
    const resumen = this.generarResumen(ventas);
    const wsResumen = XLSX.utils.json_to_sheet(resumen);
    wsResumen['!cols'] = [
      { wch: 25 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');

    // Generar nombre de archivo con fecha
    const hoy = new Date();
    const nombreArchivo = `Ventas_Semana_${this.formatearFechaArchivo(hoy)}.xlsx`;

    // Descargar
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Genera el resumen de ventas
   */
  private generarResumen(ventas: any[]): any[] {
    const ventasRealizadas = ventas.filter(v => v.estado === 'realizado');
    const ventasSaltadas = ventas.filter(v => v.estado === 'saltado');

    const totalGarrafones = ventasRealizadas.reduce((sum, v) => sum + v.cantidadVendida, 0);
    const totalIngresos = ventasRealizadas.reduce((sum, v) => sum + parseFloat(v.total), 0);

    // Agrupar por día
    const ventasPorDia: { [key: string]: number } = {};
    const ingresosPorDia: { [key: string]: number } = {};

    ventasRealizadas.forEach(v => {
      const dia = new Date(v.fecha).toLocaleDateString('es-MX', { weekday: 'long' });
      ventasPorDia[dia] = (ventasPorDia[dia] || 0) + v.cantidadVendida;
      ingresosPorDia[dia] = (ingresosPorDia[dia] || 0) + parseFloat(v.total);
    });

    const resumen = [
      { 'Concepto': '📊 RESUMEN SEMANAL', 'Valor': '' },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': 'Total Ventas Realizadas', 'Valor': ventasRealizadas.length },
      { 'Concepto': 'Total Clientes Saltados', 'Valor': ventasSaltadas.length },
      { 'Concepto': 'Total Garrafones Vendidos', 'Valor': totalGarrafones },
      { 'Concepto': 'Total Ingresos', 'Valor': `$${totalIngresos.toFixed(2)}` },
      { 'Concepto': '', 'Valor': '' },
      { 'Concepto': '📅 VENTAS POR DÍA', 'Valor': '' },
    ];

    Object.keys(ventasPorDia).forEach(dia => {
      resumen.push({
        'Concepto': `${dia} - Garrafones`,
        'Valor': ventasPorDia[dia]
      });
      resumen.push({
        'Concepto': `${dia} - Ingresos`,
        'Valor': `$${ingresosPorDia[dia].toFixed(2)}`
      });
    });

    return resumen;
  }

  /**
   * Genera resumen por ruta
   */
  private generarResumenPorRuta(ventas: any[]): any[] {
    const ventasRealizadas = ventas.filter(v => v.estado === 'realizado');
    const ventasSaltadas = ventas.filter(v => v.estado === 'saltado');

    // Agrupar por ruta
    const rutasMap: { [key: string]: {
      nombre: string;
      garrafones: number;
      ingresos: number;
      ventasRealizadas: number;
      clientesSaltados: number;
      clientes: Set<string>;
    }} = {};

    // Procesar ventas realizadas
    ventasRealizadas.forEach(v => {
      const rutaNombre = v.clienteRuta?.diaRuta?.ruta?.nombre || 'Sin Ruta';
      const clienteNombre = v.clienteRuta?.cliente?.representante || 'N/A';
      
      if (!rutasMap[rutaNombre]) {
        rutasMap[rutaNombre] = {
          nombre: rutaNombre,
          garrafones: 0,
          ingresos: 0,
          ventasRealizadas: 0,
          clientesSaltados: 0,
          clientes: new Set()
        };
      }
      
      rutasMap[rutaNombre].garrafones += v.cantidadVendida;
      rutasMap[rutaNombre].ingresos += parseFloat(v.total);
      rutasMap[rutaNombre].ventasRealizadas++;
      rutasMap[rutaNombre].clientes.add(clienteNombre);
    });

    // Procesar ventas saltadas
    ventasSaltadas.forEach(v => {
      const rutaNombre = v.clienteRuta?.diaRuta?.ruta?.nombre || 'Sin Ruta';
      const clienteNombre = v.clienteRuta?.cliente?.representante || 'N/A';
      
      if (!rutasMap[rutaNombre]) {
        rutasMap[rutaNombre] = {
          nombre: rutaNombre,
          garrafones: 0,
          ingresos: 0,
          ventasRealizadas: 0,
          clientesSaltados: 0,
          clientes: new Set()
        };
      }
      
      rutasMap[rutaNombre].clientesSaltados++;
      rutasMap[rutaNombre].clientes.add(clienteNombre);
    });

    // Convertir a array para Excel
    const resumenRutas: any[] = [
      { 
        'Ruta': '🚚 RESUMEN POR RUTA', 
        'Clientes Visitados': '', 
        'Ventas': '',
        'Saltados': '',
        'Garrafones': '', 
        'Ingresos': '' 
      },
      { 'Ruta': '', 'Clientes Visitados': '', 'Ventas': '', 'Saltados': '', 'Garrafones': '', 'Ingresos': '' },
    ];

    // Ordenar rutas por ingresos (de mayor a menor)
    const rutasOrdenadas = Object.values(rutasMap).sort((a, b) => b.ingresos - a.ingresos);

    let totalGeneralGarrafones = 0;
    let totalGeneralIngresos = 0;
    let totalGeneralVentas = 0;
    let totalGeneralSaltados = 0;
    let totalGeneralClientes = 0;

    rutasOrdenadas.forEach(ruta => {
      resumenRutas.push({
        'Ruta': ruta.nombre,
        'Clientes Visitados': ruta.clientes.size,
        'Ventas': ruta.ventasRealizadas,
        'Saltados': ruta.clientesSaltados,
        'Garrafones': ruta.garrafones,
        'Ingresos': `$${ruta.ingresos.toFixed(2)}`
      });

      totalGeneralGarrafones += ruta.garrafones;
      totalGeneralIngresos += ruta.ingresos;
      totalGeneralVentas += ruta.ventasRealizadas;
      totalGeneralSaltados += ruta.clientesSaltados;
      totalGeneralClientes += ruta.clientes.size;
    });

    // Agregar totales
    resumenRutas.push({ 'Ruta': '', 'Clientes Visitados': '', 'Ventas': '', 'Saltados': '', 'Garrafones': '', 'Ingresos': '' });
    resumenRutas.push({
      'Ruta': '📊 TOTAL GENERAL',
      'Clientes Visitados': totalGeneralClientes,
      'Ventas': totalGeneralVentas,
      'Saltados': totalGeneralSaltados,
      'Garrafones': totalGeneralGarrafones,
      'Ingresos': `$${totalGeneralIngresos.toFixed(2)}`
    });

    return resumenRutas;
  }

  /**
   * Elimina ventas antiguas (más de 7 días)
   */
  eliminarVentasAntiguas(): Observable<any> {
    return this.http.delete(`${this.url}/ventas/limpiar-antiguas`);
  }

  // ========================================
  // HELPERS
  // ========================================

  private getInicioSemana(fecha: Date): Date {
    const d = new Date(fecha);
    const dia = d.getDay();
    const diff = d.getDate() - dia + (dia === 0 ? -6 : 1); // Lunes como inicio
    return new Date(d.setDate(diff));
  }

  private getFinSemana(fecha: Date): Date {
    const inicio = this.getInicioSemana(fecha);
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + 6); // Domingo
    fin.setHours(23, 59, 59, 999);
    return fin;
  }

  private formatearFechaArchivo(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private traducirEstado(estado: string): string {
    switch (estado) {
      case 'realizado': return '✅ Realizado';
      case 'saltado': return '⏭️ Saltado';
      case 'pendiente': return '⏳ Pendiente';
      default: return estado;
    }
  }

  /**
   * Verifica si hoy es domingo (día de generar reporte)
   */
  esHoyDomingo(): boolean {
    return new Date().getDay() === 0;
  }

  /**
   * Obtiene la fecha del último domingo
   */
  getUltimoDomingo(): Date {
    const hoy = new Date();
    const dia = hoy.getDay();
    const diff = dia === 0 ? 0 : dia;
    const domingo = new Date(hoy);
    domingo.setDate(hoy.getDate() - diff);
    domingo.setHours(0, 0, 0, 0);
    return domingo;
  }
}