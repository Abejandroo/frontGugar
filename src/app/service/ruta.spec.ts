import { TestBed } from '@angular/core/testing';

import { Ruta } from './ruta';

describe('Ruta', () => {
  let service: Ruta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ruta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
