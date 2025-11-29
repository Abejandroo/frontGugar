// src/app/models/excel-import.model.ts

export interface ClienteImport {
  numeroCliente: string;
  nombreNegocio?: string;
  representante: string;
  colonia: string;
  direccion: string;
  precioGarrafon: number;
  esCredito: boolean;
  requiereFactura: boolean;
  diasVisita: string[]; // Array con un solo elemento: la ruta asignada
  ordenVisita: number;
  latitud?: number;
  longitud?: number;
  codigoPostal?: string;
  ciudad?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  totalRows: number;
  processedRows: number;
  errors: string[];
  warnings: string[];
  rutasCreadas?: number;
  diasRutaCreados?: number;
  clientesCreados?: number;
  detalles?: any;
}