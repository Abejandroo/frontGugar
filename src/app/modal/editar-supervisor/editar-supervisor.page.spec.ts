import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarSupervisorPage } from './editar-supervisor.page';

describe('EditarSupervisorPage', () => {
  let component: EditarSupervisorPage;
  let fixture: ComponentFixture<EditarSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
