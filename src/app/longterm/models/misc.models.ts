
// TypeScript models converted from C# classes
import { AssociateSaleTips } from "../../models/associate.sale.tips";
import { LTC_Customer } from "../../models/customer";
import { MobileBase } from "../../models/mobile.base";
import { TicketTender } from "../../models/ticket.tender";
import { LTC_RackLocations, LTC_RefundReasonType, LTC_TicketStatusLocation, LTC_TicketStatusType } from "./ticket.status.model";

// LTC_SingleTicketPaymentDetailsModel
export class LTC_SingleTicketPaymentDetailsModel {
  results: MobileBase = {} as MobileBase;
  ticketPaymentDetails: SingleTicketPaymentDetails[] = [];
  constructor(init?: Partial<LTC_SingleTicketPaymentDetailsModel>) { Object.assign(this, init); }
}

export class SingleTicketPaymentDetails {
  transactionId = 0;
  ticketTenderId = 0;
  partpayUid = 0;
  transactionDate = new Date();
  tenderTypeCode = '';
  tenderTypeDesc = '';
  displayOrder = 0;
  sales = 0;
  salesTax = 0;
  totalAmount = 0;
  tranTender = 0;
  tranTax = '';
  constructor(init?: Partial<SingleTicketPaymentDetails>) { Object.assign(this, init); }
}

// LTC_DailyExchRateHistResultsModel
export class LTC_DailyExchRateHistResultsModel {
  results: MobileBase = {} as MobileBase;
  ltcDailyExchRateHistRptSummary: LTC_DailyExchRateHistRptSummary = {} as LTC_DailyExchRateHistRptSummary;
  constructor(init?: Partial<LTC_DailyExchRateHistResultsModel>) { Object.assign(this, init); }
}

export class LTC_DailyExchRateHistRptSummary {
  ltcDailyExchRateHistDetails: LTC_DailyExchRateHistDetails[] = [];
  constructor(init?: Partial<LTC_DailyExchRateHistRptSummary>) { Object.assign(this, init); }
}

export class LTC_DailyExchRateHistDetails {
  dailyExchRateId = 0;
  isOneUsd = false;
  oneUsdExchrate = '';
  oneFrnCurrExchRate = '';
  associateName = '';
  businessDate = new Date();
  facilityNumber = '';
  currencyCode = '';
  constructor(init?: Partial<LTC_DailyExchRateHistDetails>) { Object.assign(this, init); }
}

export class LTC_Signature {
  results: MobileBase = {} as MobileBase;
  signData: SignatureData = {} as SignatureData;
  constructor(init?: Partial<LTC_Signature>) { Object.assign(this, init); }
}


export class LtcticketHeader {
  transactionId = 0;
  individualLocationUid = 0;
  transactionDate = new Date();
  taxExempted = false;
  maintTimestamp = new Date();
  maintUserId = '';
  ticketInstructions = '';
  datePaidInFull?: Date = undefined;
  tranCouponPercent?: number = undefined;
  tranCouponAmount?: number = undefined;
  cliTimeVar?: number = undefined;
  fcTranCouponAmount?: number = undefined;
  ticketNumber = 0;
  locationUid = 0;
  constructor(init?: Partial<LtcticketHeader>) { Object.assign(this, init); }
}

export class LtcticketTender {
  ticketTenderId = 0;
  transactionId = 0;
  tenderTypeId = 0;
  traceId = '';
  cardEndingNbr = '';
  authNbr = '';
  tenderAmount = 0;
  changeDue = 0;
  cardBalance?: number = undefined;
  maintTimestamp = new Date();
  maintUserId = '';
  partPayUid?: number = undefined;
  tipAmount = 0;
  isSignature?: boolean = undefined;
  cliTimeVar?: number = undefined;
  fcTenderAmount?: number = undefined;
  fcTipAmount?: number = undefined;
  fcChangeDue?: number = undefined;
  currCode = '';
  constructor(init?: Partial<LtcticketTender>) { Object.assign(this, init); }
}

