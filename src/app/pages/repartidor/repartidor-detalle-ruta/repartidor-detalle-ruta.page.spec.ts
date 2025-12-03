import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepartidorDetalleRutaPage } from './repartidor-detalle-ruta.page';

describe('RepartidorDetalleRutaPage', () => {
  let component: RepartidorDetalleRutaPage;
  let fixture: ComponentFixture<RepartidorDetalleRutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RepartidorDetalleRutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
