import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesCategoryComponent } from './sales-category.component';

describe('SalesCategoryComponent', () => {
  let component: SalesCategoryComponent;
  let fixture: ComponentFixture<SalesCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
