import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanceledTicketsPageComponent } from './canceled-tickets-page.component';

describe('CanceledTicketsPageComponent', () => {
  let component: CanceledTicketsPageComponent;
  let fixture: ComponentFixture<CanceledTicketsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanceledTicketsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanceledTicketsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
