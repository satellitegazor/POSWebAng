import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemButtonSalesItemListComponent } from './item-button-sales-item-list.component';

describe('ItemButtonSalesItemListComponent', () => {
  let component: ItemButtonSalesItemListComponent;
  let fixture: ComponentFixture<ItemButtonSalesItemListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemButtonSalesItemListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemButtonSalesItemListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
