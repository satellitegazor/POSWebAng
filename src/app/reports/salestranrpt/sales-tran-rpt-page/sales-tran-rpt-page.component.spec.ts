import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTranRptPageComponent } from './sales-tran-rpt-page.component';

describe('SalesTranRptPageComponent', () => {
  let component: SalesTranRptPageComponent;
  let fixture: ComponentFixture<SalesTranRptPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesTranRptPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTranRptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
