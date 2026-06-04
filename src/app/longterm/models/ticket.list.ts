import { RouterEvent } from "@angular/router";
import { MobileBase } from "../../models/mobile.base";
import { LTC_Customer } from "../../models/customer";
import { TicketTender } from "../../models/ticket.tender";
import { SalesTransactionCheckoutItem } from "./salesTransactionCheckoutItem";
import { LTC_HoursOfOperation, LTC_StoreLocation } from "./store.location";

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
    departmentUID: number = 0;
    departmentTypeUID: number = 0;
    description: string = '';
    facilityUID: number = 0;
    feePercent: number = 0;
    salesTaxPct: number = 0;
    active: boolean = false;
    maintTimestamp: Date | null = {} as Date;
    maintUserId: number = 0;
    eventUID: number = 0;
    eventName: string = '';
    locationUID: number = 0;
    locationName: string = '';
    allowTaxExemption: boolean = false;
    exchCouponsAfterTax: boolean = false;
    vendCouponsAfterTax: boolean = false;
    bfCode: string = '';
    allowPartPay: boolean = false;
    allowTips: boolean = false;
    allowSaveTkt: boolean = false;
    businessModel: number = 0;
    allowTags: boolean = false;
    custInfoReq: boolean = false;
    defaultCurrency: string = '';
    hasUpdates: boolean = false;
    allowZeroPrcntFee: boolean = false;

    constructor() {
        this.hasUpdates = false;
    }
}


export class ROV_Event {
    eventID: number = 0;
    eventName: string = '';
    suiteNbr: string = '';
    facilityNumber: string = '';
    facilityUid: number = 0;
    vendorAssociateId: number = 0;
    exchangeNumber: string = '';
    vendorNumber: string = '';
    dayStarted: boolean = false;
    eventPin: string = '';
    eventStartDate: Date = {} as Date;
    eventEndDate: Date = {} as Date;
    facilityTerminal: string = '';
    flatFeeDollarAmount: number = 0;
    contractUid: number = 0;
    contractStartDate: Date = {} as Date;
    contractEndDate: Date = {} as Date;
    lastEodSubmit: Date = {} as Date;
    mustEnterPinEachTxn: string = '';
    vendorEPaid: string = '';
    milStarTxnFee: number = 0;
    salesTaxPct: number = 0;
    saleTaxSaved: boolean = false;
    eventEnded: boolean = false;
    maintTimestamp: Date = {} as Date;
    maintUserId: string = '';
    termsNetDays: number = 0;
    chargeToFacilityNbr: string = '';
    merchantAccountNbr: string = '';
    walkerProcessed: boolean = false;
    exchRegion: string = '';
    walkerInvoiceNbr: string = '';
    contractNumber: string = '';
    iglasProcessed: boolean = false;
    iglasProcessedDate: Date = {} as Date;
    walkerProcessedDate: Date = {} as Date;
    vendorConfirmEventTimestamp: Date = {} as Date;
    resetPin: boolean = false;
    tempPin: string = '';
    allowTaxExemption: string = '';
    emailAddress: string = '';
    eventAssociateId: number = 0;
    exchCouponsAfterTax: boolean = false;
    vendCouponsAfterTax: boolean = false;
    feeTypeId: number = 0;
    feeTypeCode: string = '';
    cposRegionId: number = 0;
    ccDevice: string = '';
    ccDeviceDesc: string = '';
    isForeignCurrency: boolean = false;
    dfltCurrCode: string = '';
    countryCode: string = '';
    departments: ROV_Department[] = [];
    associates: ROV_Individual[] = [];
    hasUpdates: boolean = false;
    evntTranCount: number = 0;
    eagleCashOptn: boolean | null = false;
    useShipHndlng: boolean = false;
    evntInsuranceFee: number = 0;
    insuranceFacNbr: string = '';


}

