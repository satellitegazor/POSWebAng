import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovLogonComponent } from './rov-logon.component';

describe('RovLogonComponent', () => {
  let component: RovLogonComponent;
  let fixture: ComponentFixture<RovLogonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovLogonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovLogonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
