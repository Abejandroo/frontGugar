import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleRutaPage } from './detalle-ruta.page';

describe('DetalleRutaPage', () => {
  let component: DetalleRutaPage;
  let fixture: ComponentFixture<DetalleRutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleRutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
