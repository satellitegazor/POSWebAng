import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitPayComponent } from './split-pay.component';

describe('SplitPayComponent', () => {
  let component: SplitPayComponent;
  let fixture: ComponentFixture<SplitPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SplitPayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
