import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceDueComponent } from './balance-due.component';

describe('BalanceDueComponent', () => {
  let component: BalanceDueComponent;
  let fixture: ComponentFixture<BalanceDueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceDueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceDueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
