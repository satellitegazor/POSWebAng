import { TestBed } from '@angular/core/testing';

import { RedeeemGiftCardTndrsService } from './redeeem-gift-card-tndrs.service';

describe('RedeeemGiftCardTndrsService', () => {
  let service: RedeeemGiftCardTndrsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedeeemGiftCardTndrsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
