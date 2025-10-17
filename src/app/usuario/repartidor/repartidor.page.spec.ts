import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RepartidorPage } from './repartidor.page';

describe('RepartidorPage', () => {
  let component: RepartidorPage;
  let fixture: ComponentFixture<RepartidorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RepartidorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
