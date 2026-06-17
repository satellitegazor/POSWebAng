import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovBalanceDueComponent } from './rov-balance-due.component';

describe('BalanceDueComponent', () => {
  let component: RovBalanceDueComponent;
  let fixture: ComponentFixture<RovBalanceDueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovBalanceDueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovBalanceDueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
