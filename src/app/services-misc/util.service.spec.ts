import { TestBed } from '@angular/core/testing';

import { UtilService } from './util.service';

describe('UtilService', () => {
  let service: UtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 0 for midnight', () => {
    const date = new Date(2026, 0, 1, 0, 0, 0, 0);
    expect(service.getUniqueNumberForDay(date)).toBe(0);
  });

  it('should return unique minute index for a time', () => {
    const date = new Date(2026, 0, 1, 13, 27, 0, 0);
    expect(service.getUniqueNumberForDay(date)).toBe(807);
  });

  it('should return 1439 for 23:59', () => {
    const date = new Date(2026, 0, 1, 23, 59, 0, 0);
    expect(service.getUniqueNumberForDay(date)).toBe(1439);
  });
});
