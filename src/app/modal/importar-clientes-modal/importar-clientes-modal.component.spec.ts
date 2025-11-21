import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImportarClientesModalComponent } from './importar-clientes-modal.component';

describe('ImportarClientesModalComponent', () => {
  let component: ImportarClientesModalComponent;
  let fixture: ComponentFixture<ImportarClientesModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ImportarClientesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportarClientesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
