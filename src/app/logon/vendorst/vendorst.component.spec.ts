import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorSTComponent } from './vendorst.component';

describe('VendorstComponent', () => {
  let component: VendorSTComponent;
  let fixture: ComponentFixture<VendorSTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorSTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorSTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
