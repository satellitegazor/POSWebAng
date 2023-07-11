import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalestranComponent } from './salestran.component';

describe('SalestranComponent', () => {
  let component: SalestranComponent;
  let fixture: ComponentFixture<SalestranComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalestranComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalestranComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
