import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemButtonDeptListComponent } from './item-button-dept-list.component';

describe('ItemButtonDeptListComponent', () => {
  let component: ItemButtonDeptListComponent;
  let fixture: ComponentFixture<ItemButtonDeptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemButtonDeptListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemButtonDeptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
