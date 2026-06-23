import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemButtonPageComponent } from './item-button-page.component';

describe('ItemButtonPageComponent', () => {
  let component: ItemButtonPageComponent;
  let fixture: ComponentFixture<ItemButtonPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemButtonPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemButtonPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
