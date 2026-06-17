import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RovAddMiscItemDlgComponent } from './rov-add-misc-item-dlg.component';

describe('AddMiscItemDlgComponent', () => {
  let component: RovAddMiscItemDlgComponent;
  let fixture: ComponentFixture<RovAddMiscItemDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovAddMiscItemDlgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovAddMiscItemDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
