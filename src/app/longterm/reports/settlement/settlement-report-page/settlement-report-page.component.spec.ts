import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementReportPageComponent } from './settlement-report-page.component';

describe('SettlementReportPageComponent', () => {
  let component: SettlementReportPageComponent;
  let fixture: ComponentFixture<SettlementReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettlementReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
