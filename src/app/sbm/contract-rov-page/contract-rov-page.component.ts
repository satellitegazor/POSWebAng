import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROV_Contract, ROV_Facility } from '../models/contract.models';
import { ROV_ReferenceResultsModel, Vendor } from '../../longterm/models/contract.models';
import { CPOS_RegionCountryCurrencyResultsModel } from '../../longterm/models/region.currency.models';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { ROV_Event } from 'src/app/longterm/models/ticket.list';

@Component({
  selector: 'app-contract-rov-page',
  templateUrl: './contract-rov-page.component.html',
  styleUrls: ['./contract-rov-page.component.css'],
  standalone: false
})
export class ContractRovPageComponent implements OnInit {
  public rovContract: ROV_Contract | null = null;
  private readonly shortDateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US');
  public rovRefList: ROV_ReferenceResultsModel = new ROV_ReferenceResultsModel();
  
  contractStartInput = '';
  contractEndInput = '';
  todayDateIso = new Date().toISOString().split('T')[0];

  @ViewChild('contractStartDatePicker') contractStartDatePickerRef?: ElementRef<HTMLInputElement>;
  @ViewChild('contractEndDatePicker') contractEndDatePickerRef?: ElementRef<HTMLInputElement>;


  constructor(
    private route: ActivatedRoute,
    private sbmWebApiService: SbmWebApiService
  ) {}

  ngOnInit(): void {

    this.sbmWebApiService.getROVReferenceLists(sessionStorage.getItem('sbm_employeeId') || '').subscribe({
      next: result => {
        this.rovRefList = result;
      },
      error: () => {
        // Keep defaults when reference list call fails.
        this.rovRefList = new ROV_ReferenceResultsModel();
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const ctrid = params.get('ctrid');
      const uid = sessionStorage.getItem('sbm_employeeId') || '';
      const contractId = Number(ctrid);

      if (ctrid && uid && !isNaN(contractId) && contractId > 0) {
        this.loadContract(contractId, uid);
        return;
      }

      this.initializeNewContract();
    });
  }

  private loadContract(contractId: number, uid: string): void {
    this.sbmWebApiService.loadROVContract(contractId, uid).subscribe({
      next: result => {
        this.rovContract = result?.contract || new ROV_Contract();
      },
      error: () => {
        this.initializeNewContract();
      }
    });
  }

  private initializeNewContract(): void {
    if ((this.rovContract?.contractUid ?? 0) > 0) {
      return;
    }

    this.rovContract = new ROV_Contract();

    this.rovContract.contractUid = 0;
    this.rovContract.contractStart = new Date();
    this.rovContract.contractEnd = new Date();
    this.rovContract.contractNumber = '';
    this.rovContract.vendorNumber = '';
    this.rovContract.regionCode = 'CON';
    this.rovContract.regionDesc = '';
    this.rovContract.countryCode = '';
    this.rovContract.countryName = '';
    this.rovContract.currencyCode = '';
    this.rovContract.currencyDesc = '';
    this.rovContract.milStarTxnFee = 0;
    this.rovContract.confirmContractTimestamp = new Date();
    this.rovContract.ownerUid = '';
    this.rovContract.ownerFirstName = '';
    this.rovContract.ownerLastName = '';
    this.rovContract.ownerEmail = '';
    this.rovContract.ownerPhone = '';
    this.rovContract.ownerCountryDialCode = '';
    this.rovContract.concessionaire = new Vendor();
    this.rovContract.vendorEPaid = false;
    this.rovContract.chargeToFaciltyNbr = '';
    this.rovContract.regionCountryCurrency = new CPOS_RegionCountryCurrencyResultsModel();
    this.rovContract.hasUpdates = false;
    this.rovContract.hasRemoved = false;
    this.rovContract.isMerged = false;
    this.rovContract.allowTaxExemption = false;
    this.rovContract.applyCouponsAfterTax = false;
    this.rovContract.vendorEPaid = false;
    this.rovContract.facility = new ROV_Facility();
    this.rovContract.facility.contractUid = this.rovContract.contractUid;
    this.rovContract.facility.facilityUid = 0;
    this.rovContract.facility.facilityNumber = '';
    this.rovContract.facility.regionUid = this.rovContract.regionCode;
    this.rovContract.facility.businessFunctionUid = 0;
    this.rovContract.facility.businessCategoryUid = 0;
    this.rovContract.facility.hasUpdates = false;
    const event: ROV_Event = new ROV_Event();
    this.rovContract.facility.events = [event];

    this.sbmWebApiService.getRegionCode().subscribe({
      next: result => {
        const regionCode = result?.cposRegion?.[0]?.regionCode || 'CON';
        if (!this.rovContract ) {
          return;
        }

        this.rovContract.regionCode = regionCode;
        this.rovContract.regionDesc = result?.cposRegion?.[0]?.regionDesc || '';
        this.rovContract.facility.regionUid = regionCode;

        this.sbmWebApiService.getCountryCurrencyCodes(regionCode).subscribe({
          next: countryCurrencyCodes => {
            if (!this.rovContract) {
              return;
            }

            const selectedCountry = countryCurrencyCodes?.cposRegionCountry?.[0];
            const selectedCurrency = countryCurrencyCodes?.cposCurrency?.[0];

            this.rovContract.regionCountryCurrency = countryCurrencyCodes;
            this.rovContract.countryCode = selectedCountry?.countryCode || '';
            this.rovContract.countryName = selectedCountry?.countryName || '';
            this.rovContract.currencyCode = selectedCurrency?.currencyCode || '';
            this.rovContract.currencyDesc = selectedCurrency?.currencyDesc || '';
          }
        });
      }
    });
  }

  public formatDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : this.shortDateFormatter.format(parsed);
  }

