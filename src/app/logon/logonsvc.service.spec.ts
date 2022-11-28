import { TestBed } from '@angular/core/testing';
import { LogonSvc } from './logonsvc.service';

describe('LogonsvcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LogonSvc = TestBed.get(LogonSvc);
    expect(service).toBeTruthy();
  });
});
