import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractLtcPageComponent } from './contract-ltc-page.component';

describe('ContractLtcPageComponent', () => {
  let component: ContractLtcPageComponent;
  let fixture: ComponentFixture<ContractLtcPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractLtcPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractLtcPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
