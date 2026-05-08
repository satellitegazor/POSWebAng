import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractFilterDlgComponent } from './contract-filter-dlg.component';

describe('ContractFilterDlgComponent', () => {
  let component: ContractFilterDlgComponent;
  let fixture: ComponentFixture<ContractFilterDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractFilterDlgComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractFilterDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
