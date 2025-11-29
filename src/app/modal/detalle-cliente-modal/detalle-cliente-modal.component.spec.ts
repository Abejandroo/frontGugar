import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DetalleClienteModalComponent } from './detalle-cliente-modal.component';

describe('DetalleClienteModalComponent', () => {
  let component: DetalleClienteModalComponent;
  let fixture: ComponentFixture<DetalleClienteModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DetalleClienteModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleClienteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
