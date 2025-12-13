import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableButtonComponent } from './editable-button.component';

describe('EditableButtonComponent', () => {
  let component: EditableButtonComponent;
  let fixture: ComponentFixture<EditableButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditableButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
