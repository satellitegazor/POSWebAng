import { ROV_Department, ROV_Event } from "../../longterm/models/ticket.list"
import { CPOSDB } from "../../longterm/models/contract.models";
import { MobileBase } from "../../models/mobile.base";
import { SystemStatus } from "../../models/mobile.client.identity";
import { TicketTender } from "../../models/ticket.tender"
import { ROV_Ticket } from "./rticket.split";

export class RLogonModel {
	public guid: string = '';
        public vendorNumber: string = '';
        public exchangeNumber: string = '';
        public eventID: number = 0;
        public eventName: string = '';
        public individualUID: number = 0;
        public pIN: string = '';
        public newPIN: string = '';
        public verifyPIN: string = '';
        public showPrivTrngConfrm: number = 0;
		public privActConfmComplete: boolean = false;
        public cliTimeVar: number = 0;
        public pageID: number = 0;
        public contractType: boolean = false;
        public loggingOut: boolean = false;
        public regionId: string = '';
        public status: SystemStatus = new SystemStatus();
        public dBRegion: CPOSDB = CPOSDB.Conus;

    }

export class ROV_EventEndStatRsltMdl {
	results: any = null;
	eventId: number = 0;
	eventEnded: boolean = false;
}

export class ROV_SaleTaxSaveStatusResultModel {
	results: any = null;
	saveStatus: boolean = false;
	defaultCurrency: string = '';
}

export class ROV_SaleTaxSave {
	eventId: number = 0;
	deptId: number = 0;
	deptName: string = '';
	saleTaxPct: number = 0;
}

export class ROV_SaleItemTax {
	eventId: number = 0;
	departmentUid: number = 0;
	deptName: string = '';
	saleTaxPct: number = 0;
	exchCouponsAfterTax: boolean = false;
	vendCouponsAfterTax: boolean = false;
	eventStartDate: Date = new Date(0);
	eventEndDate: Date = new Date(0);
	contractUid: number = 0;
}

export class ROV_SaleTaxSaveModel {
	results: any = null;
	bApplyConcDiscounts: boolean = false;
	bApplyExchCoupons: boolean = false;
	defaultCurrency: string = '';
	currencyCode: string = '';
	currencyDesc: string = '';
	lstSaleTax: ROV_SaleTaxSave[] = [];
	status: boolean = false;
}

export class ROV_SaleItemTaxModel {
	results: any = null;
	lstSaleItemTax: ROV_SaleItemTax[] = [];
}

export class RDeptCategoryResultModels {
	results: any = null;
	lstItemButtons: ROV_Department[] = [];
}

export class VRoving_AbbrEventModel {
	facilityNumber: string = '';
	eventName: string = '';
	eventId: string = '';
	exchangeNumber: string = '';
	vendorNumber: string = '';
	eventStartDate: string = '';
	eventEndDate: string = '';
}

export class VRoving_EventsResultModel {
	results: any = null;
	events: VRoving_AbbrEventModel[] = [];
}

export class ROV_Customer {
	customerUid: number = 0;
	cTitle: string = '';
	cFirstName: string = '';
	cLastName: string = '';
	cMi: string = '';
	cUnit: string = '';
	cAddress1: string = '';
	cAddress2: string = '';
	cCity: string = '';
	cStateProvice: string = '';
	cPostalCode: string = '';
	cEmailAddress: string = '';
	cPhoneNumber: string = '';
	cDialCode: string = '';
	cNotes: string = '';
	custMaintTimestamp: Date = new Date(0);
	custMaintUserId: string = '';
}



export class Rov_AssociateSaleTips {
	tipAmount: number = 0;
	tipAssociateId: number = 0;
	tipSaleItemId: number = 0;
}

export class ROV_StartOrEndModel {
	results: MobileBase = {} as MobileBase;
}

export class ROV_EventsResultModel {
	results: MobileBase = {} as MobileBase;
	events: ROV_AbbrEventModel[] = [];
	isForeignCurr: boolean = false;
	currCode: string = '';
	regionCode: string = '';
}

export class ROV_AbbrEventModel {
	facilityNumber: string = '';
	facilityUid: string = '';
	eventName: string = '';
	eventID: number = 0;
	eventEnded: boolean = false;
	exchangeNumber: string = '';
	vendorNumber: string = '';
	vendorName: string = '';
	eventStartDate: Date = new Date(0);
	eventEndDate: Date = new Date(0);
	dayStarted: boolean = false;
	facilityTerminal: string = '';
	flatFeeDollarAmount: number = 0;
	contractUid: number = 0;
	contractEndDate: string = '';
	contractStartDate: string = '';
	contractNumber: string = '';
	regionId: string = '';
	cliTimeVar: number = 0;
}

