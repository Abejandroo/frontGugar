import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ClientesComponent } from './clientes.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ClientesComponent,...IonicSharedComponents]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
