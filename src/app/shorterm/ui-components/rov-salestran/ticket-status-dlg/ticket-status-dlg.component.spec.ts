import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TicketStatusDlgComponent } from './ticket-status-dlg.component';

describe('TicketStatusDlgComponent', () => {
  let component: TicketStatusDlgComponent;
  let fixture: ComponentFixture<TicketStatusDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketStatusDlgComponent],
      providers: [NgbActiveModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketStatusDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
