import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPinDlgComponent } from './reset-pin-dlg.component';

describe('ResetPinDlgComponent', () => {
  let component: ResetPinDlgComponent;
  let fixture: ComponentFixture<ResetPinDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPinDlgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPinDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
