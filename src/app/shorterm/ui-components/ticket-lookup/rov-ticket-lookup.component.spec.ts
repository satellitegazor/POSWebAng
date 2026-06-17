import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import { TicketLookupComponent } from './ticket-lookup.component';
import { PosApiService } from '../services/pos-api-service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';

describe('TicketLookupComponent', () => {
  let component: TicketLookupComponent;
  let fixture: ComponentFixture<TicketLookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketLookupComponent ],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: NgbModal, useValue: { dismissAll: jasmine.createSpy('dismissAll') } },
        { provide: PosApiService, useValue: {} },
        {
          provide: LogonDataService,
          useValue: {
            getLocationConfig: () => ({ locationName: 'Test', individualUID: 1 }),
            getLocationId: () => 1
          }
        },
        { provide: Store, useValue: { dispatch: jasmine.createSpy('dispatch') } },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketLookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
