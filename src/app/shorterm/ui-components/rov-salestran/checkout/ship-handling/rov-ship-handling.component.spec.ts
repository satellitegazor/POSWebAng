import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovShipHandlingComponent } from './rov-ship-handling.component';

describe('ShipHandlingComponent', () => {
  let component: RovShipHandlingComponent;
  let fixture: ComponentFixture<RovShipHandlingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovShipHandlingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovShipHandlingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
