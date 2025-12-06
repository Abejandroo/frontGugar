export interface ClienteConRuta {
  id: number;
  nombre: string;
  negocio: string | null;
  telefono: string;
  cte: number;
  tipoPrecio: {
    id: number;
    tipoCompra: string;
    precioPorGarrafon: number;
  } | null;
  ruta: {
    id: number;
    nombre: string;
    numeroRuta: string;
  } | null;
  diaRuta: {
    id: number;
    diaSemana: string;
  } | null;
}

export interface DiaRutaConClientes {
  id: number;
  diaSemana: string;
  cantidadClientes: number;
  clientes: ClienteConRuta[];
}

export interface RutaConClientes {
  id: number;
  nombre: string;
  numeroRuta: string;
  repartidor: {
    id: number;
    nombre: string;
  } | null;
  supervisor: {
    id: number;
    nombre: string;
  } | null;
  diasRuta: DiaRutaConClientes[];
  totalClientes: number;
}

export interface ClientesAgrupados {
  asignados: RutaConClientes[];
  noAsignados: ClienteConRuta[];
  totalAsignados: number;
  totalNoAsignados: number;
}