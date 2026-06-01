import { TestBed } from '@angular/core/testing';

import { ShortTermService } from './short-term.service';

describe('ShortTermService', () => {
  let service: ShortTermService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortTermService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
