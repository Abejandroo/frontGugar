export interface ExcelRowData {
  vis: string;
  rec: number;
  colonia: string;
  direccion: string;
  representante: string;
  negocio: string;
  precio: number;
  credito: string;
  factura: string;
  numeroCte: string;
}

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
  diasVisita: string[];
  ordenVisita: number;
  supervisor: string;
  latitud?: number;    // ← AGREGAR
  longitud?: number;   // ← AGREGAR
}

export interface ImportResult {
  success: boolean;
  message: string;
  totalRows: number;
  processedRows: number;
  errors: string[];
  warnings: string[];
}