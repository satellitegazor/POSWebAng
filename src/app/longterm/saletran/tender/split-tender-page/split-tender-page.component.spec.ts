import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitTenderPageComponent } from './split-tender-page.component';

describe('SplitTenderPageComponent', () => {
  let component: SplitTenderPageComponent;
  let fixture: ComponentFixture<SplitTenderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitTenderPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitTenderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