export class LtcticketDetailFc {
  fcTicketDetailId = 0;
  ticketDetailId?: number = undefined;
  transactionId?: number = undefined;
  fcUnitPrice?: number = undefined;
  fcLineItemDollarDisplayAmount?: number = undefined;
  fcCouponLineItemDollarAmount?: number = undefined;
  fcLineItemTaxAmount?: number = undefined;
  fcDiscountAmount?: number = undefined;
  maintTimestamp?: Date = undefined;
  maintUserId?: number = undefined;
  fcLineItmKatsaCpnAmt?: number = undefined;
  fcLineItemEnvTaxAmount?: number = undefined;
  constructor(init?: Partial<LtcticketDetailFc>) { Object.assign(this, init); }
}

export class LtcticketDetail {
  ticketDetailId = 0;
  transactionId = 0;
  salesItemUid = 0;
  quantity = 0;
  isFulfilled = false;
  discountAmount?: number = undefined;
  maintTimestamp = new Date();
  maintUserId = '';
  couponLineItemDollarAmount?: number = undefined;
  lineItemDollarDisplayAmount?: number = undefined;
  lineItemTaxAmount?: number = undefined;
  lineItemEnvTaxAmount?: number = undefined;
  cliTimeVar?: number = undefined;
  lineItmKatsaCpnAmt?: number = undefined;
  constructor(init?: Partial<LtcticketDetail>) { Object.assign(this, init); }
}

export class Ltcindividual {
  individualUid = 0;
  firstName = '';
  lastName = '';
  emailAddress = '';
  phoneNumber = '';
  active = false;
  maintTimestamp = new Date();
  maintUserId = '';
  cliTimeVar = 0;
  countryDialCode = '';
  individualLocationUid = 0;
  individualRoleTypeUid = 0;
  constructor(init?: Partial<Ltcindividual>) { Object.assign(this, init); }
}

export class LtctenderType {
  tenderTypeId = 0;
  tenderTypeCode = '';
  tenderTypeDesc = '';
  isRefundType = false;
  displayOrder = 0;
  active = false;
  maintTimestamp = new Date();
  maintUserId = '';
  constructor(init?: Partial<LtctenderType>) { Object.assign(this, init); }
}

export class LtcpartPayDtls {
  partPayUid = 0;
  transactionId = 0;
  partAmount = 0;
  payOrder = 0;
  createdBy = '';
  createdDate?: Date = undefined;
  payByDueDate?: Date = undefined;
  cliTimeVar?: number = undefined;
  fcPartAmount?: number = undefined;
  constructor(init?: Partial<LtcpartPayDtls>) { Object.assign(this, init); }
}

export class NoSaleData {
  userId = '';
  individualId = 0;
  locationId = 0;
  noSaleDate = '';
  noSaleReason = '';
  noSaleReasonCode = '';
  cliTimeVar = 0;
  constructor(init?: Partial<NoSaleData>) { Object.assign(this, init); }
}

export class ReceiptOptnSelectedLog {
  tranId = 0;
  locationId = 0;
  optCode = '';
  ticketTenderId = 0;
  constructor(init?: Partial<ReceiptOptnSelectedLog>) { Object.assign(this, init); }
}

export class ReportCashTipsModel {
  userId = '';
  individualId = 0;
  locationId = 0;
  tipAmount = 0;
  cliTimeVar = 0;
  fcTipAmount = 0;
  constructor(init?: Partial<ReportCashTipsModel>) { Object.assign(this, init); }
}

export class SbmemailUpdateModel {
  userId = '';
  facilityNum = '';
  sbmemailAddr = '';
  constructor(init?: Partial<SbmemailUpdateModel>) { Object.assign(this, init); }
}

// LTC_PINReqdSalTranResultsModel
export class Ltc_PinReqdSalTranResultsModel {
  results: MobileBase = {} as MobileBase;
  pinReqDtls: LTC_PINReqdSalTran = {} as LTC_PINReqdSalTran;
  constructor(init?: Partial<Ltc_PinReqdSalTranResultsModel>) { Object.assign(this, init); }
}

