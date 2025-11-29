import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DividirRutaModalComponent } from './dividir-ruta-modal.component';

describe('DividirRutaModalComponent', () => {
  let component: DividirRutaModalComponent;
  let fixture: ComponentFixture<DividirRutaModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DividirRutaModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DividirRutaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
