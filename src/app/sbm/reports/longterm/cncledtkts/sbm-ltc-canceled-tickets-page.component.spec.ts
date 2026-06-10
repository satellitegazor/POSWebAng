import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SbmLtcCanceledTicketsPageComponent } from './sbm-ltc-canceled-tickets-page.component';

describe('SbmLtcCanceledTicketsPageComponent', () => {
  let component: SbmLtcCanceledTicketsPageComponent;
  let fixture: ComponentFixture<SbmLtcCanceledTicketsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SbmLtcCanceledTicketsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SbmLtcCanceledTicketsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
