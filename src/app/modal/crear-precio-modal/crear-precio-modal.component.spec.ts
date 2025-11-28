import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CrearPrecioModalComponent } from './crear-precio-modal.component';

describe('CrearPrecioModalComponent', () => {
  let component: CrearPrecioModalComponent;
  let fixture: ComponentFixture<CrearPrecioModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CrearPrecioModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPrecioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
