import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovTipsModalDlgComponent } from './rov-tips-modal-dlg.component';

describe('TipsModalDlgComponent', () => {
  let component: RovTipsModalDlgComponent;
  let fixture: ComponentFixture<RovTipsModalDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RovTipsModalDlgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovTipsModalDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
