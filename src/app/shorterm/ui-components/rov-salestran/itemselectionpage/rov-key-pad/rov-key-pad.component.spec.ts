import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovKeyPadComponent } from './rov-key-pad.component';

describe('RovKeyPadComponent', () => {
  let component: RovKeyPadComponent;
  let fixture: ComponentFixture<RovKeyPadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovKeyPadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovKeyPadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
