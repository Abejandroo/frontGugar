export interface Domicilio {
  id: number;
  nombreCliente: string;
  esNegocio: boolean;
  nombreNegocio?: string;
  direccion: string;
  precioGarrafon: number;
  cantidadVendida?: number;
  requiereFactura: boolean;
  esCredito: boolean;
  latitud: number;
  longitud: number;
  estado: 'pendiente' | 'realizado' | 'saltado' | 'actual';
  motivoSalto?: string;
  orden: number;
}

export interface VentaRequest {
  domicilioId: number;
  cantidadVendida: number;
  requiereFactura: boolean;
  esCredito: boolean;
  precioUnitario: number;
  total: number;
}

export interface SaltoRequest {
  domicilioId: number;
  motivo: string;
}