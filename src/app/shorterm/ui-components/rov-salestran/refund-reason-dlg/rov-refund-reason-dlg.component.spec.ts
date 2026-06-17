import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovRefundReasonDlgComponent } from './rov-refund-reason-dlg.component';

describe('RefundReasonDlgComponent', () => {
  let component: RovRefundReasonDlgComponent;
  let fixture: ComponentFixture<RovRefundReasonDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovRefundReasonDlgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovRefundReasonDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
