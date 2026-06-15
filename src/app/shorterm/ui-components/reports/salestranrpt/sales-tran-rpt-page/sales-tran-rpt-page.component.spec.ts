import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovSalesTranRptPageComponent } from './sales-tran-rpt-page.component';

describe('SalesTranRptPageComponent', () => {
  let component: RovSalesTranRptPageComponent;
  let fixture: ComponentFixture<RovSalesTranRptPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovSalesTranRptPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovSalesTranRptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