// LTC_SingleCustomerResultsModel
export class LTC_SingleCustomerResultsModel {
  results: MobileBase = {} as MobileBase;
  customer: LTC_Customer = {} as LTC_Customer;
  constructor(init?: Partial<LTC_SingleCustomerResultsModel>) { Object.assign(this, init); }
}

// LTC_SingleTransactionID
export class CPOS_SingleTransactionId {
  results: MobileBase = {} as MobileBase;
  transactionId = 0;
  constructor(init?: Partial<CPOS_SingleTransactionId>) { Object.assign(this, init); }
}

// LTC_FeeHResultsModel
export class LtcFeeHResultsModel {
  results: MobileBase = {} as MobileBase;
  feeType = '';
  ltcFeeHistoryData: LtcFeeHistoryData[] = [];
  constructor(init?: Partial<LtcFeeHResultsModel>) { Object.assign(this, init); }
}

// LTC_CAMChargesFeeModel
export class LtcCamChargesFeeModel {
  results: MobileBase = {} as MobileBase;
  ltcCamChargesFeeData: LtcCamChargesFeeData[] = [];
  constructor(init?: Partial<LtcCamChargesFeeModel>) { Object.assign(this, init); }
}

// LTC_CAMChargesFeeData
export class LtcCamChargesFeeData {
  id = 0;
  amount = '';
  createdOn = new Date();
  startDate = new Date();
  endDate = new Date();
  maintUserId = '';
  maintTimeStamp = new Date();
  constructor(init?: Partial<LtcCamChargesFeeData>) { Object.assign(this, init); }
}


// TypeScript class for LTC_PINReqdSalTran
export class LTC_PINReqdSalTran {
  locationId = 0;
  pinReqdForSalesTran?: boolean = undefined;
  hasUpdates = false;
  action = 0;
  constructor(init?: Partial<LTC_PINReqdSalTran>) { Object.assign(this, init); }
}
export class LtcFeeHistoryData {
    id: number = 0;
    facilityUid: number = 0;
    departmentUid: number = 0;
    amount: string = '';
    percentage: string = '';
    createdBy: string = '';
    createdOn: Date = new Date();
    startDate: Date = new Date();
    endDate: Date = new Date();
    maintUserId: string = '';
    maintTimestamp: Date = new Date();

    constructor(init?: Partial<LtcFeeHistoryData>) {
        Object.assign(this, init);
    }
}

// LTC_BalanceDueCountResultsModel
export class LTC_BalanceDueCountResultsModel {
  results: MobileBase = {} as MobileBase;
  locationId = 0;
  contractId = 0;
  date = new Date();
  balanceDueCount = 0;
  constructor(init?: Partial<LTC_BalanceDueCountResultsModel>) { Object.assign(this, init); }
}

// LTC_TicketStatusLocationResult
export class LTC_TicketStatusLocationResult {
    results: MobileBase = {} as MobileBase;
    tktStLocList: LTC_TicketStatusLocation[] = [];
    tktStatTypeList: LTC_TicketStatusType[] = [];
    refundRsn: LTC_RefundReasonType[] = [];
    autoRacks: LTC_RackLocations[] = [];
    tktStatusAllRowsCount = 0;
    constructor(init?: Partial<LTC_TicketStatusLocationResult>) { Object.assign(this, init); }
}

export class AssociatePINUpdateResultsModel {
    results: MobileBase = {} as MobileBase;
    vendorNumber = '';
    vendorName = '';
    facilityNumber = '';
    facilityName = '';
    locationName = '';
    associateEmail = '';
    contractStart = new Date();
    contractEnd = new Date();
    individualRole = '';
    associateName = '';
    constructor(init?: Partial<AssociatePINUpdateResultsModel>) { Object.assign(this, init); }
}

