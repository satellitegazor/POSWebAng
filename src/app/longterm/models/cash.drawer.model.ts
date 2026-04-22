import { MobileBase } from '../../models/mobile.base';

export class LTC_CashDrawerVariance {
	results: MobileBase = {} as MobileBase;
	foreignCashTenders: LTC_ForeignCashTenders[] = [];
	cashDrawerTenders: LTC_CashDrawerTenders[] = [];
}

export class LTC_ForeignCashTenders {
	tenderAmount: number = 0;
	tipAmount: number = 0;
	tenderDesc: string = '';
	tenderTypeCode: string = '';
	currencyCode: string = '';
	actual: number = 0;
	displayOrder: number = 0;
	businessDate: string = '';
	openCashDrwForTips: boolean = false;
}

export class LTC_CashDrawerTenders {
	tenderAmount: number = 0;
	tipAmount: number = 0;
	tenderDesc: string = '';
	tenderTypeCode: string = '';
	actual: number = 0;
	displayOrder: number = 0;
	businessDate: string = '';
	openCashDrwForTips: boolean = false;
}

export class CashDrawerSummaryResultsModel {
	results: MobileBase = {} as MobileBase;
	summary: LTC_CashDrawerReportSummary = new LTC_CashDrawerReportSummary();
}

export class LTC_CashDrawerReportSummary {
	cashDrawerDtls: LTC_CashDrawerDetails[] = [];
}

export class LTC_CashDrawerDetails {
	tenderAmount: number = 0;
	tipAmount: number = 0;
	depositCashCheck: number = 0;
	tenderDesc: string = '';
	transactionDate: Date = {} as Date;
	businessDate: Date = {} as Date;
	facNumber: string = '';
	associate: string = '';
	openCashDrwForTips: boolean = false;
	isExisting: boolean = false;
	configDate: string = '';
}




