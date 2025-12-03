import { TestBed } from '@angular/core/testing';

import { RutaOptimizacionService } from './ruta-optimizacion.service';

describe('RutaOptimizacionService', () => {
  let service: RutaOptimizacionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RutaOptimizacionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
