import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSelectionBasePageComponent } from './item-selection-base-page.component';

describe('SalesCartComponent', () => {
  let component: ItemSelectionBasePageComponent;
  let fixture: ComponentFixture<ItemSelectionBasePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSelectionBasePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSelectionBasePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
