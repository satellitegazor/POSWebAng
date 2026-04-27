import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing'; 

import { CustomerNewComponent } from './customer-new.component';

describe('CustomerNewComponent', () => {
  let component: CustomerNewComponent;
  let fixture: ComponentFixture<CustomerNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
