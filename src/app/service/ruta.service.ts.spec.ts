import { TestBed } from '@angular/core/testing';

import { RutaServiceTs } from './ruta.service.ts';

describe('RutaServiceTs', () => {
  let service: RutaServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RutaServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
