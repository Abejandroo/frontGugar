import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RutasComponent } from './rutas.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('RutasComponent', () => {
  let component: RutasComponent;
  let fixture: ComponentFixture<RutasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RutasComponent, ...IonicSharedComponents]
    }).compileComponents();

    fixture = TestBed.createComponent(RutasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
