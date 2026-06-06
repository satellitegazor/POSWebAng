import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcCashDrawerReportPageComponent } from './cash-drawer-report-page.component';

describe('SbmLtcCashDrawerReportPageComponent', () => {
  let component: SbmLtcCashDrawerReportPageComponent;
  let fixture: ComponentFixture<SbmLtcCashDrawerReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcCashDrawerReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcCashDrawerReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
