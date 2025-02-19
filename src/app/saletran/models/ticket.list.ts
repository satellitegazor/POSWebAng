import { RouterEvent } from "@angular/router";
import { MobileBase } from "src/app/models/mobile.base";
import { LTC_Customer } from "src/app/models/customer";

export class TicketList {
    public ticketNum: string = '';
    public transactionId: string = '';

}

export class TicketLookupResult
{
    public results: MobileBase = {} as MobileBase;
    public tickets: TicketLookupModel[] = [];
}

export class TicketLookupModel
{ 
    public transactionID: number = 0; 
    public ticketNumber: number = 0; 
    public locationUID: number = 0; 
}

export class SingleTransactionId {
    public results: MobileBase = {} as MobileBase;
    public transactionID: number = 0;




}

export class LTC_TransactionDetails
{
    public ticketNumber: number = 0;
    public transactionID: number = 0;
    public dropOffDate: Date = {} as Date;
    public tenderType: string = '';
    public merchandiseSale: number = 0;
    public discount: number = 0;
    public salesTax: number = 0;
    public couponTotal: number = 0;
    public associate: string = '';
    public associateId: number = 0;

    public tranTotalAmount: number = 0;
    public customerName: string = '';
    public customerID: number = 0;
    public customerPhone: string = '';
    public totalDeposit: number = 0;
    public ticketStatusId: number = 0;
    public ticketStatusDesc: string = '';
    public rackLocationDesc: string = '';
    public defaultCurrency: string = '';
    public countryDialCode: string = '';
}


export class LTC_TransactionDetailsModel
{
    
    public Results:  MobileBase = {} as MobileBase;

    
    public data: LTC_TransactionDetails[] = []
}

class SignatureData {
    TransactionID: number = 0;
    SignData: string = '';

    constructor() {
        // You can add any specific initialization logic if needed
    }
}

class LTC_Signature {
    Results: MobileBase = {} as MobileBase;
    SignData: SignatureData = {} as SignatureData;

    constructor() {
        // You can add any specific initialization logic if needed
    }
}

export class LTC_SingleTransactionResultsModel
{
    
    public Results:  MobileBase = {} as MobileBase;
    
    public ticket: LTC_Ticket = {} as LTC_Ticket;
    
    public SignatureData: LTC_Signature = {} as LTC_Signature;
}

export class ROV_Department {
    DepartmentUID: number = 0;
    DepartmentTypeUID: number = 0;
    Description: string = '';
    FacilityUID: number = 0;
    FeePercent: number = 0;
    SalesTaxPct: number = 0;
    Active: boolean = false;
    MaintTimestamp: Date | null = {} as Date;
    MaintUserId: number = 0;
    EventUID: number = 0;
    EventName: string = '';
    LocationUID: number = 0;
    LocationName: string = '';
    AllowTaxExemption: boolean = false;
    ExchCouponsAfterTax: boolean = false;
    VendCouponsAfterTax: boolean = false;
    BfCode: string = '';
    AllowPartPay: boolean = false;
    AllowTips: boolean = false;
    AllowSaveTkt: boolean = false;
    BusinessModel: number = 0;
    AllowTags: boolean = false;
    CustInfoReq: boolean = false;
    DefaultCurrency: string = '';
    HasUpdates: boolean = false;
    AllowzeroPrcntFee: boolean = false;

    constructor() {
        this.HasUpdates = false;
    }
}


