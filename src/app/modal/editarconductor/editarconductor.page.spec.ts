import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarconductorPage } from './editarconductor.page';

describe('EditarconductorPage', () => {
  let component: EditarconductorPage;
  let fixture: ComponentFixture<EditarconductorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarconductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
