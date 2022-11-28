import { TestBed } from '@angular/core/testing';
import { SalesTranService } from './sales-tran.service';

describe('SalesTranService', () => {
  let service: SalesTranService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesTranService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
