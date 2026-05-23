import { MobileBase } from '../../models/mobile.base';
import { LTC_Department } from '../reports/pricelist/price-list-rpt.component';

export class LTC_StoreLocation_Result {
	public results: MobileBase = {} as MobileBase;
	public location: LTC_StoreLocation = {} as LTC_StoreLocation;
}

export class LTC_StoreLocation {
	public locationUID: number = 0;
	public contractUID: number = 0;
	public vendorNumber: string = '';
	public facilityNumber: string = '';
	public facility: FacilityModel = {} as FacilityModel;
	public storeName: string = '';
	public locationName: string = '';
	public addressLine1: string = '';
	public addressLine2: string = '';
	public city: string = '';
	public stateProvice: string = '';
	public postalCode: string = '';
	public phoneNumber: string = '';
	public locCountryDialCode: string = '';
	public terminalID: string = '';
	public regionUID: string = '';
	public locationTimeStamp: Date = {} as Date;
	public facilities: LTC_Facility[] = [];
	public associates: LTC_Individual[] = [];
	public hoursOfOperations: LTC_HoursOfOperation[] = [];
	public ccDevice: string = '';
	public ccDeviceDesc: string = '';
	public suiteNbr: string = '';
	public hasUpdates: boolean = false;
	public exchCouponsAfterTax: boolean | null = false;
	public vendCouponsAfterTax: boolean | null = false;
	public allowTaxExemption: boolean | null = false;
	public openCashDrwForTips: boolean | null = false;
	public pinReqdForSalesTran: boolean = false;
	public businessModel: string = '';
	public dfltCurrCode: string = '';
	public dfltCurrSymbol: string = '';
	public cliTimeVar: number = 0;
	public storeClosureDate: Date | null = null;
	public locTranCount: number = 0;
	public eagleCashOptn: boolean | null = false;
	public useShipHndlng: boolean = false;

	constructor() {
		this.hasUpdates = false;
	}
}

export class FacilityModel {
	public facilityName: string = '';
	public parentFacNbr: string = '';
	public facilityNumber: string = '';
	public facilityNameShort: string = '';
	public addressLine1: string = '';
	public addressLine2: string = '';
	public addressLine3: string = '';
	public addressLine4: string = '';
	public addressCity: string = '';
	public stateCountryCode: string = '';
	public stateCountryType: string = '';
	public zipCode: string = '';
	public facStatCode: string = '';
	public fiscalBusinessClass: string = '';
	public operatingAuthcode: string = '';
	public functionNameCode: string = '';
	public parentFacilityID: string = '';
	public regionId: string = '';
	public regionName: string = '';
}

export class LTC_Facility {
	public facilityUID: number = 0;
	public facilityNumber: string = '';
	public locationUID: number = 0;
	public businessFunctionUID: number = 0;
	public businessCategoryUID: number = 0;
	public feeTypeID: number = 0;
	public feeTypeCode: string = '';
	public feeAmount: number = 0;
	public feePercent: number = 0;
	public equipRentalFee: number = 0;
	public facInsuranceFee: number = 0;
	public cAMChrgFacNbr: string = '';
	public fMF_CAMChrgFacility: FacilityModel = {} as FacilityModel;
	public cAMChrgFeeAmt: number = 0;
	public fMF_Facility: FacilityModel = {} as FacilityModel;
	public hasUpdates: boolean = false;
	public isPrimaryFacility: boolean = false;
	public insuranceFacNbr: string = '';
	public departments: LTC_Department[] = [];
}

export class LTC_Individual {
	public individualUID: number = 0;
	public firstName: string = '';
	public lastName: string = '';
	public emailAddress: string = '';
	public phoneNumber: string = '';
	public indCountryDialCode: string = '';
	public locationUID: number = 0;
	public individualRoleTypeUID: number = 0;
	public pin: string = '';
	public individualRoleTypeCode: string = '';
	public individualRoleTypeDescription: string = '';
	public hasUpdates: boolean = false;
}

export class LTC_HoursOfOperation {
	public hrsOfOperationID: number = 0;
	public locationUID: number = 0;
	public dayFrom: string = '';
	public dayTo: string = '';
	public timeFrom: string = '';
	public timeTo: string = '';
	public displayOrder: number = 0;
	public hasUpdates: boolean = false;
}
