import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminNavbarComponent } from './admin-navbar.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('AdminNavbarComponent', () => {
  let component: AdminNavbarComponent;
  let fixture: ComponentFixture<AdminNavbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AdminNavbarComponent,
        ...IonicSharedComponents
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