class ROV_Event {
    EventID: number = 0;
    EventName: string = '';
    SuiteNbr: string = '';
    FacilityNumber: string = '';
    FacilityUID: number = 0;
    VendorAssociateId: number = 0;
    ExchangeNumber: string = '';
    VendorNumber: string = '';
    DayStarted: boolean = false;
    EventPIN: string = '';
    EventStartDate: Date = {} as Date;
    EventEndDate: Date = {} as Date;
    FacilityTerminal: string = '';
    FlatFeeDollarAmount: number = 0;
    ContractUID: number = 0;
    ContractStartDate: Date = {} as Date;
    ContractEndDate: Date = {} as Date;
    LastEODSubmit: Date = {} as Date;
    MustEnterPINEachTxn: string = '';
    VendorEPaid: string = '';
    MilStarTxnFee: number = 0;
    SalesTaxPct: number = 0;
    SaleTaxSaved: boolean = false;
    EventEnded: boolean = false;
    MaintTimestamp: Date = {} as Date;
    MaintUserId: string = '';
    TermsNetDays: number = 0;
    ChargeToFacilityNbr: string = '';
    MerchantAccountNbr: string = '';
    WalkerProcessed: boolean = false;
    ExchRegion: string = '';
    WalkerInvoiceNbr: string = '';
    ContractNumber: string = '';
    IGLASProcessed: boolean = false;
    IGLASProcessedDate: Date = {} as Date;
    WalkerProcessedDate: Date = {} as Date;
    VendorConfirmEventTimestamp: Date = {} as Date;
    ResetPin: boolean = false;
    TempPIN: string = '';
    AllowTaxExemption: string = '';
    EmailAddress: string = '';
    EventAssociateID: number = 0;
    ExchCouponsAfterTax: boolean = false;
    VendCouponsAfterTax: boolean = false;
    FeeTypeID: number = 0;
    FeeTypeCode: string = '';
    CPOSRegionID: number = 0;
    CCDevice: string = '';
    CCDeviceDesc: string = '';
    IsForeignCurrency: boolean = false;
    DfltCurrCode: string = '';
    CountryCode: string = '';
    Departments: ROV_Department[] = [];
    Associates: ROV_Individual[] = [];
    HasUpdates: boolean = false;
    EvntTranCount: number = 0;
    EagleCashOptn: boolean | null = false;
    UseShipHndlng: boolean = false;
    EvntInsuranceFee: number = 0;
    InsuranceFacNbr: string = '';


}

class ROV_Individual {
    IndividualUID: number = 0;
    FirstName: string= "";
    LastName: string= "";
    EmailAddress: string= "";
    PhoneNumber: string= "";
    IndCountryDialCode: string= "";
    EventUID: number = 0;
    IndividualRoleTypeUID: number = 0;
    PIN: string= "";
    IndividualRoleTypeCode: string= "";
    IndividualRoleTypeDescription: string= "";
    HasUpdates: boolean = false;

}


export class LTC_Ticket
{
    //-- 1. Ticket Header
    public  eventID: number = 0;
    public  ticketNumber: number = 0;
    public  transactionID: number = 0;
    public  individualLocationUID: number = 0;
    public  locationUID: number = 0;
    public  contractUID: number = 0;
    public  transactionDate: Date = {} as Date;
    public  taxExempted: number = 0;
    public  ticketInstructions: string = '';
    public  maintTimestamp: Date = {} as Date;
    public  maintUserId: string = '';
    public  amountPaid: number = 0;
    public  amountPaidFC: number = 0;
    public  balanceDue: number = 0;
    public  balanceDueFC: number = 0;
    public  partPayments: number = 0;
    public  isPartial: number = 0;
    public  isFullyPaid: boolean = false;
    public  exchCouponsAfterTax: boolean = false;
    public  vendCouponsAfterTax: boolean = false;
    public  allowTaxExemption: boolean = false;
    public  refundReasonCode: string = '';
    public  refundReasonText: string = '';
    public  tranCouponPercent: number = 0;
    public  tranCouponAmount: number = 0;
    public  fCTranCouponAmount: number = 0;
    public  isSignCaptured: boolean = false;
    public  isOConus: boolean = false;
    public  cntrctCntryDialCode: string = '';
    public  dfltCurrCode: string = '';
    public  cntrctCurrCode: string = '';
    public  dfltCurrSymbol: string = '';
    public  cntrctCurrSymbol: string = '';
    public  dfltCurrHtml: string = '';
    public  cntrctCurrHtml: string = '';
    public  individual: LTC_Individual = {} as LTC_Individual;
    public  location: LTC_StoreLocation = {} as LTC_StoreLocation;
    public  event: ROV_Event = {} as ROV_Event;

    public  tenders: TicketTender[] = [];
    public  items: SalesTransactionCheckoutItem[] = [];
    public  customer: LTC_Customer = {} as LTC_Customer;
    public  ticketCancel: LTC_TicketCancel = {} as LTC_TicketCancel;
    public  hoursOfOperations: LTC_HoursOfOperation[] = [];
    public  ticketStatus: LTC_TicketStatusLocation = {} as LTC_TicketStatusLocation;


