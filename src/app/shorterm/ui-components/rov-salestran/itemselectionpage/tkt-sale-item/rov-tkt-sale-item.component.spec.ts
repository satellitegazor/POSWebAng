import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RovTktSaleItemComponent } from './rov-tkt-sale-item.component';

describe('TktSaleItemComponent', () => {
  let component: RovTktSaleItemComponent;
  let fixture: ComponentFixture<RovTktSaleItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RovTktSaleItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RovTktSaleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
