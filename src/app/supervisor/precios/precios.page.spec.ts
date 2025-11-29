import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreciosPage } from './precios.page';

describe('PreciosPage', () => {
  let component: PreciosPage;
  let fixture: ComponentFixture<PreciosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreciosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
