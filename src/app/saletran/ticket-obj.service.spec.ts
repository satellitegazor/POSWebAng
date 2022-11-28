import { TestBed } from '@angular/core/testing';
import { TicketObjService } from './ticket-obj.service';

describe('TicketObjService', () => {
  let service: TicketObjService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketObjService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
