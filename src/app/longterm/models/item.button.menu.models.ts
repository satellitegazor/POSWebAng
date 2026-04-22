import { MobileBase } from '../../models/mobile.base';

export class LTC_ItemButtonMenuResultsModel {
	results: MobileBase = {} as MobileBase;
	itemButtonMenuResults: LTC_ItemButtonMenuResults[] = [];
}

export class LTC_ItemButtonMenuResults {
	locationUid: number = 0;
	locationName: string = '';
	businessFunctionUid: number = 0;
	businessFunctionDescription: string = '';
	businessModel: string = '';
	departmentName: string = '';
	contractUid: string = '';
	facilityNumber: string = '';
	facilityUid: number = 0;
	departmentUid: number = 0;
	salesCategoryId: number = 0;
	salesCategoryDescription: string = '';
	salesItemId: number = 0;
	salesItemDescription: string = '';
	displayOrder: number = 0;
	displayOrderItem: number = 0;
	price: number | null = null;
	salesTax: number | null = null;
	envTax: number | null = null;
	allowTaxExemption: boolean | null = null;
	exchCouponsAfterTax: boolean | null = null;
	vendCouponsAfterTax: boolean | null = null;
	noOfTags: number = 0;
	feePercent: number = 0;
	allowTags: boolean | null = null;
	allowEnvTax: boolean | null = null;
	custInfoReq: boolean | null = null;
	defaultNoOfTags: number = 0;
	allowPartPay: boolean | null = null;
	allowSaveTkt: boolean | null = null;
	allowTips: boolean | null = null;
	openCashDrwForTips: boolean | null = null;
	maintTimestamp: Date | null = null;
	salesCatMaintTimeStamp: Date | null = null;
	deptMaintTimeStamp: Date | null = null;
	facMaintTimeStamp: Date | null = null;
	saleItemActive: boolean | null = null;
	salesCatActive: boolean | null = null;
	deptActive: boolean | null = null;
	facActive: boolean | null = null;
	defaultCurrency: string = '';
	currencyCode: string = '';
	currencyDesc: string = '';
	salesCatTypeUid: number = 0;
}
