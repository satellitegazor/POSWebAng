import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundReasonDlgComponent } from './refund-reason-dlg.component';

describe('RefundReasonDlgComponent', () => {
  let component: RefundReasonDlgComponent;
  let fixture: ComponentFixture<RefundReasonDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundReasonDlgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefundReasonDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
