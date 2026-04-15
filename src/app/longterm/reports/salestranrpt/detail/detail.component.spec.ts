import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTranRptDetailComponent } from './detail.component';

describe('DetailComponent', () => {
  let component: SalesTranRptDetailComponent;
  let fixture: ComponentFixture<SalesTranRptDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesTranRptDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTranRptDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
