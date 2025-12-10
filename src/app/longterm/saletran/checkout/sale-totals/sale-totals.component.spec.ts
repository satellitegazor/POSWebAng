import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleTotalsComponent } from './sale-totals.component';

describe('SaleTotalsComponent', () => {
  let component: SaleTotalsComponent;
  let fixture: ComponentFixture<SaleTotalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleTotalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaleTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
