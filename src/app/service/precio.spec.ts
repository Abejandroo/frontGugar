import { TestBed } from '@angular/core/testing';

import { Precio } from './precio';

describe('Precio', () => {
  let service: Precio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Precio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