export class LTC_SpecialInstructionsResultsModel {
    specialInstructions: LTC_SpecialInstructions[] = [];
    results: MobileBase = {} as MobileBase;
    constructor(init?: Partial<LTC_SpecialInstructionsResultsModel>) { Object.assign(this, init); }
}

export class LTC_SpecialInstructionsParmModel {
    departmentUid = 0;
    hasChanges = false;
    instructions: LTC_SpecialInstructions[] = [];
    constructor(init?: Partial<LTC_SpecialInstructionsParmModel>) { Object.assign(this, init); }
}

export class LTC_SpecialInstructions {
    departmentUid = 0;
    splInstructionUid = 0;
    description = '';
    active = false;
    displayOrder = 0;
    hasUpdates = false;
    locSplInstCount = 0;
    constructor(init?: Partial<LTC_SpecialInstructions>) { Object.assign(this, init); }
}
// TypeScript class for LTC_FeeHistoryData
export class SignatureData {
    transactionId = 0;
    signData = '';
    constructor(init?: Partial<SignatureData>) { Object.assign(this, init); }
}


export interface InProgressTendersResultModel {
  results: MobileBase;
  tenders: TicketTender[];
  partialPayments: PartPaymentInfo[];
  associateTips: AssociateSaleTips[];
}

export interface PartPaymentInfo {
  partPayId: number;
  partPayAmount: number;
  partPayAmountFC: number;
}

export interface TranCountForLocEventResultModel {
  results: MobileBase;
  tranCount: number;
  locEventId: number;
}
export interface SaveTicketDetailRequest {
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
  envTaxPct: number;
  discountAmount: number;
  fcDiscountAmount: number;
  couponLineItemDollarAmount: number;
  fcCouponLineItemDollarAmount: number;
  lineItemDollarDisplayAmount: number;
  fcLineItemDollarDisplayAmount: number;
  lineItemTaxAmount: number;
  fcLineItemTaxAmount: number;
  lineItemEnvTaxAmount: number;
  fcLineItemEnvTaxAmount: number;
  lineItmKatsaCpnAmt: number;
  fcLineItmKatsaCpnAmt: number;
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

export interface SaveTicketDetailResultModel {
  results: MobileBase;
  ticketDetailId: number;
  transactionId: number;
  salesItemId: number;
  itemDescription: string;
}

export interface InactiveTicketDetailRequest {
  locEvtId: number;
  tranId: number;
  ticketDetailId: number;
  appType: number;
  userId: number;
  voidTicket: boolean;
  voidTypeCode: string;
  voidOtherReason: string;
}

export interface InactiveTicketDetailResultModel {
  results: MobileBase;
}

export interface UpdateTicketStatusLocationRequest {
  transactionId: number;
  readyByDate: Date | null;
  statusId: number;
  rackLocationId: number;
  rckLocDesc: string;
  payByDueDate: Date | null;
  locationId: number;
  userId: string;
}

export interface TicketStatusRackModel {
  tktStatusRackId: number;
  transactionId: number;
  tktStatusId: number | null;
  rackLocationId: number | null;
  readyByDate: Date | null;
  maintUserId: string;
  maintTimeStamp: Date;
  payByDueDate: Date | null;
  rckLocDesc: string;
}

export interface UpdateTicketStatusLocationResultModel {
  results: MobileBase;
  data: TicketStatusRackModel;
  queryStatus: number;
  queryMessage: string;
  errorNumber: number;
}

export interface Conus_GC_Balance_Model {
  results: MobileBase;
  sResp: string;
  stAuth: string;
  stReasonCode: string;
  balance: number;
}

export interface AurusGiftCardRequest {
  FacilityNumber: string;
  TransactionAmount: number;
  CardNumberEncrypted: string;
  CardExpiryYear: number;
  CardExpiryMonth: number;
  TicketTenderId: number;
  TransactionId: number;
  RegionId: number;
  AppType: number;

}


// Add this interface if not already present
export interface SaveLocationAssociatesRequest {
  // Define properties as per backend contract
  // Example:
  // locationId: number;
  // associates: any[];
  // ...
}