import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcSettlementReportPageComponent } from './sbm-ltc-settlement-report-page.component';

describe('SbmLtcSettlementReportPageComponent', () => {
  let component: SbmLtcSettlementReportPageComponent;
  let fixture: ComponentFixture<SbmLtcSettlementReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcSettlementReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcSettlementReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
