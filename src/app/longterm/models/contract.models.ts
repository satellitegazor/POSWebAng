import { LTC_Individual, LTC_StoreLocation } from './store.location';
import { CPOS_Region, CPOS_RegionCountryCurrencyResultsModel } from './region.currency.models';
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

export class LTC_BusinessCategory {
	businessCategoryUID: number = 0;
	code: string = '';
	description: string = '';
	displayOrder: number = 0;
}

export class LTC_BusinessFunction {
	businessFunctionUID: number = 0;
	code: string = '';
	description: string = '';
	displayOrder: number = 0;
	businessModel: string = '';
	allowShipHandling: boolean = false;
}

export class LTC_CouponType {
	couponTypeID: number = 0;
	couponTypeCode: string = '';
	couponTypeDesc: string = '';
	displayOrder: number = 0;
}

export class LTC_FeeType {
	feeTypeID: number = 0;
	feeTypeCode: string = '';
	feeTypeDesc: string = '';
	displayOrder: number = 0;
}

export class LTC_SalesCatType {
	salesCatTypeUID: number = 0;
	code: string = '';
	description: string = '';
	displayOrder: number = 0;
}

export class LTC_IndividualRoleType {
	individualRoleTypeUID: number = 0;
	code: string = '';
	description: string = '';
	displayOrder: number = 0;
}

export class LTC_RefundReasonType {
	refundReasonUID: number = 0;
	refundReasonCode: string = '';
	refundReasonText: string = '';
	isConcessionFood: boolean = false;
	displayOrder: number = 0;
}

export class LTC_NoSaleReasonType {
	noSaleReasonUID: number = 0;
	noSaleReasonCode: string = '';
	noSaleReasonText: string = '';
	displayOrder: number = 0;
}

export class LTC_DepartmentType {
	departmentTypeUID: number = 0;
	deptName: string = '';
	allowTags: boolean | null = null;
	allowEnvTax: boolean | null = null;
	custInfoReq: boolean | null = null;
	defaultNoOfTags: number = 0;
}

export class LTC_DeptOfBusFun {
	departmentBFUID: number = 0;
	departmentTypeUID: number = 0;
	businessFunctionUID: number = 0;
}

export class LTC_TicketCancelType {
	ticketCancelTypeId: number = 0;
	ticketCancelTypeCode: string = '';
	ticketCancelTypeDesc: string = '';
	displayOrder: number = 0;
}

export class LTC_DeviceType {
	deviceID: number = 0;
	deviceCode: string = '';
	deviceDesc: string = '';
	displayOrder: number = 0;
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

export class LTC_ReferenceResultsModel {
	results: MobileBase = {} as MobileBase;
	businessCategories: LTC_BusinessCategory[] = [];
	businessFunctions: LTC_BusinessFunction[] = [];
	couponTypes: LTC_CouponType[] = [];
	feeTypes: LTC_FeeType[] = [];
	cPOSRegions: CPOS_Region[] = [];
	salesCatTypes: LTC_SalesCatType[] = [];
	individualRoleTypes: LTC_IndividualRoleType[] = [];
	refundReasonTypes: LTC_RefundReasonType[] = [];
	noSaleReasonTypes: LTC_NoSaleReasonType[] = [];
	departmetnTypes: LTC_DepartmentType[] = [];
	bfDepartments: LTC_DeptOfBusFun[] = [];
	ticketCancelTypes: LTC_TicketCancelType[] = [];
	deviceTypes: LTC_DeviceType[] = [];
	dBRegion: CPOSDB = CPOSDB.Conus;
}

export enum CPOSDB {
	Conus = 0,
	OConusE = 1,
	OConusP = 2
}
