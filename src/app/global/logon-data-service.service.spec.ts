import { TestBed } from '@angular/core/testing';
import { LogonDataService } from './logon-data-service.service';

describe('LogonDataService', () => {
  let service: LogonDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogonDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
