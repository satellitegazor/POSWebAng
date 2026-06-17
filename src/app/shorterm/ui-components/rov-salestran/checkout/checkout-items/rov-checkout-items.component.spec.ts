import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovCheckoutItemsComponent } from './checkout-items.component';

describe('CheckoutItemsComponent', () => {
  let component: RovCheckoutItemsComponent;
  let fixture: ComponentFixture<RovCheckoutItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovCheckoutItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovCheckoutItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