export class ROV_Individual {
    individualUid: number = 0;
    firstName: string = "";
    lastName: string = "";
    emailAddress: string = "";
    phoneNumber: string = "";
    indCountryDialCode: string = "";
    eventUid: number = 0;
    individualRoleTypeUid: number = 0;
    pin: string = "";
    individualRoleTypeCode: string = "";
    individualRoleTypeDescription: string = "";
    hasUpdates: boolean = false;

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



// export class TicketTender {
//     ticketTenderId: number = 0;
//     tenderTypeId: number = 0;
//     tenderTransactionId: number = 0;
//     tenderTypeCode: string= "";
//     tenderTypeDesc: string= "";
//     isRefundType: boolean = false;
//     isSignature: boolean = false;
//     displayOrder: number = 0;
//     cardEndingNbr: string= "";
//     tracking: string= "";
//     traceId: string= "";
//     authNbr: string= "";
//     tenderAmount: number = 0;
//     changeDue: number = 0;
//     fCChangeDue: number = 0;
//     cardBalance: number = 0;
//     fCTenderAmount: number = 0;
//     fCCurrCode: string= "";
//     transactionNumber: string= "";
//     tndMaintTimestamp: Date = {} as Date;
//     tndMaintUserId: string= "";
//     tipAmount: number = 0;
//     fCTipAmount: number = 0;
//     exchCardType: string= "";
//     exchCardPymntType: string= "";
//     cardEntryMode: string= "";
//     signatureType: string= "";
//     milstarPlanNum: string= "";
//     checkNumber: string= "";

// }



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

export class ExchangesListModel {
    regionId!: string;
    regionName!: string;
    exchangeFacNbr!: string;
    exchangeFacName!: string;
    exchangeFacNameShort!: string;
    exchangeFacStatus!: string;
    fiscalBusinessClass!: string;
    functionNameCode!: string;
    operatingAuthcode!: string;
}

export class ExchangeRegionModel {
    regionId!: string;
    regionName!: string;
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

// class LTC_HoursOfOperation {
//     HrsOfOperationID: number = 0;
//     LocationUID: number = 0;
//     DayFrom: string = '';
//     DayTo: string = '';
//     TimeFrom: string = '';
//     TimeTo: string = '';
//     DisplayOrder: string = '';
//     HasUpdates: boolean = false;;

//     constructor() {
//         this.HasUpdates = false;
//     }
// }


// class LTC_StoreLocation {
//     LocationUID: number = 0;
//     ContractUID: number = 0;
//     VendorNumber: string= '';
//     FacilityNumber: string= '';
//     Facility: FacilityModel = {} as FacilityModel;
//     StoreName: string= '';
//     LocationName: string= '';
//     AddressLine1: string= '';
//     AddressLine2: string= '';
//     City: string= '';
//     StateProvice: string= '';
//     PostalCode: string= '';
//     PhoneNumber: string= '';
//     LocCountryDialCode: string= '';
//     TerminalID: string= '';
//     RegionUID: string= '';
//     LocationTimeStamp: Date = {} as Date;
//     Facilities: LTC_Facility[] = [];
//     Associates: LTC_Individual[] = [];
//     HoursOfOperations: LTC_HoursOfOperation[] = [];
//     CCDevice: string= '';
//     CCDeviceDesc: string= '';
//     SuiteNbr: string= '';
//     HasUpdates: boolean = false;
//     ExchCouponsAfterTax: boolean | null = false;
//     VendCouponsAfterTax: boolean | null = false;
//     AllowTaxExemption: boolean | null = false;
//     OpenCashDrwForTips: boolean | null = false;
//     PINReqdForSalesTran: boolean = false;
//     BusinessModel: string= '';
//     DfltCurrCode: string= '';
//     DfltCurrSymbol: string= '';
//     CliTimeVar: number = 0;
//     StoreClosureDate: Date | null = {} as Date;
//     LocTranCount: number = 0;
//     EagleCashOptn: boolean | null = false;
//     UseShipHndlng: boolean = false;

//     constructor() {
//         this.HasUpdates = false;
//     }
// }