    public  shipHandling: number = 0;
    public  shipHandlingTaxAmt: number = 0;
    public  fCShipHandling: number = 0;
    public  fCShipHandlingTaxAmt: number = 0;
    public  prprtyClausDays: string = '';
}
class LTC_TicketStatusLocation {
    ticketNumber: number = 0;
    dropOffDate: Date = {} as Date;
    readyByDate: Date | null = {} as Date;
    quantity: number = 0;
    totalSaleAmount: number = 0;
    totalTips: number = 0;
    totalPaid: number = 0;
    balanceDue: number = 0;
    customerName: string= "";
    phoneNumber: string= "";
    tktStatusId: number = 0;
    rackLocationId: number = 0;
    locationUID: number = 0;
    transactionID: number = 0;
    tktStatusRackId: number = 0;
    payByDueDate: Date | null = {} as Date;
    rckLocDesc: string= "";
    cDialCode: string= "";   
}

export class LTC_TicketCancel {
    ticketCancelId: number = 0;
    cancelTransactionID: number = 0;
    ticketCancelTypeId: number = 0;
    otherReason: string= "";
    tCMaintTimestamp: Date = {} as Date;
    tCMaintUserId: string= "";
    ticketCancelTypeCode: string= "";
    ticketCancelTypeDesc: string= "";
}


export class SalesTransactionCheckoutItem {
    ticketDetailId: number = 0;
    tktTransactionID: number = 0;
    salesItemDesc: string= "";
    salesItemUID: number = 0;
    salesCategoryUID: number = 0;
    quantity: number = 0;
    unitPrice: number = 0;
    salesTaxPct: number = 0;
    envrnmtlTaxPct: number = 0;
    noOfTags: number = 0;
    vendorCouponDiscountPct: number = 0;
    discountAmount: number = 0;
    exchangeCouponDiscountPct: number = 0;
    couponLineItemDollarAmount: number = 0;
    fCCouponLineItemDollarAmount: number = 0;
    lineItemTaxAmount: number = 0;
    lineItemEnvTaxAmount: number = 0;
    lineItemDollarDisplayAmount: number = 0;
    dtlMaintTimestamp: Date = {} as Date;
    dtlMaintUserId: string= "";
    isMiscellaneous: boolean = false;
    locationUID: number = 0;
    facilityUID: number = 0;
    departmentUID: number = 0;
    businessFunctionUID: number = 0;
    deptName: string= "";
    custInfoReq: boolean = false;
    applyCouponsAfterTax: boolean = false;
    allowPartPay: boolean = false;
    allowSaveTkt: boolean = false;
    instruction: string= "";
    addlInstruction: string= "";
    openCashDrwForTips: boolean = false;
    allowTips: boolean = false;
    srvdByAssociateVal: number = 0;
    srvdByAssociateText: string= "";
    businessFuncCode: string= "";
    splInstUID: number = 0;
    splInstDesc: string= "";
    splInstOthRsn: string= "";
    itemSaved: boolean = false;
    dCCouponLineItemDollarAmount: number = 0;
    dCDiscountAmount: number = 0;
    dCLineItemDollarDisplayAmount: number = 0;
    dCLineItemTaxAmount: number = 0;
    dCUnitPrice: number = 0;
    lineItmKatsaCpnAmt: number = 0;
    fCLineItmKatsaCpnAmt: number = 0;
    fCLineItemEnvTaxAmount: number = 0;


}


export class TicketTender {
    ticketTenderId: number = 0;
    tenderTypeId: number = 0;
    tenderTransactionId: number = 0;
    tenderTypeCode: string= "";
    tenderTypeDesc: string= "";
    isRefundType: boolean = false;
    isSignature: boolean = false;
    displayOrder: number = 0;
    cardEndingNbr: string= "";
    tracking: string= "";
    traceId: string= "";
    authNbr: string= "";
    tenderAmount: number = 0;
    changeDue: number = 0;
    fCChangeDue: number = 0;
    cardBalance: number = 0;
    fCTenderAmount: number = 0;
    fCCurrCode: string= "";
    transactionNumber: string= "";
    tndMaintTimestamp: Date = {} as Date;
    tndMaintUserId: string= "";
    tipAmount: number = 0;
    fCTipAmount: number = 0;
    exchCardType: string= "";
    exchCardPymntType: string= "";
    cardEntryMode: string= "";
    signatureType: string= "";
    milstarPlanNum: string= "";
    checkNumber: string= "";

}



export class LTC_Individual {
    IndividualUID: number = 0;
    FirstName: string = '';
    LastName: string = '';
    EmailAddress: string = '';
    PhoneNumber: string = '';
    IndCountryDialCode: string = '';
    LocationUID: number = 0;
    IndividualRoleTypeUID: number = 0;
    PIN: string = '';
    IndividualRoleTypeCode: string = '';
    IndividualRoleTypeDescription: string = '';
    HasUpdates: boolean = false;

