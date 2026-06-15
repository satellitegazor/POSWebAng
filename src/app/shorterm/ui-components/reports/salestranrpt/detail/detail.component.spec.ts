import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovSalesTranRptDetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: RovSalesTranRptDetailComponent;
  let fixture: ComponentFixture<RovSalesTranRptDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovSalesTranRptDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovSalesTranRptDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
