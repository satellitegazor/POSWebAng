import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { LTC_Contract, LTC_ContractResultsModel, LTC_DepartmentType, LTC_ReferenceResultsModel } from '../../longterm/models/contract.models';
import { ToastService } from '../../services/toast.service';
import { UtilService } from '../../services/util.service';
import { FacilityModel, LTC_Facility, LTC_Individual, LTC_StoreLocation } from '../../longterm/models/store.location';
import { PosApiService } from '../../longterm/services/pos-api-service';
import { LTC_Department } from '../../longterm/reports/pricelist/price-list-rpt.component';
import { CountryCode, getCountries, getCountryCallingCode } from 'libphonenumber-js';

type CountryDialOption = {
  iso2: CountryCode;
  name: string;
  dialCode: string;
};

type HoursTimeOption = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-contract-ltc-page',
  templateUrl: './contract-ltc-page.component.html',
  styleUrls: ['./contract-ltc-page.component.css'],
  standalone: false
})
export class ContractLtcPageComponent implements OnInit {

  @ViewChild('contractForm') contractFormRef?: NgForm;

  ltcContract: LTC_Contract | null = null;
  ltcReferenceData: LTC_ReferenceResultsModel | null = null;
  contractStartInput = '';
  contractEndInput = '';
  departmentPopupFacility: LTC_Facility | null = null;
  departmentPopupDepartments: LTC_DepartmentType[] = [];
  selectedDepartmentTypeUIDs = new Set<number>();
  countryDialOptions: CountryDialOption[] = [];
  readonly daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  readonly hoursTimeOptions = this.buildHoursTimeOptions();
  openCountryDialLocationUid: number | null = null;
  selectedCountryIsoByLocationUid: Record<number, CountryCode> = {};
  private tempUidSeed = -1;

  get hasSavedChanges(): string {
    return this.contractFormRef?.pristine === false ? 'false' : 'true';
  }

  isFieldReadonly(location: LTC_StoreLocation): boolean {
    return location.locTranCount > 0;
  }

  constructor(
    private sbmWebApiService: SbmWebApiService,
    private ltcWebSvc: PosApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastSvc: ToastService,
    private utilSvc: UtilService
  ) { }

