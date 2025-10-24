import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Domicilio, VentaRequest, SaltoRequest } from '../models/domicilio.models';


@Injectable({
  providedIn: 'root'
})
export class DomicilioService {
  private domiciliosSubject = new BehaviorSubject<Domicilio[]>([]);
  public domicilios$ = this.domiciliosSubject.asObservable();

  // Datos mock
  private domiciliosMock: Domicilio[] = [
    {
      id: 1,
      nombreCliente: 'ANA MARIA CALDERON TORO',
      esNegocio: true,
      nombreNegocio: 'MISCELANEA NASANELY',
      direccion: 'AGENCIA MUNICIPAL DE SAN FELIPE DEL AGUA, HIDALGO 113 MZND LT',
      precioGarrafon: 47,
      requiereFactura: true,
      esCredito: true,
      latitud: 17.0859,
      longitud: -96.7114,
      estado: 'actual',
      orden: 1
    },
    {
      id: 2,
      nombreCliente: 'CREMERIA SOL Y LUNA',
      esNegocio: true,
      nombreNegocio: 'CREMERIA SOL Y LUNA',
      direccion: 'FRACC. COLINAS DE LA SOLEDAD, BOULEVARD LA PAZ 306 MZ. LT',
      precioGarrafon: 47,
      requiereFactura: false,
      esCredito: true,
      latitud: 17.0892,
      longitud: -96.7089,
      estado: 'pendiente',
      orden: 2
    },
    {
      id: 3,
      nombreCliente: 'CREMERIA SOL Y LUNA',
      esNegocio: true,
      nombreNegocio: 'CREMERIA SOL Y LUNA',
      direccion: 'FRACC. COLINAS DE LA SOLEDAD, BOULEVARD LA PAZ 306 MZ. LT',
      precioGarrafon: 47,
      requiereFactura: false,
      esCredito: true,
      latitud: 17.0921,
      longitud: -96.7065,
      estado: 'realizado',
      cantidadVendida: 3,
      orden: 3
    },
    {
      id: 4,
      nombreCliente: 'CREMERIA SOL Y LUNA',
      esNegocio: true,
      nombreNegocio: 'CREMERIA SOL Y LUNA',
      direccion: 'FRACC. COLINAS DE LA SOLEDAD, BOULEVARD LA PAZ 306 MZ. LT',
      precioGarrafon: 47,
      requiereFactura: false,
      esCredito: true,
      latitud: 17.0845,
      longitud: -96.7123,
      estado: 'pendiente',
      orden: 4
    },
    {
      id: 5,
      nombreCliente: 'CREMERIA SOL Y LUNA',
      esNegocio: true,
      nombreNegocio: 'CREMERIA SOL Y LUNA',
      direccion: 'FRACC. COLINAS DE LA SOLEDAD, BOULEVARD LA PAZ 306 MZ. LT',
      precioGarrafon: 47,
      requiereFactura: false,
      esCredito: true,
      latitud: 17.0878,
      longitud: -96.7101,
      estado: 'saltado',
      motivoSalto: 'Cliente no se encontraba',
      orden: 5
    },
    {
      id: 6,
      nombreCliente: 'CREMERIA SOL Y LUNA',
      esNegocio: true,
      nombreNegocio: 'CREMERIA SOL Y LUNA',
      direccion: 'FRACC. COLINAS DE LA SOLEDAD, BOULEVARD LA PAZ 306 MZ. LT',
      precioGarrafon: 47,
      requiereFactura: false,
      esCredito: true,
      latitud: 17.0905,
      longitud: -96.7077,
      estado: 'pendiente',
      orden: 6
    }
  ];

  constructor(private http: HttpClient) {
    this.domiciliosSubject.next(this.domiciliosMock);
  }

  getDomicilios(): Observable<Domicilio[]> {
    // Simula llamada HTTP
    return of(this.domiciliosMock).pipe(delay(500));
  }

  getDomicilioActual(): Observable<Domicilio | null> {
    const actual = this.domiciliosMock.find(d => d.estado === 'actual');
    return of(actual || null).pipe(delay(300));
  }

  realizarVenta(venta: VentaRequest): Observable<any> {
    // Simula llamada al backend
    console.log('Venta realizada:', venta);
    
    // Actualiza el domicilio localmente
    const domicilio = this.domiciliosMock.find(d => d.id === venta.domicilioId);
    if (domicilio) {
      domicilio.estado = 'realizado';
      domicilio.cantidadVendida = venta.cantidadVendida;
      this.moverAlSiguiente();
    }
    
    return of({ success: true, message: 'Venta registrada correctamente' }).pipe(delay(500));
  }

  saltarDomicilio(salto: SaltoRequest): Observable<any> {
    // Simula llamada al backend
    console.log('Domicilio saltado:', salto);
    
    // Actualiza el domicilio localmente
    const domicilio = this.domiciliosMock.find(d => d.id === salto.domicilioId);
    if (domicilio) {
      domicilio.estado = 'saltado';
      domicilio.motivoSalto = salto.motivo;
      this.moverAlSiguiente();
    }
    
    return of({ success: true, message: 'Domicilio saltado' }).pipe(delay(500));
  }

  private moverAlSiguiente() {
    // Encuentra el siguiente pendiente y lo marca como actual
    const siguientePendiente = this.domiciliosMock.find(d => d.estado === 'pendiente');
    if (siguientePendiente) {
      siguientePendiente.estado = 'actual';
    }
    this.domiciliosSubject.next([...this.domiciliosMock]);
  }

  getSiguientesDomicilios(cantidad: number = 3): Observable<Domicilio[]> {
    const pendientes = this.domiciliosMock
      .filter(d => d.estado === 'pendiente')
      .slice(0, cantidad);
    return of(pendientes);
  }
}
