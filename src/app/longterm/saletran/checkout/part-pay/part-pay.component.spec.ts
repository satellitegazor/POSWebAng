import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartPayComponent } from './part-pay.component';

describe('PartPayComponent', () => {
  let component: PartPayComponent;
  let fixture: ComponentFixture<PartPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartPayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