export class CPOSRegion {
	regionId: number = 0;
	regionCode: string = '';
	regionDesc: string = '';
	displayOrder: number = 0;
}

export class ROV_VendorPINUpdateResultsModel {
	results: any = null;
}

export class ROV_AssociatePINUpdateResultsModel {
	results: any = null;
	vendorNumber: string = '';
	vendorName: string = '';
	facilityNumber: string = '';
	facilityName: string = '';
	eventName: string = '';
	associateEmail: string = '';
	eventStart: Date = new Date(0);
	eventEnd: Date = new Date(0);
	individualRole: string = '';
	associateName: string = '';
}

    export class ResetPinRequest
    {
        public eventID: number = 0;
        public indvID: number = 0;
        public creds: string = '';
        public uid: string = '';
		public veid: string = '';
		public cliTimeVar: number = 0
    }

export class ROV_TransactionDetailsModel {
	results: any = null;
	rovTransactionDetails: ROV_TransactionDetails[] = [];
}

export class ROV_TransactionDetails {
	ticketNumber: number = 0;
	transactionId: number = 0;
	dropOffDate: Date = new Date(0);
	tenderType: string = '';
	merchandiseSale: number = 0;
	discount: number = 0;
	salesTax: number = 0;
	couponTotal: number = 0;
	associate: string = '';
	associateId: number = 0;
	tranTotalAmount: number = 0;
	customerName: string = '';
	customerId: number = 0;
	customerPhone: string = '';
	totalDeposit: number = 0;
	ticketStatusId: number = 0;
	ticketStatusDesc: string = '';
	rackLocationDesc: string = '';
	orderFormNum: string = '';
	shipHandling: number = 0;
	busFuncCode: string = '';
	defaultCurrency: string = '';
	countryDialCode: string = '';
}

export class ROV_SingleTransactionIDResults {
	results: any = null;
	transactionResult: ROV_SingleTransactionID | null = null;
}

export class ROV_SingleTransactionID {
	transactionId: number = 0;
	cancelled: boolean = false;
}

export class ROV_SingleTransactionResultsModel {
	results: any = null;
	ticket: ROV_Ticket | null = null;
	signatureData: any = null;
}

export class ROV_FeeHResultsModel {
	results: any = null;
	feeType: string = '';
	rovFeeHistoryData: ROV_FeeHistoryData[] = [];
}

export class ROV_FeeHistoryData {
	id: number = 0;
	eventUid: number = 0;
	departmentUid: number = 0;
	amount: string = '';
	percentage: string = '';
	createdBy: string = '';
	createdOn: Date = new Date(0);
	startDate: Date = new Date(0);
	endDate: Date = new Date(0);
	maintUserId: string = '';
	maintTimestamp: Date = new Date(0);
}

export class ROV_InsuranceFeeHResultsModel {
	results: any = null;
	rovInsuranceFeeHistoryData: ROV_InsuranceFeeHistoryData[] = [];
}

export class ROV_InsuranceFeeHistoryData {
	insurnceFeeHistId: number = 0;
	eventUid: number = 0;
	amount: string = '';
	startDate: Date = new Date(0);
	endDate: Date = new Date(0);
	maintUserId: string = '';
	maintTimestamp: Date = new Date(0);
}

export class ROV_SalesTranRptSummaryModel {
	results: any = null;
	summary: ROV_SalesTranRptSummary[] = [];
}

export class ROV_SalesTranRptSummary {
	eventId: number = 0;
	eventName: string = '';
	tenderTypeCode: string = '';
	tenderTypeDescription: string = '';
	associate: string = '';
	individualUid: number = 0;
	displayOrder: number = 0;
	nbrTrans: number = 0;
	nbrTender: number = 0;
	sales: number = 0;
	tipAmount: number = 0;
	refunds: number = 0;
	salesTax: number = 0;
	couponTotal: number = 0;
	vendorCoupons: number = 0;
	exchangeCoupons: number = 0;
	pct: number = 0;
}

export class ROV_SalesTranRptDetailModel {
	results: any = null;
	detail: ROV_SalesTranRptDetail[] = [];
}

