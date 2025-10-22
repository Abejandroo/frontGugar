import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SupervisoresPage } from './supervisores.page';

describe('SupervisoresPage', () => {
  let component: SupervisoresPage;
  let fixture: ComponentFixture<SupervisoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
