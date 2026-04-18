import { MobileBase } from '../../../models/mobile.base';

export class LTC_SettlementDetails {
	facilityNumber: string = '';
	grossSales: number = 0;
	less: number = 0;
	taxes: number = 0;
	netSales: number = 0;
	exchangeFeeFlat: number = 0;
	exchangeFeePrcnt: number = 0;
	exchangeCoupons: number = 0;
	netExchangeFeeFlat: number = 0;
	netExchangeFeePrcnt: number = 0;
	businessDescription: string = '';
	feeType: number = 0;
	feeId: number = 0;
	rentalFee: number = 0;
	totalSalesTax: number = 0;
	totalRefundTax: number = 0;
	totalExchangeCoupon: number = 0;
	totalVendorDiscount: number = 0;
	noTaxSales: number = 0;
	envTax: number = 0;
	businessModel: string = '';
}

export class OConusSettlementTndrDetails {
	tenderType: string = '';
	tenderCount: number = 0;
	transactionCount: number = 0;
	tenderTotals: number = 0;
}

export class LTC_SettlementReportSummary {
	settlementDetails: LTC_SettlementDetails[] = [];
	tips: number = 0;
	exchCpnsCount: number = 0;
	rfndTranCount: number = 0;
	cnclTktsCount: number = 0;
	insuranceFee: number = 0;
	oconusStlmntTndrDetails: OConusSettlementTndrDetails[] = [];
	katusaCount: number = 0;
	katusaTotals: number = 0;
	camChrgAmt: number = 0;
	camChrgFacNbr: string = '';
	shipHandling: number = 0;
}

// Placeholder until contract fields are provided from the backend DTO.
export class LTC_Contract {
}

export class SettlementReportResultModel {
	results: MobileBase = {} as MobileBase;
	contract: LTC_Contract = new LTC_Contract();
	settlementReport: LTC_SettlementReportSummary = new LTC_SettlementReportSummary();
	contractId: number = 0;
	locationId: number = 0;
	fromDate: string = '';
	toDate: string = '';
	selectedMonth: number = 0;
	selectedYear: number = 0;
	locationName: string = '';
	storeName: string = '';
	showKatusa: boolean = false;
	showPaymentDueDate: boolean = false;
	businessModels: string = '';
	source: string = '';
}
