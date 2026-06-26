import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovConcessionCardTndrComponent } from './rov-concession-card-tndr.component';

describe('RovConcessionCardTndrComponent', () => {
  let component: RovConcessionCardTndrComponent;
  let fixture: ComponentFixture<RovConcessionCardTndrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovConcessionCardTndrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovConcessionCardTndrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