  ngOnInit(): void {
    this.countryDialOptions = this.buildCountryDialOptions();

    this.sbmWebApiService.getLTCReferenceLists(sessionStorage.getItem('sbm_name') || '').subscribe({
      next: result => {
        this.ltcReferenceData = result;
        this.ltcReferenceData.feeTypes = this.ltcReferenceData.feeTypes.filter(fee => fee.feeTypeCode != 'D');
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const ctrid = params.get('ctrid');
      const userIdStr = sessionStorage.getItem('sbm_employeeId');
      if (ctrid && userIdStr) {
        const contractId = Number(ctrid);
        const userId = Number(userIdStr);
        if (!isNaN(contractId) && !isNaN(userId) && contractId > 0 && userId > 0) {
          this.LoadContract(contractId, userId);
        }
        else {
          this.ltcContract = new LTC_Contract() as any;
          this.onAddLocation(this.ltcContract?.contractUid ?? 0);
          }
      }
    });
  }

  private buildCountryDialOptions(): CountryDialOption[] {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    return getCountries()
      .map((iso2): CountryDialOption => ({
        iso2,
        name: regionNames.of(iso2) || iso2,
        dialCode: getCountryCallingCode(iso2)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private buildHoursTimeOptions(): HoursTimeOption[] {
    const options: HoursTimeOption[] = [{ label: 'By appointment only', value: 'ByAptOnly' }];

    for (let hour = 6; hour <= 23; hour += 1) {
      for (const minute of [0, 30]) {
        const suffix = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        const minuteLabel = minute === 0 ? '00' : '30';
        options.push({
          label: `${hour12}:${minuteLabel} ${suffix}`,
          value: `${hour12}:${minuteLabel} ${suffix}`
        });
      }
    }

    return options;
  }

  private normalizeDialCode(value: string | null | undefined): string {
    return String(value || '').replace(/\D/g, '');
  }

  getCountryDialOption(dialCode: string | null | undefined): CountryDialOption | null {
    const normalizedDialCode = this.normalizeDialCode(dialCode);
    if (!normalizedDialCode) {
      return null;
    }

    return this.countryDialOptions.find(option => option.dialCode === normalizedDialCode) || null;
  }

  getSelectedCountryDialOption(location: LTC_StoreLocation): CountryDialOption | null {
    const selectedIso2 = this.selectedCountryIsoByLocationUid[location.locationUID];
    if (selectedIso2) {
      const selectedOption = this.countryDialOptions.find(option => option.iso2 === selectedIso2);
      if (selectedOption) {
        return selectedOption;
      }
    }

    const normalizedDialCode = this.normalizeDialCode(location.locCountryDialCode);
    if (!normalizedDialCode) {
      return null;
    }

    if (normalizedDialCode === '1') {
      return this.countryDialOptions.find(option => option.iso2 === 'US') || this.getCountryDialOption(normalizedDialCode);
    }

    return this.getCountryDialOption(normalizedDialCode);
  }

  isCountryDialDropdownOpen(locationUID: number): boolean {
    return this.openCountryDialLocationUid === locationUID;
  }

  toggleCountryDialDropdown(locationUID: number): void {
    this.openCountryDialLocationUid = this.openCountryDialLocationUid === locationUID ? null : locationUID;
  }

  closeCountryDialDropdown(): void {
    this.openCountryDialLocationUid = null;
  }

  onLocationDialCodeSelect(location: LTC_StoreLocation, option: CountryDialOption): void {
    location.locCountryDialCode = option.dialCode;
    this.selectedCountryIsoByLocationUid[location.locationUID] = option.iso2;
    this.closeCountryDialDropdown();
    this.markObjectUpdated(location);
  }

  getPrimaryFacility(location: LTC_StoreLocation): LTC_Facility | null {
    return location.facilities?.[0] || null;
  }

  onPrimaryFacilityEquipRentalFeeChange(location: LTC_StoreLocation, event: Event): void {
    const primaryFacility = this.getPrimaryFacility(location);
    if (!primaryFacility) {
      return;
    }

    this.onNumericInputChange(primaryFacility as any, 'equipRentalFee', event);
    this.markObjectUpdated(location);
  }

  addHoursOfOperation(location: LTC_StoreLocation): void {
    location.hoursOfOperations = location.hoursOfOperations ?? [];

    const hoursEntry = {
      hrsOfOperationID: this.getTemporaryUid(),
      locationUID: location.locationUID,
      dayFrom: '',
      dayTo: '',
      timeFrom: '',
      timeTo: '',
      displayOrder: `${location.hoursOfOperations.length + 1}`,
      hasUpdates: true
    };

    location.hoursOfOperations.push(hoursEntry as any);
    this.markObjectUpdated(location);
  }

  removeHoursOfOperation(location: LTC_StoreLocation, index: number): void {
    if (!location.hoursOfOperations?.length) {
      return;
    }

    location.hoursOfOperations.splice(index, 1);
    location.hoursOfOperations.forEach((hours, hoursIndex) => {
      hours.displayOrder = hoursIndex + 1;
      hours.hasUpdates = true;
    });
    this.markObjectUpdated(location);
  }

  onHoursOfOperationChange(location: LTC_StoreLocation, hoursIndex: number): void {
    const hours = location.hoursOfOperations?.[hoursIndex];
    if (!hours) {
      return;
    }

    if (hours.timeFrom === 'ByAptOnly' || hours.timeTo === 'ByAptOnly') {
      hours.timeFrom = 'ByAptOnly';
      hours.timeTo = 'ByAptOnly';
    }

    hours.displayOrder = hoursIndex + 1;
    hours.hasUpdates = true;
    this.markObjectUpdated(location);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeCountryDialDropdown();
  }

  /**
   * Loads a contract by ContractId and UserId, assigns to ltcContract
   * @param ContractId number
   * @param UserId number
   */
  LoadContract(ContractId: number, UserId: number): void {
    this.sbmWebApiService.loadLTCContract(ContractId, UserId.toString()).subscribe({
      next: result => {
        this.ltcContract = result.contract;
        this.syncDateInputs();

        this.ltcContract.locations.forEach(loc => {
          loc.facilities = loc.facilities ?? [];
          loc.hoursOfOperations = loc.hoursOfOperations ?? [];
          loc.eagleCashOptn = loc.eagleCashOptn === true;
          loc.useShipHndlng = loc.useShipHndlng === true;
          this.ltcWebSvc.getTranCountForLocEvent(loc.locationUID, 2, sessionStorage.getItem('sbm_name') || '').subscribe({
            next: tranCountResult => {
              loc.locTranCount = tranCountResult?.tranCount ?? 0;
            }
          });
        });
      },
      error: err => {
        this.ltcContract = null;
        this.syncDateInputs();
        // Optionally handle error
      },
      complete: () => {
        if(this.ltcContract != null) {
          this.ltcContract.locations.forEach(loc => {
            loc.facilities.forEach(fac => {
              // Perform any necessary operations on each facility here
              this.sbmWebApiService.getSingleFacilityLocal(fac.facilityNumber).subscribe({
                next: response => {
                  fac.fMF_Facility = response;
                },
                error: err => {
                  fac.fMF_Facility = {} as FacilityModel;
                }
              });
            });
          });
        }
      }
    });
  }

  private syncDateInputs(): void {
    this.contractStartInput = this.formatDateInput(this.ltcContract?.contractStart);
    this.contractEndInput = this.formatDateInput(this.ltcContract?.contractEnd);
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

  markObjectUpdated(target: any): void {
    if (!target || typeof target !== 'object') {
      return;
    }

    if ('hasUpdates' in target) {
      target.hasUpdates = true;
    }

    if (this.ltcContract && target !== this.ltcContract && 'hasUpdates' in this.ltcContract) {
      this.ltcContract.hasUpdates = true;
    }
  }

  onContractDateInputChange(field: 'contractStart' | 'contractEnd', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!this.ltcContract) {
      return;
    }

    if (field === 'contractStart') {
      this.contractStartInput = value;
    } else {
      this.contractEndInput = value;
    }

    const parsedDate = this.parseDateInput(value);
    const nextValue = parsedDate ?? value;
    if (field === 'contractStart') {
      this.ltcContract.contractStart = nextValue as any;
    } else {
      this.ltcContract.contractEnd = nextValue as any;
    }

    this.markObjectUpdated(this.ltcContract);
  }

  onLocationPhoneInputChange(location: LTC_StoreLocation, eventOrValue: Event | string | number): void {
    const value = this.resolveInputValue(eventOrValue);
    location.phoneNumber = this.formatUsPhoneNumber(value);
    this.markObjectUpdated(location);
  }

  onNumericInputChange(target: Record<string, any>, field: string, eventOrValue: Event | string | number): void {
    const value = this.resolveInputValue(eventOrValue);
    if (value === '') {
      target[field] = 0;
      this.markObjectUpdated(target);
      return;
    }

    const parsedValue = Number(value);
    target[field] = Number.isFinite(parsedValue) ? parsedValue : value;
    this.markObjectUpdated(target);
  }

  onDepartmentFeePercentInputChange(location: LTC_StoreLocation, facility: LTC_Facility, department: any, eventOrValue: Event | string | number): void {
    const value = this.resolveInputValue(eventOrValue);
    const nextPercent = this.normalizeFeePercent(value);

    department.feePercent = nextPercent;
    department.hasUpdates = true;
    this.markObjectUpdated(facility);
    this.markObjectUpdated(location);
  }

  copyFirstDepartmentFeePercentToAll(location: LTC_StoreLocation, facility: LTC_Facility): void {
    const departments = (facility as any).departments || [];
    if (!departments.length) {
      return;
    }

    const normalizedPercent = this.normalizeFeePercent(departments[0].feePercent);
    departments.forEach((department: any) => {
      department.feePercent = normalizedPercent;
      department.hasUpdates = true;
    });

    this.markObjectUpdated(facility);
    this.markObjectUpdated(location);
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

  private formatUsPhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10);

    if (!digits) {
      return '';
    }

    if (digits.length <= 3) {
      return `(${digits}`;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
    }

    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  private normalizeFeePercent(value: string | number): number {
    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue)) {
      return 0;
    }

    const boundedValue = Math.min(100, Math.max(0, parsedValue));
    return Number(boundedValue.toFixed(3));
  }

  onFeeTypeChange(facility: LTC_Facility, feeTypeIdValue: string): void {
    const feeTypeID = Number(feeTypeIdValue);
    facility.feeTypeID = Number.isFinite(feeTypeID) ? feeTypeID : 0;

    const selectedFeeType = this.ltcReferenceData?.feeTypes?.find(ft => ft.feeTypeID === facility.feeTypeID);
    facility.feeTypeCode = selectedFeeType?.feeTypeCode || '';

    this.markObjectUpdated(facility);
  }

  openDepartmentPopup(facility: LTC_Facility): void {
    this.departmentPopupFacility = facility;
    this.departmentPopupDepartments = this.getDepartmentOptionsForFacility(facility);

    const currentDepartments = this.getFacilityDepartments(facility);
    this.selectedDepartmentTypeUIDs = new Set(
      currentDepartments
        .map(department => this.getDepartmentTypeUid(department))
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
    if (!this.departmentPopupFacility) {
      return;
    }

    const facility = this.departmentPopupFacility;
    const existingDepartments = this.getFacilityDepartments(facility);
    const departmentTypes = this.departmentPopupDepartments;

    facility.departments = departmentTypes
      .filter(department => this.selectedDepartmentTypeUIDs.has(department.departmentTypeUID))
      .map(department => {
        const existingDepartment = existingDepartments.find(item => this.getDepartmentTypeUid(item) === department.departmentTypeUID);

        return {
          ...(existingDepartment || {}),
          facilityUID: existingDepartment?.facilityUID ?? facility.facilityUID,
          departmentUID: existingDepartment?.departmentUID ?? this.getTemporaryUid(),
          description: existingDepartment?.description || department.deptName || '',
          locationUID: existingDepartment?.locationUID ?? facility.locationUID,
          locationName: existingDepartment?.locationName ?? '',
          allowTags: existingDepartment?.allowTags ?? null,
          custInfoReq: existingDepartment?.custInfoReq ?? null,
          feePercent: existingDepartment?.feePercent ?? 0,
          openCashDrwForTips: existingDepartment?.openCashDrwForTips ?? null,
          allowTips: existingDepartment?.allowTips ?? false,
          allowEnvTax: existingDepartment?.allowEnvTax ?? false,
          departmentTypeUID: department.departmentTypeUID,
          hasUpdates: true
        };
      });

    this.markObjectUpdated(facility);
  }

  private getDepartmentOptionsForFacility(facility: LTC_Facility): LTC_DepartmentType[] {
    if (!this.ltcReferenceData || !facility.businessFunctionUID) {
      return [];
    }

    const allowedDepartmentTypeUIDs = this.ltcReferenceData.bfDepartments
      .filter(department => department.businessFunctionUID === facility.businessFunctionUID)
      .map(department => department.departmentTypeUID);

    return allowedDepartmentTypeUIDs
      .map(departmentTypeUID => this.ltcReferenceData?.departmetnTypes.find(item => item.departmentTypeUID === departmentTypeUID))
      .filter((department): department is LTC_DepartmentType => !!department);
  }

  private getFacilityDepartments(facility: LTC_Facility): LTC_Facility['departments'] {
    return facility.departments || [];
  }

  private getDepartmentTypeUid(department: LTC_Facility['departments'][number]): number {
    return Number(department.departmentUID ?? 0);
  }

  onVendorLookupClick(): void {
    if (!this.ltcContract) {
      return;
    }

    const vendorNumber = (this.ltcContract.vendorNumber || '').trim();
    if (!vendorNumber) {
      return;
    }

    this.sbmWebApiService.getVendorLocal(vendorNumber).subscribe({
      next: (response: any) => {
        const vendor = response?.vendor || response?.Vendor || response;
        const resolvedVendorNumber = vendor?.vendorNumber || vendor?.VendorNumber || vendor?.sVendorNum || vendorNumber;
        const resolvedVendorName = vendor?.vendorName || vendor?.VendorName || vendor?.name || this.ltcContract?.vendorName || '';

        this.ltcContract!.vendorNumber = String(resolvedVendorNumber);
        this.ltcContract!.vendorName = String(resolvedVendorName);

        if (this.ltcContract?.concessionaire) {
          this.ltcContract.concessionaire.vendorNumber = String(resolvedVendorNumber);
          this.ltcContract.concessionaire.vendorName = String(resolvedVendorName);
        }

        this.markObjectUpdated(this.ltcContract);
        this.contractFormRef?.control.markAsDirty();
      },
      error: () => {
        // Keep existing values when lookup fails.
      }
    });
  }

  btnReportsClick(locationUID: number): void {
    throw new Error('Method not implemented.');
  }  

  onBackToContractListing() {
    this.router.navigate(['sbm/clist']);
  }
  onSaveLtcContract(contractForm?: NgForm): void {
    if (!this.ltcContract) {
      this.toastSvc.error('No contract data available to save.');
      return;
    }

    const contract = this.ltcContract;
    let errMsg = '';
    const startDate = this.parseDateInput(this.contractStartInput);
    const endDate = this.parseDateInput(this.contractEndInput);

    // Validate contract fields
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

    if (!contract.locations || contract.locations.length === 0) {
      errMsg += 'You must have at least one contract location.\n';
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

    // Additional validations for locations
    contract.locations.forEach((location, index) => {
      if (!location.locationName || location.locationName.trim().length === 0) {
        errMsg += `You must enter the location name for location (${index + 1}).\n`;
      }

      if (!location.storeName || location.storeName.trim().length === 0) {
        errMsg += `You must enter the store name for location (${index + 1}).\n`;
      }

      if (!location.addressLine1 || location.addressLine1.trim().length === 0) {
        errMsg += `You must enter address for location (${index + 1}).\n`;
      }

      if (!location.city || location.city.trim().length === 0) {
        errMsg += `You must enter City for location (${index + 1}).\n`;
      }

      if (!location.stateProvice || location.stateProvice.trim().length === 0) {
        errMsg += `You must enter State/Province for location (${index + 1}).\n`;
      }

      if (!location.postalCode || location.postalCode.trim().length === 0) {
        errMsg += `You must enter Postal Code for location (${index + 1}).\n`;
      }

      if (!location.phoneNumber || location.phoneNumber.trim().length === 0) {
        errMsg += `You must enter Phone Number for location (${index + 1}).\n`;
      }
    });

    if (errMsg) {
      this.toastSvc.error(errMsg);
      return;
    }

    contract.contractStart = startDate as Date;
    contract.contractEnd = endDate as Date;

    const uid = sessionStorage.getItem('sbm_name') || '';
    if (!uid) {
      this.toastSvc.error('Unable to save contract: missing user id.');
      return;
    }

    // Proceed with saving the contract
    this.sbmWebApiService.PutLTCContract(uid, contract).subscribe({
      next: (resultDataModel: LTC_ContractResultsModel) => {
        if(resultDataModel && resultDataModel.results.success) {
        this.toastSvc.success('Contract saved successfully.');
        contractForm?.form.markAsPristine();
        } else {
          this.toastSvc.error('Failed to save the contract. ' + (resultDataModel?.results?.returnMsg || ''));
        }
      },
      error: () => {
        this.toastSvc.error('Failed to save the contract.');
      }
    });

  }

  /**
 * Handler for Add Location button. Opens the location modal and can be extended to initialize a new location.
 */
  onAddLocation(contractUid: number): void {
    // Optionally, add logic to initialize a new location object here
    // For now, just logs or prepares for modal
    console.log('Add Location clicked for contractUid:', contractUid);

    // You can add logic to prepare a new LTC_StoreLocation and push to contract.locations if needed
    const locationUid = this.getTemporaryUid();
    const facilityUid = this.getTemporaryUid();
    const individualUid = this.getTemporaryUid();

    const newFacility = new LTC_Facility();
    newFacility.facilityUID = facilityUid;
    newFacility.facilityNumber = '';
    newFacility.locationUID = locationUid;
    newFacility.businessCategoryUID = 2;

    const newIndivIdual = new LTC_Individual();
    newIndivIdual.individualUID = individualUid;
    newIndivIdual.firstName = '';
    newIndivIdual.lastName = '';

    const newLocation = new LTC_StoreLocation();
    newLocation.locationUID = locationUid;
    newLocation.contractUID = contractUid;
    newLocation.vendorNumber = '';
    newLocation.locCountryDialCode = '';
    newLocation.hoursOfOperations = [];
    newLocation.hasUpdates = true;
    newLocation.facilities = [newFacility];
    newLocation.associates = [];
    newLocation.locationTimeStamp = new Date();

    this.ltcContract?.locations.push(newLocation);
    this.markObjectUpdated(this.ltcContract);

  }

  private getTemporaryUid(): number {
    return this.tempUidSeed--;
  }

  onRemoveDepartment(loc: LTC_StoreLocation, fac: LTC_Facility, dpt: LTC_Department) {
    // Implement logic to remove a department from the location
    if(loc.locTranCount > 0) {
      this.toastSvc.error('Cannot remove Department from Location with existing Sales/Refunds.');
      return;
    }

    fac.departments = fac.departments.filter(department => department.departmentUID !== dpt.departmentUID);
    this.markObjectUpdated(fac);
  }

  onRemoveContract(contractUid: number): void {
    if(this.ltcContract?.locations.some(loc => loc.locTranCount > 0 && loc.contractUID === contractUid)) {
      this.toastSvc.error('Cannot remove Contract with existing Sales/Refunds.');
      return;
    }

  }

  setPrimaryFacility(location: any, facility: any, event: Event): void {
    
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      // this radio was selected
      location.facilityNumber = facility.facilityNumber;
      this.markObjectUpdated(location);
    } 
  }

  onFacilityLookupClick(facility: LTC_Facility, facilityNum: string): void {

    this.sbmWebApiService.getSingleFacilityLocal(facilityNum).subscribe({
      next: (response: FacilityModel) => {
        facility.fMF_Facility = response;
      }  
      });
  }
}
