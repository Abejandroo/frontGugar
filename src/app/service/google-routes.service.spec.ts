import { TestBed } from '@angular/core/testing';

import { GoogleRoutesService } from './google-routes.service';

describe('GoogleRoutesService', () => {
  let service: GoogleRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
