import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovPartPayComponent } from './rov-part-pay.component';

describe('PartPayComponent', () => {
  let component: RovPartPayComponent;
  let fixture: ComponentFixture<RovPartPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovPartPayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovPartPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
