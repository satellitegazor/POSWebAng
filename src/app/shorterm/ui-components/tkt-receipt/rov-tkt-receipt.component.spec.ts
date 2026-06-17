import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { RovTktReceiptComponent } from './rov-tkt-receipt.component';
import { RovLogonDataService } from '../../rov-logon-data.service';
import { RovApiService } from '../../short-term.service';

describe('TktReceiptComponent', () => {
  let component: RovTktReceiptComponent;
  let fixture: ComponentFixture<RovTktReceiptComponent>;

  const posApiServiceStub = {
    getSingleTransaction: jasmine.createSpy('getSingleTransaction').and.returnValue(
      of({
        ticket: {},
        SignatureData: {}
      })
    )
  };

  const logonDataServiceStub = {
    getRovEventConfig: jasmine.createSpy('getRovEventConfig').and.returnValue({
      individualUID: 1,
      eventID: 1
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RovTktReceiptComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        },
        {
          provide: RovApiService,
          useValue: posApiServiceStub
        },
        {
          provide: RovLogonDataService,
          useValue: logonDataServiceStub
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RovTktReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
