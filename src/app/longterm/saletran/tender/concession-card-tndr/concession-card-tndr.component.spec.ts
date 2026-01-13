import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcessionCardTndrComponent } from './concession-card-tndr.component';

describe('CreditCardTndrComponent', () => {
  let component: ConcessionCardTndrComponent;
  let fixture: ComponentFixture<ConcessionCardTndrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConcessionCardTndrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConcessionCardTndrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
