import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarrutaPage } from './agregarruta.page';

describe('AgregarrutaPage', () => {
  let component: AgregarrutaPage;
  let fixture: ComponentFixture<AgregarrutaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarrutaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
