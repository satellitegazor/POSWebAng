import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipHandlingComponent } from './ship-handling.component';

describe('ShipHandlingComponent', () => {
  let component: ShipHandlingComponent;
  let fixture: ComponentFixture<ShipHandlingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipHandlingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
