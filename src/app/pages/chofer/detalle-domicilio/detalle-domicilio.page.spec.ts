import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleDomicilioPage } from './detalle-domicilio.page';

describe('DetalleDomicilioPage', () => {
  let component: DetalleDomicilioPage;
  let fixture: ComponentFixture<DetalleDomicilioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleDomicilioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
