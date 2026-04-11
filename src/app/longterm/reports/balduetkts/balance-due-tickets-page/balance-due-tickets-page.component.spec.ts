import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceDueTicketsPageComponent } from './balance-due-tickets-page.component';

describe('BalanceDueTicketsPageComponent', () => {
  let component: BalanceDueTicketsPageComponent;
  let fixture: ComponentFixture<BalanceDueTicketsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceDueTicketsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceDueTicketsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
