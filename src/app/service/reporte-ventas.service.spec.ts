import { TestBed } from '@angular/core/testing';

import { ReporteVentasService } from './reporte-ventas.service';

describe('ReporteVentasService', () => {
  let service: ReporteVentasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReporteVentasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
