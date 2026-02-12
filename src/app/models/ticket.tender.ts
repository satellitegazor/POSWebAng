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

    public static deepCopyTenderList(sourceList: TicketTender[]) {
        let destList: TicketTender[] = [];
        sourceList.forEach(tndr => {
            let destTender = TicketTender.deepCopy(tndr);
            destList.push(destTender);            
        });
        return destList;
    }

    public static deepCopy(source: TicketTender | null | undefined): TicketTender {
        const copy = new TicketTender();

        if (!source) {
            return copy; // return default instance if source is null/undefined
        }

        let pinPadTenderTypes = ['XC', 'XR', 'MS', 'MR', 'EG'];

        // Numbers
        copy.ticketTenderId = source.ticketTenderId ?? 0;
        copy.tenderTypeId = source.tenderTypeId ?? 0;
        copy.tenderTransactionId = source.tenderTransactionId ?? 0;
        copy.displayOrder = source.displayOrder ?? 0;
        copy.tenderAmount = source.tenderAmount ?? 0;
        copy.changeDue = source.changeDue ?? 0;
        copy.fcChangeDue = source.fcChangeDue ?? 0;
        copy.cardBalance = source.cardBalance ?? 0;
        copy.fcTenderAmount = source.fcTenderAmount ?? 0;
        copy.tipAmount = source.tipAmount ?? 0;
        copy.fcTipAmount = source.fcTipAmount ?? 0;
        copy.tenderStatus = source.tenderStatus ?? 0;
        copy.cliTimeVar = source.cliTimeVar ?? 0;
        copy.partPayId = source.partPayId ?? 0;
        copy.partPayAmount = source.partPayAmount ?? 0;
        copy.partPayAmountFC = source.partPayAmountFC ?? 0;

        // Strings
        copy.tenderTypeCode = source.tenderTypeCode ?? '';
        copy.tenderTypeDesc = (source.tenderTypeDesc == null || source.tenderTypeDesc == 'Credit Card') ? (pinPadTenderTypes.includes(source.tenderTypeCode) ? 'pinpad' : '' ) : '';
        copy.cardEndingNbr = source.cardEndingNbr ?? '';
        copy.tracking = source.tracking ?? '';
        copy.traceId = source.traceId ?? '';
        copy.authNbr = source.authNbr ?? '';
        copy.rrn = source.rrn ?? '';
        copy.fcCurrCode = source.fcCurrCode ?? '';
        copy.transactionNumber = source.transactionNumber ?? '';
        copy.tndMaintUserId = source.tndMaintUserId ?? '';
        copy.exchCardType = source.exchCardType ?? '';
        copy.exchCardPymntType = source.exchCardPymntType ?? '';
        copy.cardEntryMode = source.cardEntryMode ?? '';
        copy.signatureType = source.signatureType ?? '';
        copy.milstarPlanNum = source.milstarPlanNum ?? '';
        copy.checkNumber = source.checkNumber ?? '';
        copy.ctroutd = source.ctroutd ?? '';
        copy.refundAuthNbr = source.refundAuthNbr ?? '';
        copy.inStoreCardNbrTmp = source.inStoreCardNbrTmp ?? '';
        copy.voidRRN = source.voidRRN ?? '';
        copy.refundCardNbr = source.refundCardNbr ?? '';
        copy.refundCardType = source.refundCardType ?? '';
        copy.refundCardEntryMode = source.refundCardEntryMode ?? '';
        copy.refundEmvCvm = source.refundEmvCvm ?? '';

        // Booleans
        copy.isRefundType = source.isRefundType ?? false;
        copy.isSignature = source.isSignature ?? false;
        copy.isAuthorized = source.isAuthorized ?? false;
        copy.isDiscoverMilstar = source.isDiscoverMilstar ?? false;

        // Dates – safe cloning
        copy.tndMaintTimestamp = source.tndMaintTimestamp
            ? new Date(source.tndMaintTimestamp)
            : new Date();

        copy.tndrTimeStamp = source.tndrTimeStamp
            ? new Date(source.tndrTimeStamp)
            : new Date();

        return copy;
    }

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
 