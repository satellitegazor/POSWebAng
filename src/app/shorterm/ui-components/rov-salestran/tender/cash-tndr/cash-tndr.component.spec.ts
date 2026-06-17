import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashTndrComponent } from './cash-tndr.component';

describe('CashTndrComponent', () => {
  let component: CashTndrComponent;
  let fixture: ComponentFixture<CashTndrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashTndrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashTndrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
