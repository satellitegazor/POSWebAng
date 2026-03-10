import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMiscItemDlgComponent } from './add-misc-item-dlg.component';

describe('AddMiscItemDlgComponent', () => {
  let component: AddMiscItemDlgComponent;
  let fixture: ComponentFixture<AddMiscItemDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMiscItemDlgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMiscItemDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
