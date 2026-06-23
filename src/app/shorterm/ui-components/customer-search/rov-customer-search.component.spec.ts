import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';


import { CustomerSearchComponent } from './customer-search.component';
import { PosApiService } from '../services/pos-api-service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';

describe('CustomerSearchComponent', () => {
  let component: CustomerSearchComponent;
  let fixture: ComponentFixture<CustomerSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerSearchComponent ],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: { dismissAll: jasmine.createSpy('dismissAll') } },
        { provide: PosApiService, useValue: {} },
        { provide: Store, useValue: { dispatch: jasmine.createSpy('dispatch') } },
        { provide: LogonDataService, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
