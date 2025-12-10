import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenderPageComponent } from './tender-page.component';

describe('TenderPageComponent', () => {
  let component: TenderPageComponent;
  let fixture: ComponentFixture<TenderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TenderPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
