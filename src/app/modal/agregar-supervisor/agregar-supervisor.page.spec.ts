import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarSupervisorPage } from './agregar-supervisor.page';

describe('AgregarSupervisorPage', () => {
  let component: AgregarSupervisorPage;
  let fixture: ComponentFixture<AgregarSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
