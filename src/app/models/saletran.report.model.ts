import { MobileBase } from "./mobile.base";

export class ContractSummaryReport {
	public heading: ContractSummaryGrouped[] = [];
	public details: ContractTransactionDetail[] = [];
	public dueDesc: string = '';
	public amtDue: number = 0;
	public totalAmount: number = 0;
	public pctFee: number = 0;
	public eventDays: number = 0;
	public vendorEPaid: string = '';
}

export class ContractSummaryGrouped {
	public facilityNumber: string = '';
	public locationName: string = '';
	public tenderTypeCode: string = '';
	public tenderTypeDescription: string = '';
	public associate: string = '';
	public locationUid: number = 0;
	public individualUid: number = 0;
	public displayOrder: number = 0;
	public nbrTrans: number = 0;
	public nbrTender: number = 0;
	public sales: number = 0;
	public tipAmount: number = 0;
	public refunds: number = 0;
	public salesTax: number = 0;
	public couponTotal: number = 0;
	public vendorCoupons: number = 0;
	public exchangeCoupons: number = 0;
	public lineItmKatsaCpnAmt: number = 0;
	public pct: number = 0;
}

export class ContractTransactionDetail {
	public ticketNumber: number = 0;
	public facilityNumber: string = '';
	public transactionId: number = 0;
	public individualUid: number = 0;
	public associate: string = '';
	public transactionDate: Date = {} as Date;
	public tenderTypeCode: string = '';
	public tenderTypeDescription: string = '';
	public displayOrder: number = 0;
	public partPayUid: number = 0;
	public taxExempted: string = '';
	public nbrTrans: number = 0;
	public sales: number = 0;
	public tipAmount: number = 0;
	public refunds: number = 0;
	public salesTax: number = 0;
	public envTax: number = 0;
	public couponTotal: number = 0;
	public transactionOrder: number = 0;
	public transactionDateOrder: number = 0;
	public tenderOrderAsc: number = 0;
	public tenderOrderDesc: number = 0;
	public vendorCoupons: number = 0;
	public exchangeCoupons: number = 0;
	public katusaCoupons: number = 0;
	public shipHandling: number = 0;
}

export class VendorContractSummaryResultsModel {
	
	public results: MobileBase = {} as MobileBase;
	public summary: ContractSummaryReport = {} as ContractSummaryReport;
} 

export class SalesTranRptSummaryByFacility {
	public facilityNumber: string = '';
	public nbrTrans: number = 0;
	public nbrTenders: number = 0;
	public totalSales: number = 0;
	public pct: number = 0
}