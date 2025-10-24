import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaDomiciliosPage } from './lista-domicilios.page';

describe('ListaDomiciliosPage', () => {
  let component: ListaDomiciliosPage;
  let fixture: ComponentFixture<ListaDomiciliosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaDomiciliosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