    constructor() {
        this.HasUpdates = false;
    }
}


class FacilityModel {
    FacilityName: string= '';
    ParentFacNbr: string= '';
    FacilityNumber: string= '';
    FacilityNameShort: string= '';
    AddressLine1: string= '';
    AddressLine2: string= '';
    AddressLine3: string= '';
    AddressLine4: string= '';
    AddressCity: string= '';
    StateCountryCode: string= '';
    StateCountryType: string= '';
    ZipCode: string= '';
    FacStatCode: string= '';
    FiscalBusinessClass: string= '';
    OperatingAuthcode: string= '';
    FunctionNameCode: string= '';
    ParentFacilityID: string= '';
    RegionId: string= '';
    RegionName: string= '';
    
    constructor() {
        // Add any specific initialization logic if needed
    }
}

class LTC_Facility {
    FacilityUID: number = 0;
    FacilityNumber: string= '';
    LocationUID: number = 0;
    BusinessFunctionUID: number = 0;
    BusinessCategoryUID: number = 0;
    FeeTypeID: number = 0;
    FeeTypeCode: string= '';
    FeeAmount: number = 0;
    FeePercent: number = 0;
    EquipRentalFee: number = 0;
    FacInsuranceFee: number = 0;
    CAMChrgFacNbr: string= '';
    FMF_CAMChrgFacility: FacilityModel = {} as FacilityModel;
    CAMChrgFeeAmt: number = 0;
    FMF_Facility: FacilityModel = {} as FacilityModel;
    HasUpdates: boolean = false;
    Departments: LTC_Department[] = [];
    IsPrimaryFacility: boolean = false;
    InsuranceFacNbr: string= '';

    constructor() {
        this.HasUpdates = false;
    }
}

class LTC_Department {
    DepartmentUID: number = 0;
    FacilityUID: number = 0;
    DepartmentTypeUID: number = 0;
    FeePercent: number = 0;
    LocationUID: number = 0;
    LocationName: string = '';
    HasUpdates: boolean = false;
    Description: string = '';
    AllowTags: boolean | null = false;;
    AllowEnvTax: boolean | null = false;;
    CustInfoReq: boolean | null = false;;
    DefaultNoOfTags: number = 0;
    AllowPartPay: boolean = false;
    AllowSaveTkt: boolean = false;
    AllowTips: boolean = false;
    OpenCashDrwForTips: boolean | null = false;;
    AllowzeroPrcntFee: boolean = false;

    constructor() {
        this.HasUpdates
    }
}

class LTC_HoursOfOperation {
    HrsOfOperationID: number = 0;
    LocationUID: number = 0;
    DayFrom: string = '';
    DayTo: string = '';
    TimeFrom: string = '';
    TimeTo: string = '';
    DisplayOrder: string = '';
    HasUpdates: boolean = false;;

    constructor() {
        this.HasUpdates = false;
    }
}


class LTC_StoreLocation {
    LocationUID: number = 0;
    ContractUID: number = 0;
    VendorNumber: string= '';
    FacilityNumber: string= '';
    Facility: FacilityModel = {} as FacilityModel;
    StoreName: string= '';
    LocationName: string= '';
    AddressLine1: string= '';
    AddressLine2: string= '';
    City: string= '';
    StateProvice: string= '';
    PostalCode: string= '';
    PhoneNumber: string= '';
    LocCountryDialCode: string= '';
    TerminalID: string= '';
    RegionUID: string= '';
    LocationTimeStamp: Date = {} as Date;
    Facilities: LTC_Facility[] = [];
    Associates: LTC_Individual[] = [];
    HoursOfOperations: LTC_HoursOfOperation[] = [];
    CCDevice: string= '';
    CCDeviceDesc: string= '';
    SuiteNbr: string= '';
    HasUpdates: boolean = false;
    ExchCouponsAfterTax: boolean | null = false;
    VendCouponsAfterTax: boolean | null = false;
    AllowTaxExemption: boolean | null = false;
    OpenCashDrwForTips: boolean | null = false;
    PINReqdForSalesTran: boolean = false;
    BusinessModel: string= '';
    DfltCurrCode: string= '';
    DfltCurrSymbol: string= '';
    CliTimeVar: number = 0;
    StoreClosureDate: Date | null = {} as Date;
    LocTranCount: number = 0;
    EagleCashOptn: boolean | null = false;
    UseShipHndlng: boolean = false;

    constructor() {
        this.HasUpdates = false;
    }
}

