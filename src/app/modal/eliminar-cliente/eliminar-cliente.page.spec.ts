import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EliminarClientePage } from './eliminar-cliente.page';

describe('EliminarClientePage', () => {
  let component: EliminarClientePage;
  let fixture: ComponentFixture<EliminarClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
