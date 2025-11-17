import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ModificarrutaPage } from './modificarruta.page';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

class ModalControllerMock {
  dismiss = jasmine.createSpy('dismiss');
}

class AlertMock {
  present = jasmine.createSpy('present');
}

class AlertControllerMock {
  create = jasmine.createSpy('create').and.callFake((_cfg: any) => Promise.resolve(new AlertMock()));
}

class ToastMock {
  present = jasmine.createSpy('present');
}

class ToastControllerMock {
  create = jasmine.createSpy('create').and.callFake((_cfg: any) => Promise.resolve(new ToastMock()));
}

describe('ModificarrutaPage', () => {
  let component: ModificarrutaPage;
  let fixture: ComponentFixture<ModificarrutaPage>;
  let httpMock: HttpTestingController;
  let toastCtrl: ToastControllerMock;

  beforeEach(() => {
    toastCtrl = new ToastControllerMock();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: ModalController, useClass: ModalControllerMock },
        { provide: AlertController, useClass: AlertControllerMock },
        { provide: ToastController, useValue: toastCtrl },
      ]
    });

    fixture = TestBed.createComponent(ModificarrutaPage);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Initial grupos load from constructor
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load grupos on init and patch form when grupoCarreraId set', fakeAsync(() => {
    component.grupoCarreraId = 5;

    // The first detectChanges in beforeEach already triggered loadGrupos; flush it
    const req = httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/getAll');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 5, name: 'G1' }, { id: 7, name: 'G2' }]);

    tick();

    expect(component.grupos.length).toBe(2);
    expect(component.eliminarForm.get('grupoCarreraId')?.value).toBe(5);
  }));

  it('should show error toast when loadGrupos fails', fakeAsync(() => {
    const req = httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/getAll');
    req.flush('err', { status: 500, statusText: 'Server Error' });

    tick();

    expect((toastCtrl.create as any).calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      color: 'danger'
    }));
  }));

  it('should update form on grupo change', () => {
    component.grupos = [{ id: 10 }, { id: 12 }];
    component.onGrupoChange({ detail: { value: 12 } });
    expect(component.eliminarForm.get('grupoCarreraId')?.value).toBe(12);
  });

  it('should call delete and reload on eliminarGrupo success', fakeAsync(() => {
    // First request is from constructor load
    httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/getAll').flush([]);

    component.eliminarGrupo(99);

    const del = httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/delete/99');
    expect(del.request.method).toBe('DELETE');
    del.flush({});

    // After success, loadGrupos is called again
    const reload = httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/getAll');
    reload.flush([]);

    tick();

    expect((toastCtrl.create as any).calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      color: 'success'
    }));
  }));

  it('should show error toast on eliminarGrupo error', fakeAsync(() => {
    // Flush initial load
    httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/getAll').flush([]);

    component.eliminarGrupo(123);

    const del = httpMock.expectOne('https://backescolar-production.up.railway.app/grupos/delete/123');
    del.flush('err', { status: 400, statusText: 'Bad Request' });

    tick();

    expect((toastCtrl.create as any).calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      color: 'danger'
    }));
  }));
});
