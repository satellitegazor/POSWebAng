import { MobileBase } from "./mobile.base";

export class TicketTender {
    ticketTenderId!: number;
    tenderTypeId!: number;
    tenderTransactionId!: number;
    tenderTypeCode!: string;
    tenderTypeDesc!: string;
    isRefundType!: boolean;
    isSignature!: boolean;
    displayOrder!: number;
    cardEndingNbr!: string;
    tracking!: string;
    traceId!: string;
    authNbr!: string;
    rrn!: string;

    tenderAmount!: number;
    changeDue!: number;
    fcChangeDue!: number;
    cardBalance!: number;
    fcTenderAmount!: number;
    fcCurrCode!: string;

    transactionNumber!: string;
    tndMaintTimestamp!: Date;
    tndMaintUserId!: string;
    tipAmount!: number;
    fcTipAmount!: number;

    exchCardType!: string;
    exchCardPymntType!: string;
    cardEntryMode!: string;

    signatureType!: string;
    milstarPlanNum!: string;
    checkNumber!: string;

    isAuthorized!: boolean;
    ctroutd!: string;
    tenderStatus!: number;
    cliTimeVar!: number;
    refundAuthNbr!: string;
    inStoreCardNbrTmp!: string;
    voidRRN!: string;
    tndrTimeStamp!: Date;
    refundCardNbr!: string;
    refundCardType!: string;
    refundCardEntryMode!: string;
    refundEmvCvm!: string;
    isDiscoverMilstar!: boolean;
    partPayId!: number;
    partPayAmount!: number;
    partPayAmountFC!: number;
}

export class SaveTenderResult {

    ticketTenderId!: number;
    partPayId!: number;
    rrn: string = '';
}

export class SaveTenderResultModel {

    public results: MobileBase = {} as MobileBase;
    public data: SaveTenderResult = {} as SaveTenderResult;
}

export class TenderStatusType {
    public static readonly InProgress: number = 1;
    public static readonly Cancelled: number = 2;
    public static readonly Declined: number = 3;
    public static readonly Complete: number = 4;
    public static readonly Voided: number = 5;
    public static readonly CannotVoid: number = 6;
    public static readonly NotAuthorized: number = 7;
    public static readonly SystemVoided: number = 8;
}

// export class TicketTender {
//     public ticketTenderId: number = 0;
//     public tenderTypeId: number = 0;
//     public tenderTransactionId: number = 0;
//     public tenderTypeCode: string = '';
//     public tenderTypeDesc: string = '';
//     public isRefundType: boolean = false;
//     public displayOrder: number = 0;
//     public cardEndingNbr: string = '';
//     public tracking: string = '';
//     public traceId: string = '';
//     public authNbr: string = '';
//     public tenderAmount: number = 0;
//     public fCTenderAmount: number = 0;
//     public changeDue: number = 0;
//     public fCChangeDue: number = 0;
//     public cardBalance: number = 0;
//     public fCCurrCode: string = '';
//     public transactionNumber: string = '';
//     public tndMaintTimestamp: Date = {} as Date;
//     public tndMaintUserId: string = '';
//     public tipAmount: number = 0;
//     public fCTipAmount: number = 0;
//     public rRN: string = '';
//     public milstarPlanNum: string = '';
//     public checkNumber: string = '';
//     public currCode: string = '';
//     public tenderStatus: number = 1;
//  }
 