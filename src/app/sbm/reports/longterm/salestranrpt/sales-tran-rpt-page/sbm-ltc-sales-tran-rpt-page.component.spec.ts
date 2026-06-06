import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcSalesTranRptPageComponent } from './sbm-ltc-sales-tran-rpt-page.component';

describe('SbmLtcSalesTranRptPageComponent', () => {
  let component: SbmLtcSalesTranRptPageComponent;
  let fixture: ComponentFixture<SbmLtcSalesTranRptPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcSalesTranRptPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcSalesTranRptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
