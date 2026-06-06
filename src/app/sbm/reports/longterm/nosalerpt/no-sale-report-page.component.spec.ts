import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcNoSaleReportPageComponent } from './no-sale-report-page.component';

describe('SbmLtcNoSaleReportPageComponent', () => {
  let component: SbmLtcNoSaleReportPageComponent;
  let fixture: ComponentFixture<SbmLtcNoSaleReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcNoSaleReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcNoSaleReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
