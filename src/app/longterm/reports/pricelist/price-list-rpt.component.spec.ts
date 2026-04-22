import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListRptComponent } from './price-list-rpt.component';

describe('PriceListRptComponent', () => {
  let component: PriceListRptComponent;
  let fixture: ComponentFixture<PriceListRptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceListRptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceListRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
