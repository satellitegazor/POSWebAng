import { TestBed } from '@angular/core/testing';

import { SbmWebApiService } from './sbm-web-api.service';

describe('SbmWebApiService', () => {
  let service: SbmWebApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SbmWebApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
