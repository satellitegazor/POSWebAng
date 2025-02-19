import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranDetailsComponent } from './tran-details.component';

describe('TranDetailsComponent', () => {
  let component: TranDetailsComponent;
  let fixture: ComponentFixture<TranDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
