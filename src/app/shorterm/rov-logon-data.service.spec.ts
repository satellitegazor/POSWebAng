import { TestBed } from '@angular/core/testing';

import { RovLogonDataService } from './rov-logon-data.service';

describe('RovLogonDataService', () => {
  let service: RovLogonDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RovLogonDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
