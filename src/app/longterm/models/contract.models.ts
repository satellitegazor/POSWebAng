import { LTC_Individual, LTC_StoreLocation } from './store.location';
import { CPOS_RegionCountryCurrencyResultsModel } from './region.currency.models';
import { MobileBase } from '../../models/mobile.base';

export class Vendor {
	id: number = 0;
	vendorNumber: string = '';
	vendorName: string = '';
	pin: string = '';
	nameShort: string = '';
	addressLine1: string = '';
	addressLine2: string = '';
	addressLine3: string = '';
	addressCity: string = '';
	addressState: string = '';
	addressZip: string = '';
	phoneUSA: string = '';
	vendorType: string = '';
	vendorCountryCode: string = '';
	vendrPmtCurrencyCode: string = '';
	bankCode: string = '';
	vendorEPaid: string = '';
}

export class LTC_Contract {
	contractUid: number = 0;
	contractStart: Date = {} as Date;
	contractEnd: Date = {} as Date;
	regionCode: string = '';
	regionDesc: string = '';
	countryCode: string = '';
	countryName: string = '';
	currencyCode: string = '';
	currencyDesc: string = '';
	currencySymbol: string = '';
	phaseOutDate: Date | null = null;
	contractNumber: string = '';
	vendorNumber: string = '';
	vendorName: string = '';
	milStarTxnFee: number = 0;
	confirmContractTimestamp: Date = {} as Date;
	allowTaxExemption: boolean = false;
	applyCouponsAfterTax: boolean = false;
	ownerUid: string = '';
	ownerFirstName: string = '';
	ownerLastName: string = '';
	ownerEmail: string = '';
	ownerPhone: string = '';
	ownerCountryDialCode: string = '';
	concessionaire: Vendor = new Vendor();
	vendorEPaid: boolean = false;
	locations: LTC_StoreLocation[] = [];
	associateDetails: LTC_Individual[] = [];
	regionCountryCurrency: CPOS_RegionCountryCurrencyResultsModel = new CPOS_RegionCountryCurrencyResultsModel();
	hasRemoved: boolean = false;
	hasUpdates: boolean = false;
	cliTimeVar: number = 0;
	cntrctTranCount: number = 0;
}

export class LTC_ContractResultsModel {
	results: MobileBase = {} as MobileBase;
	contract: LTC_Contract = new LTC_Contract();
}
