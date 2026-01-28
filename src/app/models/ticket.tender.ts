import { MobileBase } from "./mobile.base";

export class TicketTender {
    ticketTenderId: number = 0;
    tenderTypeId!: number;
    tenderTransactionId: number = 0;
    tenderTypeCode: string = '';
    tenderTypeDesc: string = '';
    isRefundType: boolean = false;
    isSignature: boolean = false;
    displayOrder : number = 0;
    cardEndingNbr: string = '';
    tracking: string = '';
    traceId: string = '';
    authNbr: string = '';
    rrn: string = '';

    tenderAmount: number = 0;
    changeDue: number = 0;
    fcChangeDue: number = 0;
    cardBalance: number = 0;
    fcTenderAmount: number = 0;
    fcCurrCode: string = '';

    transactionNumber: string = '';
    tndMaintTimestamp!: Date;
    tndMaintUserId: string = '';
    tipAmount: number = 0;
    fcTipAmount: number = 0;

    exchCardType: string = '';
    exchCardPymntType: string = '';
    cardEntryMode: string = '';

    signatureType: string = '';
    milstarPlanNum: string = '';
    checkNumber: string = '';

    isAuthorized!: boolean;
    ctroutd: string = '';
    tenderStatus: number = 0;
    cliTimeVar: number = 0;
    refundAuthNbr: string = '';
    inStoreCardNbrTmp: string = '';
    voidRRN: string = '';
    tndrTimeStamp!: Date;
    refundCardNbr: string = '';
    refundCardType: string = '';
    refundCardEntryMode: string = '';
    refundEmvCvm: string = '';
    isDiscoverMilstar!: boolean;
    partPayId: number = 0;
    partPayAmount: number = 0;
    partPayAmountFC: number = 0;

    // public deepCopy(src: TicketTender): void {
    //     if (!src) {
    //         return;
    //     }

    //     this.ticketTenderId = src.ticketTenderId;
    //     this.tenderTypeId = src.tenderTypeId;
    //     this.tenderTransactionId = src.tenderTransactionId;
    //     this.tenderTypeCode = src.tenderTypeCode;
    //     this.tenderTypeDesc = src.tenderTypeDesc;
    //     this.isRefundType = src.isRefundType;
    //     this.isSignature = src.isSignature;
    //     this.displayOrder = src.displayOrder;
    //     this.cardEndingNbr = src.cardEndingNbr;
    //     this.tracking = src.tracking;
    //     this.traceId = src.traceId;
    //     this.authNbr = src.authNbr;
    //     this.rrn = src.rrn;

    //     this.tenderAmount = src.tenderAmount;
    //     this.changeDue = src.changeDue;
    //     this.fcChangeDue = src.fcChangeDue;
    //     this.cardBalance = src.cardBalance;
    //     this.fcTenderAmount = src.fcTenderAmount;
    //     this.fcCurrCode = src.fcCurrCode;

    //     this.transactionNumber = src.transactionNumber;
    //     this.tndMaintTimestamp = src.tndMaintTimestamp
    //         ? new Date(src.tndMaintTimestamp)
    //         : src.tndMaintTimestamp;
    //     this.tndMaintUserId = src.tndMaintUserId;
    //     this.tipAmount = src.tipAmount;
    //     this.fcTipAmount = src.fcTipAmount;

    //     this.exchCardType = src.exchCardType;
    //     this.exchCardPymntType = src.exchCardPymntType;
    //     this.cardEntryMode = src.cardEntryMode;

    //     this.signatureType = src.signatureType;
    //     this.milstarPlanNum = src.milstarPlanNum;
    //     this.checkNumber = src.checkNumber;

    //     this.isAuthorized = src.isAuthorized;
    //     this.ctroutd = src.ctroutd;
    //     this.tenderStatus = src.tenderStatus;
    //     this.cliTimeVar = src.cliTimeVar;
    //     this.refundAuthNbr = src.refundAuthNbr;
    //     this.inStoreCardNbrTmp = src.inStoreCardNbrTmp;
    //     this.voidRRN = src.voidRRN;
    //     this.tndrTimeStamp = src.tndrTimeStamp
    //         ? new Date(src.tndrTimeStamp)
    //         : src.tndrTimeStamp;

    //     this.refundCardNbr = src.refundCardNbr;
    //     this.refundCardType = src.refundCardType;
    //     this.refundCardEntryMode = src.refundCardEntryMode;
    //     this.refundEmvCvm = src.refundEmvCvm;
    //     this.isDiscoverMilstar = src.isDiscoverMilstar;
    //     this.partPayId = src.partPayId;
    //     this.partPayAmount = src.partPayAmount;
    //     this.partPayAmountFC = src.partPayAmountFC;
    // }

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

export class TranStatusType {
    public static readonly InProgress: number = 1;
    public static readonly Complete: number = 2;
    public static readonly Void: number = 3;

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
 