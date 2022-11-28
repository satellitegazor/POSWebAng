import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorLTComponent } from './vendorlt.component';

describe('VendorLTComponent', () => {
  let component: VendorLTComponent;
  let fixture: ComponentFixture<VendorLTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorLTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorLTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