export class ROV_SalesTranRptDetail {
	ticketNumber: number = 0;
	transactionId: number = 0;
	eventId: number = 0;
	individualUid: number = 0;
	associate: string = '';
	transactionDate: string = '';
	tenderTypeCode: string = '';
	tenderTypeDescription: string = '';
	displayOrder: number = 0;
	partPayUid: number = 0;
	taxExempted: string = '';
	nbrTrans: number = 0;
	totalAmount: number = 0;
	sales: number = 0;
	tipAmount: number = 0;
	refunds: number = 0;
	salesTax: number = 0;
	couponTotal: number = 0;
	isRefundType: boolean = false;
	transactionOrder: number = 0;
	transactionDateOrder: number = 0;
	tenderOrderAsc: number = 0;
	tenderOrderDesc: number = 0;
	vendorCoupons: number = 0;
	exchangeCoupons: number = 0;
	deposit: number = 0;
	shipHandling: number = 0;
	formNumber: string = '';
	diffDateDeposit: boolean = false;
}

export class AssociateNamesListDetail {
	associateID: number = 0;
	associateName: string = '';
	emailAddress: string = '';
	active: number = 0;
}

export class AssociateNamesList {
	associateDetails: AssociateNamesListDetail[] = [];
}

export class AssociateNamesListResultsModel {
	results: MobileBase = {} as MobileBase;
	associateListSummary: AssociateNamesList = new AssociateNamesList();
}

export class ROVSignatureData {
	transactionId: number = 0;
	signData: string = '';
}

export class ROV_Signature {
	results: any = null;
	signData: any = null;
}

export class ROV_EventBusFuncModel {
	results: any = null;
	data: ROV_EventBusFuncDtl[] = [];
}

export class ROV_EventBusFuncDtl {
	eventId: number = 0;
	eventName: string = '';
	contractUid: number = 0;
	contractNumber: string = '';
	vendorNumber: string = '';
	facilityNumber: string = '';
	busModel: string = '';
	bfCode: string = '';
	individualUid: number = 0;
	firstName: string = '';
	lastName: string = '';
	emailAddress: string = '';
	indRoleDesc: string = '';
	bfRoleDesc: string = '';
	oFirstName: string = '';
	oLastName: string = '';
	oEmailAddress: string = '';
	eventStart: Date = new Date(0);
	eventEnd: Date = new Date(0);
	cliTimeVar: number = 0;
	useShipHndlng: boolean = false;
}

export class ROV_VerifyOrdNum {
	results: any = null;
	orderNumExists: boolean = false;
	eventId: number = 0;
	orderNum: string = '';
}

export class RContractIdResultsModel {
	results: any = null;
	rActiveContracts: RActiveContracts[] = [];
}

export class RActiveContracts {
	id: number = 0;
	contractStart: Date = new Date(0);
	contractEnd: Date | null = null;
	contractNumber: string = '';
	maintTimestamp: Date = new Date(0);
	firstName: string = '';
	lastName: string = '';
	emailAddress: string = '';
	vendorNumber: string = '';
	title: string = '';
	facilityNumber: string = '';
	firstNotifyDate: Date = new Date(0);
	secondNotifyDate: Date = new Date(0);
	thirdNotifyDate: Date = new Date(0);
	busFuncCode: string = '';
}

export class ROV_ContractExpiryNotifyResultModel {
	results: any = null;
	emailNotifyUid: number = 0;
	contractUid: number = 0;
	firstNotifyDate: Date = new Date(0);
	secondNotifyDate: Date = new Date(0);
	thirdNotifyDate: Date = new Date(0);
}

export class ROV_AssocLogoutHistory {
	results: any = null;
	eventId: number = 0;
}

export class ROV_TktRefundCancelResModel {
	results: any = null;
	ticketCancelId: number = 0;
	ticketTenderId: number = 0;
	cancelCount: number = 0;
}

export class ROV_EventIdResultsModel {
	results: any = null;
	rovActiveEvents: ROV_ActiveEvents[] = [];
}