  public onBusinessFunctionChange(event: Event): void {
    const selectedValue = Number((event.target as HTMLSelectElement).value || 0);
    if (!this.rovContract ?.facility) {
      return;
    }

    this.rovContract.facility.businessFunctionUid = Number.isFinite(selectedValue) ? selectedValue : 0;
    this.rovContract.facility.hasUpdates = true;
    this.rovContract.hasUpdates = true;
  }

  private getContractDatePicker(field: 'contractStart' | 'contractEnd'): HTMLInputElement | null {
    const picker = field === 'contractStart' ? this.contractStartDatePickerRef : this.contractEndDatePickerRef;
    return picker?.nativeElement || null;
  }

  openContractDatePicker(field: 'contractStart' | 'contractEnd'): void {
    const pickerInput = this.getContractDatePicker(field);
    if (!pickerInput) {
      return;
    }

    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }

    pickerInput.focus();
    pickerInput.click();
  }

  onContractDatePickerChange(field: 'contractStart' | 'contractEnd', event: Event): void {
    const isoValue = (event.target as HTMLInputElement).value;
    if (!this.rovContract) {
      return;
    }

    const parsedDate = this.parseIsoDate(isoValue);
    const formattedDate = parsedDate ? this.formatDateInput(parsedDate) : '';

    if (field === 'contractStart') {
      this.contractStartInput = formattedDate;
      this.rovContract.contractStart = parsedDate as any;
    } else {
      this.contractEndInput = formattedDate;
      this.rovContract.contractEnd = parsedDate as any;
    }

    this.enforceContractDateRange(field);
    this.markObjectUpdated(this.rovContract);
  }


  private enforceContractDateRange(changedField: 'contractStart' | 'contractEnd'): void {
    if (!this.rovContract) {
      return;
    }

    const startDate = this.parseDateInput(this.contractStartInput);
    const endDate = this.parseDateInput(this.contractEndInput);
    if (!startDate || !endDate) {
      return;
    }

    const today = this.parseIsoDate(this.todayDateIso);
    if (today) {
      if (startDate < today) {
        this.contractStartInput = this.formatDateInput(today);
        this.rovContract.contractStart = today as any;
      }

      if (endDate < today) {
        this.contractEndInput = this.formatDateInput(today);
        this.rovContract.contractEnd = today as any;
      }
    }

    const normalizedStart = this.parseDateInput(this.contractStartInput);
    const normalizedEnd = this.parseDateInput(this.contractEndInput);
    if (!normalizedStart || !normalizedEnd) {
      return;
    }

    if (normalizedEnd < normalizedStart) {
      if (changedField === 'contractStart') {
        this.contractEndInput = this.formatDateInput(normalizedStart);
        this.rovContract.contractEnd = normalizedStart as any;
      } else {
        this.contractEndInput = this.formatDateInput(normalizedStart);
        this.rovContract.contractEnd = normalizedStart as any;
      }
    }
  }

  private formatDateInput(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '';
    }

    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private parseDateInput(value: string): Date | null {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    const mmddyyyyMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmedValue);
    if (mmddyyyyMatch) {
      const month = Number(mmddyyyyMatch[1]);
      const day = Number(mmddyyyyMatch[2]);
      const year = Number(mmddyyyyMatch[3]);
      const parsedDate = new Date(year, month - 1, day);

      if (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getDate() === day
      ) {
        return parsedDate;
      }
    }

    const parsedDate = new Date(trimmedValue);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private parseIsoDate(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      return null;
    }

    return parsedDate;
  }

  private toIsoDateString(value: Date | null): string {
    if (!value || isNaN(value.getTime())) {
      return '';
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  markObjectUpdated(target: any): void {
    if (!target || typeof target !== 'object') {
      return;
    }

    if ('hasUpdates' in target) {
      target.hasUpdates = true;
    }

    if (this.rovContract && target !== this.rovContract && 'hasUpdates' in this.rovContract) {
      this.rovContract.hasUpdates = true;
    }
  }
  getContractDatePickerValue(field: 'contractStart' | 'contractEnd'): string {
    const value = field === 'contractStart' ? this.contractStartInput : this.contractEndInput;
    const parsedDate = this.parseDateInput(value);
    return this.toIsoDateString(parsedDate);
  }


  get contractStartMinDateIso(): string {
    return this.todayDateIso;
  }

  get contractEndMinDateIso(): string {
    const startDate = this.parseDateInput(this.contractStartInput);
    const startDateIso = this.toIsoDateString(startDate);
    if (!startDateIso) {
      return this.todayDateIso;
    }

    return startDateIso > this.todayDateIso ? startDateIso : this.todayDateIso;
  }

}
