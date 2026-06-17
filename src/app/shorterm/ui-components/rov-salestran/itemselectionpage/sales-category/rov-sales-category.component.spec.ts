import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RovSalesCategoryComponent } from './rov-sales-category.component';

describe('SalesCategoryComponent', () => {
  let component: RovSalesCategoryComponent;
  let fixture: ComponentFixture<RovSalesCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RovSalesCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RovSalesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
