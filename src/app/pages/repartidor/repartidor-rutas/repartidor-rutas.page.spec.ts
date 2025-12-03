import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepartidorRutasPage } from './repartidor-rutas.page';

describe('RepartidorRutasPage', () => {
  let component: RepartidorRutasPage;
  let fixture: ComponentFixture<RepartidorRutasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RepartidorRutasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
