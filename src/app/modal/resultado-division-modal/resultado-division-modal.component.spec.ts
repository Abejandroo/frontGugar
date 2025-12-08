import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ResultadoDivisionModalComponent } from './resultado-division-modal.component';
import { IonicSharedComponents } from 'src/app/ionic-standalone-imports';

describe('ResultadoDivisionModalComponent', () => {
  let component: ResultadoDivisionModalComponent;
  let fixture: ComponentFixture<ResultadoDivisionModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResultadoDivisionModalComponent,
        ...IonicSharedComponents
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResultadoDivisionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
