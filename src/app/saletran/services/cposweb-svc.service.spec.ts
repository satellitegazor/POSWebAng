import { TestBed } from '@angular/core/testing';

import { CPOSWebSvcService } from './cposweb-svc.service';

describe('CPOSWebSvcService', () => {
  let service: CPOSWebSvcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CPOSWebSvcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
