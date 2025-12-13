import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemButtonSalesCatListComponent } from './item-button-sales-cat-list.component';

describe('ItemButtonSalesCatListComponent', () => {
  let component: ItemButtonSalesCatListComponent;
  let fixture: ComponentFixture<ItemButtonSalesCatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemButtonSalesCatListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemButtonSalesCatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
