import { TestBed } from '@angular/core/testing';

import { PinpadService } from './pinpad.service';

describe('PinpadService', () => {
  let service: PinpadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinpadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
