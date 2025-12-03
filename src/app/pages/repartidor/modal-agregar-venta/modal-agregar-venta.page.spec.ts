import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalAgregarVentaPage } from './modal-agregar-venta.page';

describe('ModalAgregarVentaPage', () => {
  let component: ModalAgregarVentaPage;
  let fixture: ComponentFixture<ModalAgregarVentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAgregarVentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
