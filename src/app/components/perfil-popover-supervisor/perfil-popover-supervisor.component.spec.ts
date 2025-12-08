import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PerfilPopoverSupervisorComponent } from './perfil-popover-supervisor.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('PerfilPopoverSupervisorComponent', () => {
  let component: PerfilPopoverSupervisorComponent;
  let fixture: ComponentFixture<PerfilPopoverSupervisorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PerfilPopoverSupervisorComponent,
        ...IonicSharedComponents
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPopoverSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
