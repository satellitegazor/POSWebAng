import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ROV_Contract, ROV_Facility } from '../models/contract.models';
import { ROV_DepartmentType, ROV_ReferenceResultsModel, Vendor } from '../../longterm/models/contract.models';
import { CPOS_RegionCountryCurrencyResultsModel } from '../../longterm/models/region.currency.models';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { ROV_Department, ROV_Event, ROV_Individual } from '../../longterm/models/ticket.list';
import { NgForm } from '@angular/forms';
import { FacilityModel } from '../../longterm/models/store.location';
import { ToastService } from '../../services/toast.service';
import { UtilService } from '../../services/util.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-contract-rov-page',
  templateUrl: './contract-rov-page.component.html',
  styleUrls: ['./contract-rov-page.component.css'],
  standalone: false
})
export class ContractRovPageComponent implements OnInit {

  public rovContract: ROV_Contract | null = null;
  private readonly shortDateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US');
  private readonly eventsPageSize = 5;
  public currentEventsPage = 0;
  public rovReferenceData: ROV_ReferenceResultsModel = new ROV_ReferenceResultsModel();
  
  selectedDepartmentTypeUIDs = new Set<number>();
  departmentPopupEvent: ROV_Event | null = null;
  departmentPopupDepartments: ROV_DepartmentType[] = [];
  departmentPopupFacility: ROV_Facility | null = null;    
  contractStartInput = '';
  contractEndInput = '';
  todayDateIso = new Date().toISOString().split('T')[0];
  public vendorName: string = '';

  @ViewChild('contractForm') contractFormRef?: NgForm;
  @ViewChild('contractStartDatePicker') contractStartDatePickerRef?: ElementRef<HTMLInputElement>;
  @ViewChild('contractEndDatePicker') contractEndDatePickerRef?: ElementRef<HTMLInputElement>;


