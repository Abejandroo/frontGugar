import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OpcionesRutaModalComponent } from './opciones-ruta-modal.component';

describe('OpcionesRutaModalComponent', () => {
  let component: OpcionesRutaModalComponent;
  let fixture: ComponentFixture<OpcionesRutaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [OpcionesRutaModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OpcionesRutaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
