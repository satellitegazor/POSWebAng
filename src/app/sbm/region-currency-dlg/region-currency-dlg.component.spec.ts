import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { RegionCurrencyDlgComponent } from './region-currency-dlg.component';
import { SbmWebApiService } from '../services/sbm-web-api.service';

describe('RegionCurrencyDlgComponent', () => {
  let component: RegionCurrencyDlgComponent;
  let fixture: ComponentFixture<RegionCurrencyDlgComponent>;

  beforeEach(async () => {
    const sbmWebApiServiceMock = {
      getRegionCode: () => of({ regionCode: 'CON' }),
      getCountryCurrencyCodes: () =>
        of({
          cposRegionCountry: [],
          cposCurrency: [{ currencyCode: 'USD', currencyDesc: 'US Dollar' }]
        })
    };

    await TestBed.configureTestingModule({
      imports: [RegionCurrencyDlgComponent],
      providers: [
        NgbActiveModal,
        { provide: SbmWebApiService, useValue: sbmWebApiServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegionCurrencyDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
