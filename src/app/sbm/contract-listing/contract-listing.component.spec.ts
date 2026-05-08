import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractListingComponent } from './contract-listing.component';

describe('ContractListingComponent', () => {
  let component: ContractListingComponent;
  let fixture: ComponentFixture<ContractListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
