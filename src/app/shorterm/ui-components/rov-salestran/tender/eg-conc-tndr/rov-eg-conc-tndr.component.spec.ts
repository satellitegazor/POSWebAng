import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovEgConcTndrComponent } from './rov-eg-conc-tndr.component';

describe('EgConcTndrComponent', () => {
  let component: RovEgConcTndrComponent;
  let fixture: ComponentFixture<RovEgConcTndrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovEgConcTndrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovEgConcTndrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
