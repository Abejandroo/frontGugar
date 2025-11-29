import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalTodosClientesPage } from './modal-todos-clientes.page';

describe('ModalTodosClientesPage', () => {
  let component: ModalTodosClientesPage;
  let fixture: ComponentFixture<ModalTodosClientesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTodosClientesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
