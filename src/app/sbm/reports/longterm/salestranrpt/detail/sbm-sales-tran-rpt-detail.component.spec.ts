import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmSalesTranRptDetailComponent } from './sbm-sales-tran-rpt-detail.component';

describe('DetailComponent', () => {
  let component: SbmSalesTranRptDetailComponent;
  let fixture: ComponentFixture<SbmSalesTranRptDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SbmSalesTranRptDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmSalesTranRptDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
