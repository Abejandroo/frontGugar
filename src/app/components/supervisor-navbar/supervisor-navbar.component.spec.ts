import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupervisorNavbarComponent } from './supervisor-navbar.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('SupervisorNavbarComponent', () => {
  let component: SupervisorNavbarComponent;
  let fixture: ComponentFixture<SupervisorNavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SupervisorNavbarComponent,
        ...IonicSharedComponents
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SupervisorNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
