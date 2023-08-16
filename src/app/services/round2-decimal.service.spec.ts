import { TestBed } from '@angular/core/testing';

import { Round2DecimalService } from './round2-decimal.service';

describe('Round2DecimalService', () => {
  let service: Round2DecimalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Round2DecimalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
