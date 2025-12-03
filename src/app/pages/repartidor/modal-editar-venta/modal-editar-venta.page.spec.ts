import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalEditarVentaPage } from './modal-editar-venta.page';

describe('ModalEditarVentaPage', () => {
  let component: ModalEditarVentaPage;
  let fixture: ComponentFixture<ModalEditarVentaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditarVentaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
