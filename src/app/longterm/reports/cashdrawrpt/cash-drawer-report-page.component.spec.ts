import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDrawerReportPageComponent } from './cash-drawer-report-page.component';

describe('CashDrawerReportPageComponent', () => {
  let component: CashDrawerReportPageComponent;
  let fixture: ComponentFixture<CashDrawerReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashDrawerReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashDrawerReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
