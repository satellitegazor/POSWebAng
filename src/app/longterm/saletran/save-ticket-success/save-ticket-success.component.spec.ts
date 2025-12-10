import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveTicketSuccessComponent } from './save-ticket-success.component';

describe('SaveTicketSuccessComponent', () => {
  let component: SaveTicketSuccessComponent;
  let fixture: ComponentFixture<SaveTicketSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveTicketSuccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveTicketSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
