import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TktSaleItemComponent } from './tkt-sale-item.component';

describe('TktSaleItemComponent', () => {
  let component: TktSaleItemComponent;
  let fixture: ComponentFixture<TktSaleItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TktSaleItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TktSaleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
