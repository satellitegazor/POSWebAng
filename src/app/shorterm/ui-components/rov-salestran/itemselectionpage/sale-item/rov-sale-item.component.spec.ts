import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RovSaleItemComponent } from './rov-sale-item.component';

describe('SaleItemComponent', () => {
  let component: RovSaleItemComponent;
  let fixture: ComponentFixture<RovSaleItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RovSaleItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RovSaleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
