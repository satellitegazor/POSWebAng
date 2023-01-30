import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipsModalDlgComponent } from './tips-modal-dlg.component';

describe('TipsModalDlgComponent', () => {
  let component: TipsModalDlgComponent;
  let fixture: ComponentFixture<TipsModalDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipsModalDlgComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipsModalDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
