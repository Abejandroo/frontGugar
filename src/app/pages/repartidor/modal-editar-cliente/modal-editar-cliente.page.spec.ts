import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalEditarClientePage } from './modal-editar-cliente.page';

describe('ModalEditarClientePage', () => {
  let component: ModalEditarClientePage;
  let fixture: ComponentFixture<ModalEditarClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditarClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
