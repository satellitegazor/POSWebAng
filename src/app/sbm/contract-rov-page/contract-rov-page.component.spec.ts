import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRovPageComponent } from './contract-rov-page.component';

describe('ContractRovPageComponent', () => {
  let component: ContractRovPageComponent;
  let fixture: ComponentFixture<ContractRovPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractRovPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractRovPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
