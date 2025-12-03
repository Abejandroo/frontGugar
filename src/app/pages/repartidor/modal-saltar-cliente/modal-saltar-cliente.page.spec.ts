import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalSaltarClientePage } from './modal-saltar-cliente.page';

describe('ModalSaltarClientePage', () => {
  let component: ModalSaltarClientePage;
  let fixture: ComponentFixture<ModalSaltarClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSaltarClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
