import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovGiftCardInquiryComponent } from './rov-gift-card-inquiry.component';

describe('GiftCardInquiryComponent', () => {
  let component: RovGiftCardInquiryComponent;
  let fixture: ComponentFixture<RovGiftCardInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovGiftCardInquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovGiftCardInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
