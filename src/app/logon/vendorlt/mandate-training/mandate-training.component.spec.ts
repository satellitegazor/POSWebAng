import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandateTrainingComponent } from './mandate-training.component';

describe('MandateTrainingComponent', () => {
  let component: MandateTrainingComponent;
  let fixture: ComponentFixture<MandateTrainingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MandateTrainingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MandateTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
