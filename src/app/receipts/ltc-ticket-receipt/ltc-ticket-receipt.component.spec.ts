import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LtcTicketReceiptComponent } from './ltc-ticket-receipt.component';

describe('LtcTicketReceiptComponent', () => {
  let component: LtcTicketReceiptComponent;
  let fixture: ComponentFixture<LtcTicketReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LtcTicketReceiptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LtcTicketReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
