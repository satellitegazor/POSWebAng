import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovCheckoutPageComponent } from './rov-checkout-page.component';

describe('CheckoutPageComponent', () => {
  let component: RovCheckoutPageComponent;
  let fixture: ComponentFixture<RovCheckoutPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovCheckoutPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovCheckoutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
