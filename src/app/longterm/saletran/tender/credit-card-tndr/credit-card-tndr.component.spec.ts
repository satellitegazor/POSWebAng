import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditCardTndrComponent } from './credit-card-tndr.component';

describe('CreditCardTndrComponent', () => {
  let component: CreditCardTndrComponent;
  let fixture: ComponentFixture<CreditCardTndrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditCardTndrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditCardTndrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
