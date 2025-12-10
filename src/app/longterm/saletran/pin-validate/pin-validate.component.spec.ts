import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinValidateComponent } from './pin-validate.component';

describe('PinValidateComponent', () => {
  let component: PinValidateComponent;
  let fixture: ComponentFixture<PinValidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinValidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
