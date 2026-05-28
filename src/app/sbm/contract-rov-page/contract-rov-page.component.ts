import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROV_Contract, ROV_ContractResultsModel, ROV_Facility } from '../models/contract.models';
import { ROV_ReferenceResultsModel, Vendor } from '../../longterm/models/contract.models';
import { CPOS_RegionCountryCurrencyResultsModel } from '../../longterm/models/region.currency.models';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { ROV_Event } from 'src/app/longterm/models/ticket.list';

@Component({
  selector: 'app-contract-rov-page',
  templateUrl: './contract-rov-page.component.html',
  styleUrl: './contract-rov-page.component.css',
  standalone: false
})
export class ContractRovPageComponent implements OnInit {
  public contractData: ROV_ContractResultsModel = new ROV_ContractResultsModel();
  private readonly shortDateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US');
  public rovRefList: ROV_ReferenceResultsModel = new ROV_ReferenceResultsModel();

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
        // Handle the error here
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
        this.contractData = result;
        this.contractData.contract = this.contractData.contract || new ROV_Contract();
      },
      error: () => {
        this.initializeNewContract();
      }
    });
  }

  private initializeNewContract(): void {
    if (this.contractData?.contract?.contractUid > 0) {
      return;
    }

    this.contractData = new ROV_ContractResultsModel();
    this.contractData.contract = new ROV_Contract();
    this.contractData.contract.contractUid = 0;
    this.contractData.contract.contractStart = new Date();
    this.contractData.contract.contractEnd = new Date();
    this.contractData.contract.contractNumber = '';
    this.contractData.contract.vendorNumber = '';
    this.contractData.contract.regionCode = 'CON';
    this.contractData.contract.regionDesc = '';
    this.contractData.contract.countryCode = '';
    this.contractData.contract.countryName = '';
    this.contractData.contract.currencyCode = '';
    this.contractData.contract.currencyDesc = '';
    this.contractData.contract.milStarTxnFee = 0;
    this.contractData.contract.confirmContractTimestamp = new Date();
    this.contractData.contract.ownerUid = '';
    this.contractData.contract.ownerFirstName = '';
    this.contractData.contract.ownerLastName = '';
    this.contractData.contract.ownerEmail = '';
    this.contractData.contract.ownerPhone = '';
    this.contractData.contract.ownerCountryDialCode = '';
    this.contractData.contract.concessionaire = new Vendor();
    this.contractData.contract.vendorEPaid = false;
    this.contractData.contract.chargeToFaciltyNbr = '';
    this.contractData.contract.regionCountryCurrency = new CPOS_RegionCountryCurrencyResultsModel();
    this.contractData.contract.hasUpdates = false;
    this.contractData.contract.hasRemoved = false;
    this.contractData.contract.isMerged = false;
    this.contractData.contract.allowTaxExemption = false;
    this.contractData.contract.applyCouponsAfterTax = false;
    this.contractData.contract.vendorEPaid = false;
    this.contractData.contract.facility = new ROV_Facility();
    this.contractData.contract.facility.contractUid = this.contractData.contract.contractUid;
    this.contractData.contract.facility.facilityUid = 0;
    this.contractData.contract.facility.facilityNumber = '';
    this.contractData.contract.facility.regionUid = this.contractData.contract.regionCode;
    this.contractData.contract.facility.businessFunctionUid = 0;
    this.contractData.contract.facility.businessCategoryUid = 0;
    this.contractData.contract.facility.hasUpdates = false;
    const event: ROV_Event = new ROV_Event();
    this.contractData.contract.facility.events = [event];

    this.sbmWebApiService.getRegionCode().subscribe({
      next: result => {
        const regionCode = result?.cposRegion?.[0]?.regionCode || 'CON';
        if (!this.contractData?.contract) {
          return;
        }

        this.contractData.contract.regionCode = regionCode;
        this.contractData.contract.regionDesc = result?.cposRegion?.[0]?.regionDesc || '';
        this.contractData.contract.facility.regionUid = regionCode;

        this.sbmWebApiService.getCountryCurrencyCodes(regionCode).subscribe({
          next: countryCurrencyCodes => {
            if (!this.contractData?.contract) {
              return;
            }

            const selectedCountry = countryCurrencyCodes?.cposRegionCountry?.[0];
            const selectedCurrency = countryCurrencyCodes?.cposCurrency?.[0];

            this.contractData.contract.regionCountryCurrency = countryCurrencyCodes;
            this.contractData.contract.countryCode = selectedCountry?.countryCode || '';
            this.contractData.contract.countryName = selectedCountry?.countryName || '';
            this.contractData.contract.currencyCode = selectedCurrency?.currencyCode || '';
            this.contractData.contract.currencyDesc = selectedCurrency?.currencyDesc || '';
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
}
