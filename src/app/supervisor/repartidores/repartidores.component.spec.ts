import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RepartidoresComponent } from './repartidores.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('RepartidoresComponent', () => {
  let component: RepartidoresComponent;
  let fixture: ComponentFixture<RepartidoresComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RepartidoresComponent, ...IonicSharedComponents]
    }).compileComponents();

    fixture = TestBed.createComponent(RepartidoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
