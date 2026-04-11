import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoSaleReportPageComponent } from './no-sale-report-page.component';

describe('NoSaleReportPageComponent', () => {
  let component: NoSaleReportPageComponent;
  let fixture: ComponentFixture<NoSaleReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoSaleReportPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoSaleReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
