import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TktReceiptComponent } from './tkt-receipt.component';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { PosApiService } from '../../saletran/services/pos-api-service';

describe('TktReceiptComponent', () => {
  let component: TktReceiptComponent;
  let fixture: ComponentFixture<TktReceiptComponent>;

  const posApiServiceStub = {
    getSingleTransaction: jasmine.createSpy('getSingleTransaction').and.returnValue(
      of({
        ticket: {},
        SignatureData: {}
      })
    )
  };

  const logonDataServiceStub = {
    getLocationConfig: jasmine.createSpy('getLocationConfig').and.returnValue({
      individualUID: 1
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TktReceiptComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        },
        {
          provide: PosApiService,
          useValue: posApiServiceStub
        },
        {
          provide: LogonDataService,
          useValue: logonDataServiceStub
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TktReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
