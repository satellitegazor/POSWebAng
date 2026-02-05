import { PinPadResult } from "./pinpad-result";

export class AurusGiftCardRedeemResp {
    public rslt: PinPadResult = new PinPadResult();
    public CCTID: string = '';
    public AESDKVersion: string = '';
    public ResponseCode: string = '';
    public POSID: string = '';
    public APPID: string = '';
    public ACCT_NUM: string = '';
    public CardNumber: string = '';
    public TotalApprovedAmount: number = 0;
    public ProcessorToken: string = '';
    public TransactionSequenceNumber: string = '';
    public CardToken: string = '';
    public LanguageIndicator: string = '';
    public DCCMinorUnits: string = '';
    public DCCMarginRatePercent: string = '';
    public DCCAlphaCurrencyCode: string = '';
    public DCCExchRateSrcName: string = '';
    public DCCOffered: string = '';
    public DCCResponseCode: string = '';
    public DCCValidHours: string = '';
    public DCCExchRateSrcTime: string = '';
    public DCCCurrencyCode: string = '';
    public CardType: string = '';
    public TransactionIdentifier: string = '';
    public CardExpiryDate: string = '';
    public PartialApprovedFlag: string = '';
    public TransactionTypeCode: string = '';
    public FallbackIndicator: string = '';
    public CardEntryMode: string = '';
    public TipAmount: string = '';
    public CustomerName: string = '';
    public TransactionDate: string = '';
    public CashBackAmount: string = '';
    public AddressVerification: string = '';
    public ReceiptToken: string = '';
    public BalanceAmount: number = 0;
    public ReferenceNumber: string = '';
    public GiftCardTypePassCode: string = '';
    public LangIndicator: string = '';
    public EMVFlag: string = '';
    public SubCardType: string = '';
    public SignatureReceiptFlag: string = '';
    public ApprovalCode: string = '';
    public TransactionAmount: string = '';
    public TransactionTime: string = '';
    public ProcessorResponseCode: string = '';
    public EMVData: string = '';
    public VoidData: string = '';
    public AuthorizedAmount: number = 0;
    public ResponseText: string = '';
    public ProcessorResponseText: string = '';
    public BatchNumber: string = '';
    public AurusPayTicketNum: string = '';
    public CardEndingNbr: string = '';
}

export class GCRedeemInput {
    TranId: number;
    TndrId: number;
    IndivId: number;
    EncCardNbr: string;
    TranAmt: number;

    constructor(
        tranId: number,
        tndrId: number,
        indivId: number,
        encCardNbr: string,
        tranAmt: number
    ) {
        this.TranId = tranId;
        this.TndrId = tndrId;
        this.IndivId = indivId;
        this.EncCardNbr = encCardNbr;
        this.TranAmt = tranAmt;
    }

    // Optional: static factory method for creating from object/JSON
    static fromJSON(data: Partial<GCRedeemInput>): GCRedeemInput {
        return new GCRedeemInput(
            data.TranId ?? 0,
            data.TndrId ?? 0,
            data.IndivId ?? 0,
            data.EncCardNbr ?? '',
            data.TranAmt ?? 0
        );
    }

    // Optional: toJSON method for serialization
    toJSON(): Record<string, any> {
        return {
            TranId: this.TranId,
            TndrId: this.TndrId,
            IndivId: this.IndivId,
            EncCardNbr: this.EncCardNbr,
            TranAmt: this.TranAmt,
        };
    }

    // Optional: nice string representation for debugging
    toString(): string {
        return `GCRedeemInput(TranId=${this.TranId}, TndrId=${this.TndrId}, IndivId=${this.IndivId}, EncCardNbr=${this.EncCardNbr}, TranAmt=${this.TranAmt})`;
    }
}