export class ROV_ActiveEvents {
	id: number = 0;
	eventStart: Date = new Date(0);
	eventEnd: Date = new Date(0);
	contractNumber: string = '';
	contractId: number = 0;
	regionCode: string = '';
	eventId: number = 0;
	eventName: string = '';
	maintTimestamp: Date = new Date(0);
	maintUserId: string = '';
	emailAddress: string = '';
	vendorNumber: string = '';
	memberFName: string = '';
	memberLName: string = '';
	ascFName: string = '';
	ascLName: string = '';
	ascEmailAddress: string = '';
	title: string = '';
	facilityNumber: string = '';
	busFuncId: number = 0;
	busFuncCode: string = '';
	firstNotifyDate: Date = new Date(0);
	secondNotifyDate: Date = new Date(0);
	thirdNotifyDate: Date = new Date(0);
}

export class ROV_EventNotifyResultsModel {
	results: any = null;
	eventId: number = 0;
}

export class TranUIDataModel {
	results: any = null;
	data: TranUIData | null = null;
}

export class TranUIData {
	locationEventId: number = 0;
	individualId: number = 0;
	transactionId: number = 0;
	appType: number = 0;
	content: string = '';
}

export class SaveCustomerModel {
	results: any = null;
	customer: ROV_Customer | null = null;
}

export class ROV_DailyExchRateHistResultsModel {
	results: any = null;
	rovDailyExchRateHistRptSummary: ROV_DailyExchRateHistRptSummary | null = null;
}

export class ROV_DailyExchRateHistRptSummary {
	rovDailyExchRateHistDetails: ROV_DailyExchRateHistDetails[] = [];
}

export class ROV_DailyExchRateHistDetails {
	dailyExchRateId: number = 0;
	isOneUsd: boolean = false;
	oneUsdExchrate: string = '';
	oneFrnCurrExchRate: string = '';
	associateName: string = '';
	businessDate: Date = new Date(0);
	facilityNumber: string = '';
	currencyCode: string = '';
}

export class ROV_CashTransactionAmountModel {
	results: any = null;
	cashDrawerSummary: ROV_CashCheckDetails | null = null;
}

export class ROV_CashCheckDetails {
	cashDrawerDetails: ROV_TransactionAmount[] = [];
	cashDrawerTenders: ROV_CashDrawerTenders[] = [];
	denominations: any[] = [];
}

export class ROV_CashDrawerTenders {
	tenderAmount: number = 0;
	tenderDesc: string = '';
	tenderTypeCode: string = '';
	actual: number = 0;
	displayOrder: number = 0;
	businessDate: string = '';
}

