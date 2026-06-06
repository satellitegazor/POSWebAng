import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcPriceListRptComponent } from './price-list-rpt.component';

describe('PriceListRptComponent', () => {
  let component: SbmLtcPriceListRptComponent;
  let fixture: ComponentFixture<SbmLtcPriceListRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcPriceListRptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcPriceListRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