  constructor(
    private route: ActivatedRoute,
    private sbmWebApiService: SbmWebApiService,
    private router: Router,
    private toastSvc: ToastService,
    private utilSvc: UtilService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {

    this.sbmWebApiService.getROVReferenceLists(sessionStorage.getItem('sbm_employeeId') || '').subscribe({
      next: result => {
        this.rovReferenceData = result;
      },
      error: () => {
        // Keep defaults when reference list call fails.
        this.rovReferenceData = new ROV_ReferenceResultsModel();
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
        this.normalizeLoadedContractData();
        this.syncDateInputs();
        this.currentEventsPage = 0;
        this.onVendorLookupClick(this.rovContract.vendorNumber);
        this.onFacilityLookupClick(this.rovContract.facility, this.rovContract.facility.facilityNumber || '');
        this.initalizeExchRegion();
      },
      error: () => {
        this.initializeNewContract();
        
        this.syncDateInputs();
      }
    });
  }

  private initalizeExchRegion(): void {
    if (!this.rovContract) {
      return;
    }
    this.sbmWebApiService.getRegionCode().subscribe({
      next: result => {
        const regionCode = result?.cposRegion?.[0]?.regionCode || 'CR';
        if (!this.rovContract) {
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
            this.rovContract.facility.regionUid = selectedCountry.regionCode;

            this.rovContract.facility.events.forEach(e => {
              e.exchRegion = regionCode;
              e.countryCode = selectedCountry?.countryCode || '';
            });
          }
        });
      }
    });
  }
  private initializeNewContract(): void {

    this.rovContract = new ROV_Contract();
    this.initalizeExchRegion();

    this.rovContract.contractUID = 0;
    this.rovContract.contractStart = {} as Date;
    this.rovContract.contractEnd = {} as Date;
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
    
    this.rovContract.facility = new ROV_Facility();
    this.rovContract.facility.contractUid = this.rovContract.contractUID;
    this.rovContract.facility.facilityUid = 0;
    this.rovContract.facility.facilityNumber = '';
    this.rovContract.facility.regionUid = this.rovContract.regionCode;
    this.rovContract.facility.businessFunctionUid = 0;
    this.rovContract.facility.businessCategoryUid = 0;
    this.rovContract.facility.hasUpdates = false;
    const event: ROV_Event = new ROV_Event();
    
    let indiv: ROV_Individual = new ROV_Individual();
    event.associates.push(indiv);
    this.rovContract.facility.events = [event];
    this.syncDateInputs();
    this.currentEventsPage = 0;


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

    console.log('[TEMP][ROV-DEPT] Business model changed', {
      selectedValue,
      previousBusinessFunctionUid: this.rovContract.facility.businessFunctionUid,
      referenceBusinessFunctionCount: this.rovReferenceData?.businessFunctions?.length || 0,
      referenceBfDepartmentCount: (this.rovReferenceData as any)?.bfDepartments?.length || 0
    });

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

  private parseApiDate(value: unknown): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === 'number') {
      const dateFromNumber = new Date(value);
      return isNaN(dateFromNumber.getTime()) ? null : dateFromNumber;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return null;
    }

    const isoDate = this.parseIsoDate(trimmedValue);
    if (isoDate) {
      return isoDate;
    }

    const dotNetMatch = /\/Date\((\d+)\)\//.exec(trimmedValue);
    if (dotNetMatch) {
      const ticks = Number(dotNetMatch[1]);
      if (Number.isFinite(ticks)) {
        const dateFromTicks = new Date(ticks);
        return isNaN(dateFromTicks.getTime()) ? null : dateFromTicks;
      }
    }

    const parsedDate = new Date(trimmedValue);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private resolveNumericValue(source: any, keys: string[], defaultValue: number = 0): number {
    for (const key of keys) {
      const rawValue = source?.[key];
      const parsedValue = Number(rawValue);
      if (Number.isFinite(parsedValue)) {
        return parsedValue;
      }
    }

    return defaultValue;
  }

  private resolveDateValue(source: any, keys: string[]): Date {
    for (const key of keys) {
      const parsedDate = this.parseApiDate(source?.[key]);
      if (parsedDate) {
        return parsedDate;
      }
    }

    return {} as Date;
  }

  private normalizeLoadedContractData(): void {
    if (!this.rovContract?.facility?.events?.length) {
      return;
    }

    this.rovContract.facility.events.forEach((event: any) => {
      event.eventStartDate = this.resolveDateValue(event, [
        'eventStartDate',
        'EventStartDate',
        'eventStart',
        'eventStartDt'
      ]);

      event.eventEndDate = this.resolveDateValue(event, [
        'eventEndDate',
        'EventEndDate',
        'eventEnd',
        'eventEndDt'
      ]);

      event.feeTypeId = this.resolveNumericValue(event, ['feeTypeId', 'feeTypeID', 'FeeTypeId', 'FeeTypeID'], 0);
      event.flatFeeDollarAmount = this.resolveNumericValue(
        event,
        ['flatFeeDollarAmount', 'FlatFeeDollarAmount', 'flatFeeDlrAmt', 'flatFeeAmount'],
        0
      );
    });
  }

  private toIsoDateString(value: Date | null): string {
    if (!value || !(value instanceof Date) || isNaN(value.getTime())) {
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


  onVendorLookupClick(vendorNumber?: string): void {

    if (!this.rovContract) {
      return;
    }

    const resolvedVendorNumber = (vendorNumber ?? this.rovContract.vendorNumber ?? '').trim();
    if (!resolvedVendorNumber) {
      return;
    }

    this.sbmWebApiService.getVendorLocal(resolvedVendorNumber).subscribe({
      next: (response: any) => {
        const vendor = response?.vendor || response?.Vendor || response;
        const fetchedVendorNumber = vendor?.vendorNumber || vendor?.VendorNumber || vendor?.sVendorNum || resolvedVendorNumber;
        const resolvedVendorName = vendor?.vendorName || vendor?.VendorName || vendor?.name || '';
        this.rovContract!.vendorEPaid = Boolean(vendor?.vendorEPaid || vendor?.VendorEPaid || vendor?.ePaid);

        this.rovContract!.vendorNumber = String(fetchedVendorNumber);
        this.vendorName = String(resolvedVendorName);

        if (this.rovContract?.concessionaire) {
          this.rovContract.concessionaire.vendorNumber = String(fetchedVendorNumber);
          this.rovContract.concessionaire.vendorName = String(resolvedVendorName);
        }

        this.markObjectUpdated(this.rovContract);
        this.contractFormRef?.control.markAsDirty();
      },
      error: () => {
        // Keep existing values when lookup fails.
      }
    });
  }

  onFacilityLookupClick(facility: ROV_Facility, facilityNum: string): void {
    if (!this.rovContract?.facility) {
      return;
    }
    this.sbmWebApiService.getSingleFacilityLocal(facilityNum).subscribe({
      next: (response: FacilityModel) => {
        facility.fmfFacility = response;
        this.rovContract?.facility.events.forEach(e => {
          e.exchRegion = response.regionId;
          e.hasUpdates = true;
        });
      }  
      });
    this.markObjectUpdated(this.rovContract.facility);
    this.contractFormRef?.control.markAsDirty();
  }

  onContractFieldInputChange(
    field: 'contractNumber' | 'ownerFirstName' | 'ownerLastName' | 'ownerEmail' | 'ownerPhone',
    input: Event
  ): void {
    if (!this.rovContract) {
      return;
    }

    const value = (input.target as HTMLInputElement | null)?.value || '';
    this.rovContract[field] = field === 'ownerEmail' ? value.toUpperCase() : value;
    this.markObjectUpdated(this.rovContract);
    this.contractFormRef?.control.markAsDirty();
  }

  get hasSavedChanges(): string {
    return this.contractFormRef?.pristine === false ? 'false' : 'true';
  }

  get paginatedEvents(): ROV_Event[] {
    const events = this.rovContract?.facility?.events || [];
    const start = this.currentEventsPage * this.eventsPageSize;
    return events.slice(start, start + this.eventsPageSize);
  }

  get totalEventCount(): number {
    return this.rovContract?.facility?.events?.length || 0;
  }

  get totalEventPages(): number {
    return this.totalEventCount > 0 ? Math.ceil(this.totalEventCount / this.eventsPageSize) : 0;
  }

  get canGoToPreviousEventsPage(): boolean {
    return this.currentEventsPage > 0;
  }

  get canGoToNextEventsPage(): boolean {
    return this.currentEventsPage < this.totalEventPages - 1;
  }

  onPreviousEventsPage(): void {
    if (!this.canGoToPreviousEventsPage) {
      return;
    }

    this.currentEventsPage -= 1;
  }

  onNextEventsPage(): void {
    if (!this.canGoToNextEventsPage) {
      return;
    }

    this.currentEventsPage += 1;
  }

  getEventAssociates(event: ROV_Event): ROV_Individual[] {
    return event?.associates || [];
  }

  onResetAssociatePin(event: ROV_Event, associate: ROV_Individual): void {
    associate.pin = '';
    associate.hasUpdates = true;
    event.hasUpdates = true;
    this.markObjectUpdated(event);
    this.contractFormRef?.control.markAsDirty();
  }

  onCopyOwnerDetailsToAssociate(event: ROV_Event, associate: ROV_Individual): void {
    if (!this.rovContract) {
      return;
    }

    associate.firstName = this.rovContract.ownerFirstName || '';
    associate.lastName = this.rovContract.ownerLastName || '';
    associate.emailAddress = (this.rovContract.ownerEmail || '').toUpperCase();
    associate.phoneNumber = this.rovContract.ownerPhone || '';
    associate.indCountryDialCode = this.rovContract.ownerCountryDialCode || '';
    associate.hasUpdates = true;
    event.hasUpdates = true;
    this.markObjectUpdated(event);
    this.contractFormRef?.control.markAsDirty();
  }

  onAssociateFieldChange(event: ROV_Event, associate: ROV_Individual): void {
    associate.hasUpdates = true;
    event.hasUpdates = true;
    this.markObjectUpdated(event);
  }

  getEventDepartments(event: ROV_Event): ROV_Department[] {
    return event?.departments || [];
  }

  private getSelectedBusinessFunctionUid(): number {
    const facility = this.rovContract?.facility as any;
    const rawValue = facility?.businessFunctionUid ?? facility?.businessFunctionUID ?? 0;
    const parsedValue = Number(rawValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private getDepartmentTypeUidFromMapping(item: any): number {
    const rawValue = item?.deparmentTypeUID ?? item?.departmentTypeUID ?? item?.departmentTypeUId ?? item?.departmentTypeUid ?? 0;
    const parsedValue = Number(rawValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private getBusinessFunctionUidFromMapping(item: any): number {
    const rawValue = item?.businessFunctionUid ?? item?.businessFunctionUID ?? 0;
    const parsedValue = Number(rawValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private getReferenceDepartmentTypes(): ROV_DepartmentType[] {
    const referenceData = this.rovReferenceData as any;
    const sourceList = referenceData?.departmetnTypes || referenceData?.departmentTypes || [];

    console.log('[TEMP][ROV-DEPT] Department types source', {
      hasDepartmetnTypes: Array.isArray(referenceData?.departmetnTypes),
      hasDepartmentTypes: Array.isArray(referenceData?.departmentTypes),
      sourceCount: Array.isArray(sourceList) ? sourceList.length : 0,
      firstSourceItem: Array.isArray(sourceList) && sourceList.length ? sourceList[0] : null,
      firstSourceUidCandidates: Array.isArray(sourceList) && sourceList.length
        ? {
            departmentTypeUID: sourceList[0]?.departmentTypeUID,
            departmentTypeUId: sourceList[0]?.departmentTypeUId,
            departmentTypeUid: sourceList[0]?.departmentTypeUid
          }
        : null
    });

    return (sourceList as any[])
      .map(item => {
        if (!item) {
          return null;
        }

        const normalized = new ROV_DepartmentType();
        normalized.departmentTypeUID = Number(item.departmentTypeUID ?? item.departmentTypeUId ?? item.departmentTypeUid ?? 0);
        normalized.deptName = String(item.deptName ?? item.description ?? '');
        normalized.allowTags = item.allowTags ?? null;
        normalized.custInfoReq = item.custInfoReq ?? null;
        normalized.defaultNoOfTags = Number(item.defaultNoOfTags ?? 0);
        return normalized;
      })
      .filter((item): item is ROV_DepartmentType => !!item && item.departmentTypeUID > 0);
  }

  private getReferenceBfDepartments(): any[] {
    const referenceData = this.rovReferenceData as any;
    const source = (referenceData?.bfDepartments || referenceData?.bfDepartements || referenceData?.bfDepartment || []) as any[];

    console.log('[TEMP][ROV-DEPT] BF->Department mapping source', {
      hasBfDepartments: Array.isArray(referenceData?.bfDepartments),
      hasBfDepartementsTypo: Array.isArray(referenceData?.bfDepartements),
      hasBfDepartment: Array.isArray(referenceData?.bfDepartment),
      sourceCount: source.length,
      firstSourceItem: source.length ? source[0] : null,
      firstSourceUidCandidates: source.length
        ? {
            deparmentTypeUID: source[0]?.deparmentTypeUID,
            departmentTypeUID: source[0]?.departmentTypeUID,
            departmentTypeUId: source[0]?.departmentTypeUId,
            departmentTypeUid: source[0]?.departmentTypeUid,
            businessFunctionUID: source[0]?.businessFunctionUID,
            businessFunctionUid: source[0]?.businessFunctionUid
          }
        : null
    });

    return source;
  }

  private getDepartmentOptionsForFacility(): ROV_DepartmentType[] {
    const businessFunctionUid = this.getSelectedBusinessFunctionUid();
    if (!this.rovReferenceData || !businessFunctionUid) {
      console.warn('[TEMP][ROV-DEPT] Cannot resolve departments for popup', {
        hasReferenceData: !!this.rovReferenceData,
        businessFunctionUid
      });
      return [];
    }

    const departmentTypes = this.getReferenceDepartmentTypes();
    const bfDepartments = this.getReferenceBfDepartments();
    const matchingBfDepartments = bfDepartments
      .filter(department => this.getBusinessFunctionUidFromMapping(department) === businessFunctionUid);
    const allowedDepartmentTypeUIDs = matchingBfDepartments
      .map(department => this.getDepartmentTypeUidFromMapping(department))
      .filter(uid => uid > 0);

    console.log('[TEMP][ROV-DEPT] Department filter results', {
      businessFunctionUid,
      bfDepartmentCount: bfDepartments.length,
      matchingBfDepartmentCount: matchingBfDepartments.length,
      departmentTypeCount: departmentTypes.length,
      matchedDepartmentTypeUIDs: allowedDepartmentTypeUIDs,
      matchedUniqueDepartmentTypeUIDs: Array.from(new Set(allowedDepartmentTypeUIDs))
    });

    if (!allowedDepartmentTypeUIDs.length) {
      return [];
    }

    const allowedUidSet = new Set<number>(allowedDepartmentTypeUIDs);
    return departmentTypes.filter(departmentType => allowedUidSet.has(departmentType.departmentTypeUID));
  }

  openDepartmentPopup(event: ROV_Event): void {

    this.departmentPopupEvent = event;
    this.departmentPopupFacility = this.rovContract?.facility || null;
    this.departmentPopupDepartments = this.getDepartmentOptionsForFacility();
    const currentDepartments = this.getEventDepartments(event);

    console.log('[TEMP][ROV-DEPT] Open department popup', {
      eventId: (event as any)?.eventId ?? (event as any)?.eventID ?? 0,
      eventName: event?.eventName || '',
      popupDepartmentCount: this.departmentPopupDepartments.length,
      popupDepartmentNames: this.departmentPopupDepartments.map(department => department.deptName),
      currentEventDepartmentTypeUIDs: currentDepartments.map(department => department.departmentTypeUID)
    });

    this.selectedDepartmentTypeUIDs = new Set(
      currentDepartments
        .map(department => (department.departmentTypeUID || 0))
        .filter((departmentTypeUID): departmentTypeUID is number => departmentTypeUID > 0)
    );

  }


  isDepartmentChecked(departmentTypeUID: number): boolean {
    return this.selectedDepartmentTypeUIDs.has(departmentTypeUID);
  }

  onDepartmentCheckedChange(departmentTypeUID: number, checked: boolean): void {
    if (checked) {
      this.selectedDepartmentTypeUIDs.add(departmentTypeUID);
      return;
    }

    this.selectedDepartmentTypeUIDs.delete(departmentTypeUID);
  }

  applyDepartmentSelections(): void {
    if (!this.departmentPopupEvent || !this.departmentPopupFacility) {
      return;
    }

    const event = this.departmentPopupEvent;
    const facility = this.departmentPopupFacility;
    const existingDepartments = this.getEventDepartments(event);
    const departmentTypes = this.departmentPopupDepartments;

    event.departments = departmentTypes
      .filter(department => this.selectedDepartmentTypeUIDs.has(department.departmentTypeUID))
      .map(department => {
        const existingDepartment = existingDepartments.find(item => item.departmentTypeUID === department.departmentTypeUID);
        const mappedDepartment = new ROV_Department();

        if (existingDepartment) {
          Object.assign(mappedDepartment, existingDepartment);
        }

        mappedDepartment.facilityUID = existingDepartment?.facilityUID ?? facility.facilityUid;
        mappedDepartment.departmentUID = existingDepartment?.departmentUID ?? 0;
        mappedDepartment.description = existingDepartment?.description || department.deptName || '';
        mappedDepartment.locationUID = existingDepartment?.locationUID ?? 0;
        mappedDepartment.locationName = existingDepartment?.locationName ?? '';
        mappedDepartment.allowTags = existingDepartment?.allowTags ?? Boolean(department.allowTags);
        mappedDepartment.custInfoReq = existingDepartment?.custInfoReq ?? Boolean(department.custInfoReq);
        mappedDepartment.feePercent = existingDepartment?.feePercent ?? 0;
        mappedDepartment.allowTips = existingDepartment?.allowTips ?? false;
        mappedDepartment.departmentTypeUID = department.departmentTypeUID;
        mappedDepartment.hasUpdates = true;

        return mappedDepartment;
      });

    this.markObjectUpdated(facility);
    event.hasUpdates = true;
    this.contractFormRef?.control.markAsDirty();
  }

  private resolveInputValue(eventOrValue: Event | string | number): string {
    if (typeof eventOrValue === 'number') {
      return Number.isFinite(eventOrValue) ? String(eventOrValue) : '';
    }

    if (typeof eventOrValue === 'string') {
      return eventOrValue;
    }

    return (eventOrValue.target as HTMLInputElement | null)?.value ?? '';
  }

  private normalizeFeePercent(value: string | number): number {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      return 0;
    }

    const boundedValue = Math.min(100, Math.max(0, parsedValue));
    return Number(boundedValue.toFixed(3));
  }

  onEventDepartmentFeePercentInputChange(event: ROV_Event, department: ROV_Department, eventOrValue: Event | string | number): void {

    const value = this.resolveInputValue(eventOrValue);
    const nextPercent = this.normalizeFeePercent(value);
    
    department.feePercent = nextPercent;
    department.hasUpdates = true;
    event.hasUpdates = true;
    this.markObjectUpdated(event);
    this.contractFormRef?.control.markAsDirty();
  }

  onEventFieldInputChange(event: ROV_Event): void {
    event.hasUpdates = true;
    this.markObjectUpdated(event);
    this.contractFormRef?.control.markAsDirty();
  }

  onEventFeeAmountInputChange(event: ROV_Event, value: unknown): void {
    const parsedValue = Number(value ?? 0);
    event.flatFeeDollarAmount = Number.isFinite(parsedValue) ? Number(parsedValue.toFixed(2)) : 0;
    this.onEventFieldInputChange(event);
  }

  getEventDatePickerValue(event: ROV_Event, field: 'eventStartDate' | 'eventEndDate'): string {
    const value = field === 'eventStartDate' ? event.eventStartDate : event.eventEndDate;
    return this.toIsoDateString(value);
  }

  onEventDateInputChange(event: ROV_Event, field: 'eventStartDate' | 'eventEndDate', isoDateValue: string): void {
    const parsedDate = this.parseIsoDate(isoDateValue);
    const resolvedDate = parsedDate || ({} as Date);

    if (field === 'eventStartDate') {
      event.eventStartDate = resolvedDate;
    } else {
      event.eventEndDate = resolvedDate;
    }

    this.onEventFieldInputChange(event);
  }

  onAssociateFieldInputChange(event: ROV_Event, associate: ROV_Individual, field: 'firstName' | 'lastName' | 'emailAddress' | 'phoneNumber', input: Event): void {
    const value = ((input.target as HTMLInputElement | null)?.value || '');
    associate[field] = field === 'emailAddress' ? value.toUpperCase() : value;
    associate.hasUpdates = true;
    this.onAssociateFieldChange(event, associate);
    this.contractFormRef?.control.markAsDirty();
  }

  copyFirstEventDepartmentFeePercentToAll(event: ROV_Event): void {
    const departments = this.getEventDepartments(event);
    if (!departments.length) {
      return;
    }

    const firstValue = Number((departments[0].feePercent || 0));
    const normalized = Number.isFinite(firstValue) ? Math.min(100, Math.max(0, firstValue)) : 0;

    departments.forEach((department: ROV_Department) => {
      department.feePercent = Number(normalized.toFixed(2));
      department.hasUpdates = true;
    });

    event.hasUpdates = true;
    this.markObjectUpdated(event);
    this.contractFormRef?.control.markAsDirty();
  }

  onRemoveEventDepartment(event: ROV_Event, department: ROV_Department): void {
    event.departments = (event.departments || []).filter((item: ROV_Department) => item !== department);
    event.hasUpdates = true;
    this.markObjectUpdated(event);
    this.contractFormRef?.control.markAsDirty();
  }

  private syncDateInputs(): void {
    this.contractStartInput = this.formatDateInput(this.rovContract?.contractStart);
    this.contractEndInput = this.formatDateInput(this.rovContract?.contractEnd);
  }

  onBackToContractListing() {
    this.router.navigate(['sbm/clist']);
  }

  onSaveRovContract(arg0: any) {
    if (!this.rovContract) {
      this.toastSvc.error('No contract data available to save.');
      return;
    }

    const contract = this.rovContract;
    let errMsg = '';
    const startDate = this.parseDateInput(this.contractStartInput);
    const endDate = this.parseDateInput(this.contractEndInput);

    if (!contract.vendorNumber || contract.vendorNumber.trim().length < 6) {
      errMsg += 'Vendor Number requires at least 6 digits.\n';
    }

    if (!this.contractStartInput.trim()) {
      errMsg += 'You must enter Contract Start Date.\n';
    } else if (!startDate) {
      errMsg += 'You must enter a valid Contract Start Date.\n';
    }

    if (!this.contractEndInput.trim()) {
      errMsg += 'You must enter Contract End Date.\n';
    } else if (!endDate) {
      errMsg += 'You must enter a valid Contract End Date.\n';
    }

    if (startDate && endDate) {
      if (endDate < startDate) {
        errMsg += 'Contract End Date must be greater than the Contract Start Date.\n';
      }
    }

    if (!contract.contractNumber || contract.contractNumber.trim().length === 0) {
      errMsg += 'You must enter a Contract Number.\n';
    }

    if (!contract.ownerFirstName || contract.ownerFirstName.trim().length === 0) {
      errMsg += 'Concession Owner First Name is mandatory.\n';
    }

    if (!contract.ownerLastName || contract.ownerLastName.trim().length === 0) {
      errMsg += 'Concession Owner Last Name is mandatory.\n';
    }

    if (!contract.ownerEmail || !this.utilSvc.IsValidEmailAddress(contract.ownerEmail)) {
      errMsg += 'You must enter a valid Email Address for the Concession Owner.\n';
    }

    if (!contract.ownerPhone || contract.ownerPhone.trim().length === 0) {
      errMsg += 'Concession Owner Phone Number is mandatory.\n';
    }

    contract.facility.events?.forEach((event, index) => {
      if (!event.eventName || event.eventName.trim().length === 0) {
        errMsg += `Event ${event.eventName}: Event Name is mandatory.\n`;
      }

      const startDate = this.parseDateInput(event.eventStartDate ? this.formatDateInput(event.eventStartDate) : '');
      const endDate = this.parseDateInput(event.eventEndDate ? this.formatDateInput(event.eventEndDate) : '');

      if (!contract.vendorNumber || contract.vendorNumber.trim().length < 6) {
        errMsg += 'Vendor Number requires at least 6 digits.\n';
      }

      if (!startDate) {
        errMsg += 'You must enter Event Start Date.\n';
      } else if (!startDate) {
        errMsg += 'You must enter a valid Event Start Date.\n';
      }

      if (!endDate) {
        errMsg += 'You must enter Event End Date.\n';
      } else if (!endDate) {
        errMsg += 'You must enter a valid Event End Date.\n';
      }

      if (startDate && endDate) {
        if (endDate < startDate) {
          errMsg += 'Event End Date must be greater than the Event Start Date.\n';
        }
      }

      event.facilityNumber = contract.facility.facilityNumber;

      event.associates?.forEach((associate, associateIndex) => {
        if (!associate.firstName || associate.firstName.trim().length === 0) {
          errMsg += `Event ${event.eventName}, Associate ${associateIndex + 1}: First Name is mandatory.\n`;
        }
        if (!associate.lastName || associate.lastName.trim().length === 0) {
          errMsg += `Event ${event.eventName}, Associate ${associateIndex + 1}: Last Name is mandatory.\n`;
        }
        if (!associate.emailAddress || !this.utilSvc.IsValidEmailAddress(associate.emailAddress)) {
          errMsg += `Event ${event.eventName}, Associate ${associateIndex + 1}: You must enter a valid Email Address.\n`;
        }
        if (!associate.phoneNumber || associate.phoneNumber.trim().length === 0) {
          errMsg += `Event ${event.eventName}, Associate ${associateIndex + 1}: Phone Number is mandatory.\n`;
        }
      });

      event.departments?.forEach((department, departmentIndex) => {
        if (department.feePercent === undefined || department.feePercent === null || isNaN(department.feePercent)) {
          errMsg += `Event ${event.eventName}, Department ${department.description}: You must enter a valid Fee Percent.\n`;
        } else if (department.feePercent < 0 || department.feePercent > 100) {
          errMsg += `Event ${event.eventName}, Department ${department.description}: Fee Percent must be between 0 and 100.\n`;
        }
        department.maintTimestamp = new Date();
      });

      event.contractStartDate = this.rovContract?.contractStart || ({} as Date);
      event.contractEndDate = this.rovContract?.contractEnd || ({} as Date);
      event.lastEodSubmit = new Date();
      event.maintTimestamp = new Date();
      event.iglasProcessedDate = new Date(1999, 12, 12);
      event.walkerProcessedDate = new Date(1999, 12, 12);
      event.vendorConfirmEventTimestamp = new Date(1999, 12, 12);


    });

    const uid = sessionStorage.getItem('sbm_name') || '';
    if (!uid) {
      this.toastSvc.error('Unable to save contract: missing user id.');
      return;
    }


    if (errMsg) {
      this.toastSvc.error(errMsg);
      return;
    }

    this.sbmWebApiService.putROVContract(uid, contract).subscribe({
      next: result => {
        if (result?.results.success) {
          this.toastSvc.success('Contract saved successfully.');
          if(this.rovContract) {
            this.rovContract.contractUID = result.contract?.contractUID;
          }
        }
        else {          
          this.toastSvc.error('Failed to save contract. Please try again.');
        }
      },
      error: () => {
        this.toastSvc.error('An error occurred while saving the contract. Please try again.');
      }
    });

  }

  onAddEvent(): void {
    let newEvent = new ROV_Event();
    newEvent.eventName = '';

    let newAssociate = new ROV_Individual();
    newEvent.associates.push(newAssociate);

    this.rovContract?.facility?.events?.push(newEvent);

    this.markObjectUpdated(this.rovContract?.facility);
    this.contractFormRef?.control.markAsDirty();
  }
  
  openEventDatePicker(field: 'eventStart' | 'eventEnd', eventIndexOnPage: number): void {
    const targetEvent = this.paginatedEvents[eventIndexOnPage];
    if (!targetEvent) {
      return;
    }

    const targetField: 'eventStartDate' | 'eventEndDate' = field === 'eventStart' ? 'eventStartDate' : 'eventEndDate';

    const pickerInput = document.createElement('input');
    pickerInput.type = 'date';
    pickerInput.tabIndex = -1;
    pickerInput.className = 'contract-date-native-picker';

    const currentDateValue = this.getEventDatePickerValue(targetEvent, targetField);
    pickerInput.value = currentDateValue || this.todayDateIso;

    const contractStartIso = this.toIsoDateString(this.parseDateInput(this.contractStartInput));
    pickerInput.min = contractStartIso || this.todayDateIso;

    if (targetField === 'eventEndDate') {
      const eventStartIso = this.getEventDatePickerValue(targetEvent, 'eventStartDate');
      if (eventStartIso) {
        pickerInput.min = eventStartIso;
      }
    }

    const applySelection = () => {
      const selectedIsoDate = pickerInput.value;
      this.onEventDateInputChange(targetEvent, targetField, selectedIsoDate);

      if (targetField === 'eventStartDate') {
        const selectedDate = this.parseIsoDate(selectedIsoDate);
        const currentEndDate = targetEvent.eventEndDate instanceof Date ? targetEvent.eventEndDate : null;
        if (selectedDate && currentEndDate && currentEndDate < selectedDate) {
          targetEvent.eventEndDate = selectedDate;
          this.onEventFieldInputChange(targetEvent);
        }
      }

      pickerInput.remove();
    };

    pickerInput.addEventListener('change', applySelection, { once: true });
    pickerInput.addEventListener('blur', () => pickerInput.remove(), { once: true });

    document.body.appendChild(pickerInput);

    if (typeof pickerInput.showPicker === 'function') {
      pickerInput.showPicker();
      return;
    }

    pickerInput.focus();
    pickerInput.click();
  }
}
