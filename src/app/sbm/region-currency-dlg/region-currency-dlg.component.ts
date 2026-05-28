import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CPOS_Currency,
  CPOS_RegionCountry,
  CPOS_RegionCountryCurrencyResultsModel
} from '../../longterm/models/region.currency.models';
import { SbmWebApiService } from '../services/sbm-web-api.service';

export interface RegionCurrencySelectionResult {
  regionCode: string;
  countryCode: string;
  currencyCode: string;
}

@Component({
  selector: 'app-region-currency-dlg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './region-currency-dlg.component.html',
  styleUrl: './region-currency-dlg.component.css'
})
export class RegionCurrencyDlgComponent implements OnInit {
  regionCode: string = '';
  regionCountries: CPOS_RegionCountry[] = [];
  currencies: CPOS_Currency[] = [];
  selectedCountryCode: string = '';
  selectedCurrencyCode: string = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    public activeModal: NgbActiveModal,
    private sbmWebApiService: SbmWebApiService
  ) {}

  ngOnInit(): void {
    this.loadRegionAndCurrencies();
  }

  get filteredCurrencies(): CPOS_Currency[] {
    if (!this.selectedCountryCode) {
      return this.currencies;
    }

    return this.currencies.filter(currency => currency.regionCode === this.selectedCountryCode);
  }

  onCountryChange(): void {
    const firstCurrency = this.filteredCurrencies[0];
    this.selectedCurrencyCode = firstCurrency?.currencyCode || '';
  }

  ok(): void {
    if (!this.regionCode || !this.selectedCurrencyCode) {
      return;
    }

    this.activeModal.close({
      regionCode: this.regionCode,
      countryCode: this.selectedCountryCode,
      currencyCode: this.selectedCurrencyCode
    } as RegionCurrencySelectionResult);
  }

  cancel(): void {
    this.activeModal.dismiss('cancelled');
  }

  private loadRegionAndCurrencies(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.sbmWebApiService.getRegionCode().subscribe({
      next: regionResult => {
        this.regionCode = String(regionResult?.cposRegion[0].regionCode || '').trim();

        if (!this.regionCode) {
          this.isLoading = false;
          this.errorMessage = 'Region code is not available.';
          return;
        }

        this.sbmWebApiService.getCountryCurrencyCodes(this.regionCode).subscribe({
          next: (result: CPOS_RegionCountryCurrencyResultsModel) => {
            this.regionCountries = result?.cposRegionCountry || [];
            this.currencies = result?.cposCurrency || [];
            this.selectedCountryCode = this.regionCountries[0]?.countryCode || '';
            this.selectedCurrencyCode = this.filteredCurrencies[0]?.currencyCode || '';
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Unable to load currencies for the selected region.';
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to load region code.';
      }
    });
  }

}
