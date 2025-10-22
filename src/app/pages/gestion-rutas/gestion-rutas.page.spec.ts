import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionRutasPage } from './gestion-rutas.page';

describe('GestionRutasPage', () => {
  let component: GestionRutasPage;
  let fixture: ComponentFixture<GestionRutasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionRutasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