export class ROV_ForeignCashTenders {
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

export class ROV_CashDrawerVariance {
	results: any = null;
	foreignCashTenders: ROV_ForeignCashTenders[] = [];
	cashDrawerTenders: ROV_CashDrawerTenders[] = [];
}

export class ROV_SaveCashDrawerEndOfDayResultsModel {
	results: any = null;
	endOfDayUid: number | null = null;
}

export class ROV_TransactionAmount {
	tenderAmount: number = 0;
	fcTenderAmount: number = 0;
	totUsdTenderAmount: number = 0;
	tenderDesc: string = '';
	depCashCheck: string = '';
}

export class ROV_CashDrawerDetails {
	tenderAmount: number = 0;
	depositCashCheck: number = 0;
	tenderDesc: string = '';
	transDate: Date = new Date(0);
	businessDate: Date = new Date(0);
	facNumber: string = '';
	associate: string = '';
	isExisting: boolean = false;
	configDate: string = '';
}

export class ROV_CashDrawerSummaryResultsModel {
	results: any = null;
	summary: ROV_CashDrawerReportSummary | null = null;
}

export class ROV_CashDrawerReportSummary {
	cashDrawerDetails: ROV_CashDrawerDetails[] = [];
}

export class ROV_EODZReportResultsModel {
	results: any = null;
	reconcillationSummary: ROV_EODZReport[] = [];
	reconcillationSummaryFc: ROV_EODZReport[] = [];
	departmentSummary: ROV_DepartmentSummaryDetail[] = [];
	departmentSummaryFc: ROV_DepartmentSummaryDetail[] = [];
	event: any = null;
	noSaleCount: number = 0;
	cancelledCount: number = 0;
	shippingHandling: number = 0;
	shippingHandlingTax: number = 0;
	fcShippingHandling: number = 0;
	fcShippingHandlingTax: number = 0;
	shippingTran: number = 0;
	refundShippingTran: number = 0;
	shippingTaxTran: number = 0;
	totalSalesTrans: number = 0;
	totalRefundTrans: number = 0;
	salesTaxExemptedCount: number = 0;
	refundTaxExemptedCount: number = 0;
	deferredCount: number = 0;
	deferredCountFc: number = 0;
	associate: string = '';
}

export class ROV_EODZReport {
	tenderTypeCode: string = '';
	tenderTypeDescription: string = '';
	displayOrder: number = 0;
	nbrTrans: number = 0;
	nbrTender: number = 0;
	sales: number = 0;
	refunds: number = 0;
	salesTax: number = 0;
	taxExemptedCount: number = 0;
	couponTotal: number = 0;
	vendorCoupons: number = 0;
	exchangeCoupons: number = 0;
	exchangeCouponsUsd: number = 0;
	exchangeCouponsSalesTransCount: number = 0;
	exchangeCouponsRefundTransCount: number = 0;
	vendorCouponsSalesTransCount: number = 0;
	vendorCouponsRefundTransCount: number = 0;
}

export class ROV_DepartmentSummaryDetail {
	departmentUid: number = 0;
	departmentTypeUid: number = 0;
	deptName: string = '';
	nbrTrans: number = 0;
	totalSales: number = 0;
	totalSalesTax: number = 0;
	totalEnvTax: number = 0;
	totalExchCouponAmt: number = 0;
	totalVndrCouponAmt: number = 0;
	shippingHandling: number = 0;
	isRefundType: boolean = false;
}

export class ROV_SettlementSummaryResultsModel {
	results: any = null;
	rovSettlementReport: ROV_SettlementReportSummary | null = null;
}

export class ROV_PastEventRecentSalesResultsModel {
	results: any = null;
	pastEventRecentSalesDate: string = '';
}

export class ROV_SettlementReportSummary {
	settlementDetails: ROV_SettlementDetails[] = [];
	shippingnHandling: number = 0;
	exchCpnsCount: number = 0;
	rfndTranCount: number = 0;
	cnclTktsCount: number = 0;
	insuranceFee: number = 0;
	oconusStlmntTndrDetails: any[] = [];
}

export class ROV_SettlementDetails {
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
}

export class ROV_DERDiscrepancyModel {
	contractNumber: string = '';
	regionCode: string = '';
	eventId: number = 0;
	currencyCode: string = '';
	eventName: string = '';
	facilityNbr: string = '';
	parentFacilityNbr: string = '';
	exchangeRate: number = 0;
	vendorNumber: string = '';
	vendorName: string = '';
	eventStart: Date = new Date(0);
	eventEnd: Date = new Date(0);
	isOneUsd: boolean = false;
	oneUsdRate: number = 0;
	oneFCurrRate: number = 0;
	foreignCurrCode: string = '';
	usdCurrCode: string = '';
}

export class ROVRefundCancelTicket {
	tktNum: number = 0;
	tranId: number = 0;
	eventId: number = 0;
	cancelTypeId: number = 0;
	otherReason: string = '';
	refundAmt: number = 0;
	refundTndrCode: string = '';
	tracking: string = '';
	cardEndingNbr: string = '';
	cliTimeVar: number = 0;
	dbVal: any = null;
	refundAmtFc: number = 0;
	isVerifoneSwipe: boolean = false;
	vmTndr: any = null;
	rrn: string = '';
	milstarPlanNum: string = '';
}

export enum StartOrEOD {
	
	DayStarted = 'S',
	EndOfDay = 'E'
}

export class EventStartOrEndRequest {
	vendorEventId: number = 0;
	startOrEnd: StartOrEOD = StartOrEOD.DayStarted;
	uid: string = '';
	cliTimeVar: number = 0;
}

export interface RovSaveTicketDetailRequest {
	appType: number;
	transactionId: number;
	ticketDetailId: number;
	salesItemUID: number;
	seqNbr: number;
	itemDescription: string;
	quantity: number;
	unitPrice: number;
	fcUnitPrice: number;
	salesTaxPct: number;
	discountAmount: number;
	fcDiscountAmount: number;
	couponLineItemDollarAmount: number;
	fcCouponLineItemDollarAmount: number;
	lineItemDollarDisplayAmount: number;
	fcLineItemDollarDisplayAmount: number;
	lineItemTaxAmount: number;
	fcLineItemTaxAmount: number;
	deptUID: number;
	srvdByAssocVal: number;
	isMisc: boolean;
	isFulfilled: boolean;
	isForeignCurr: boolean;
	isDefaultUSD: boolean;
	noOfTags: number;
	maintUserId: number;
	cliTimeVar: number;
	active: boolean;
}