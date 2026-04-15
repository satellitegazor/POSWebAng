import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTranRptSummaryComponent } from './summary.component';

describe('SummaryComponent', () => {
  let component: SalesTranRptSummaryComponent;
  let fixture: ComponentFixture<SalesTranRptSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesTranRptSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTranRptSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
