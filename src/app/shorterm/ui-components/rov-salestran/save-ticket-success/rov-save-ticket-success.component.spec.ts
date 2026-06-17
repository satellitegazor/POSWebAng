import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovSaveTicketSuccessComponent } from './rov-save-ticket-success.component';

describe('SaveTicketSuccessComponent', () => {
  let component: RovSaveTicketSuccessComponent;
  let fixture: ComponentFixture<RovSaveTicketSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovSaveTicketSuccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovSaveTicketSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
