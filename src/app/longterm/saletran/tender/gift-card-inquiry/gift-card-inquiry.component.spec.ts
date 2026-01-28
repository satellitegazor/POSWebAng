import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCardInquiryComponent } from './gift-card-inquiry.component';

describe('GiftCardInquiryComponent', () => {
  let component: GiftCardInquiryComponent;
  let fixture: ComponentFixture<GiftCardInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftCardInquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftCardInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
