import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EliminarSupervisorPage } from './eliminar-supervisor.page';

describe('EliminarSupervisorPage', () => {
  let component: EliminarSupervisorPage;
  let fixture: ComponentFixture<EliminarSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EliminarSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
