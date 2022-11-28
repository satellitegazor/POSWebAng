import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesCartComponent } from './sales-cart.component';

describe('SalesCartComponent', () => {
  let component: SalesCartComponent;
  let fixture: ComponentFixture<SalesCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
