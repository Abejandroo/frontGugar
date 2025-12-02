import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonitoreoRutaPage } from './monitoreo-ruta.page';

describe('MonitoreoRutaPage', () => {
  let component: MonitoreoRutaPage;
  let fixture: ComponentFixture<MonitoreoRutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoreoRutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
