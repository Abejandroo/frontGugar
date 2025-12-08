import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PerfilPopoverComponent } from './perfil-popover.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('PerfilPopoverComponent', () => {
  let component: PerfilPopoverComponent;
  let fixture: ComponentFixture<PerfilPopoverComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        PerfilPopoverComponent,
        ...IonicSharedComponents
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
