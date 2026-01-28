import { PinPadResult } from "./pinpad-result";

export class AurusGiftCardInquiryResp {
    public rslt: PinPadResult = new PinPadResult();
    public CCTID: string = '';
    public AESDKVersion: string = '';
    public ResponseCode: string = '';
    public POSID: string = '';
    public APPID: string = '';
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
    public AuthorizedAmount: string = '';
    public ResponseText: string = '';
    public ProcessorResponseText: string = '';
    public BatchNumber: string = '';
    public AurusPayTicketNum: string = '';
    public CardEndingNbr: string = '';
    public CardNbrF6L4: string = '';

    public copyFrom(src: AurusGiftCardInquiryResp): void {
        if (!src) {
            return;
        }

        // Deep copy rslt
        if (src.rslt) {
            this.rslt.IsSuccessful = src.rslt.IsSuccessful;
            this.rslt.ReturnMsg = src.rslt.ReturnMsg;
            this.rslt.VersionNum = src.rslt.VersionNum;
        }

        this.CCTID = src.CCTID;
        this.AESDKVersion = src.AESDKVersion;
        this.ResponseCode = src.ResponseCode;
        this.POSID = src.POSID;
        this.APPID = src.APPID;
        this.CardNumber = src.CardNumber;
        this.TotalApprovedAmount = src.TotalApprovedAmount;
        this.ProcessorToken = src.ProcessorToken;
        this.TransactionSequenceNumber = src.TransactionSequenceNumber;
        this.CardToken = src.CardToken;
        this.LanguageIndicator = src.LanguageIndicator;

        this.DCCMinorUnits = src.DCCMinorUnits;
        this.DCCMarginRatePercent = src.DCCMarginRatePercent;
        this.DCCAlphaCurrencyCode = src.DCCAlphaCurrencyCode;
        this.DCCExchRateSrcName = src.DCCExchRateSrcName;
        this.DCCOffered = src.DCCOffered;
        this.DCCResponseCode = src.DCCResponseCode;
        this.DCCValidHours = src.DCCValidHours;
        this.DCCExchRateSrcTime = src.DCCExchRateSrcTime;
        this.DCCCurrencyCode = src.DCCCurrencyCode;

        this.CardType = src.CardType;
        this.TransactionIdentifier = src.TransactionIdentifier;
        this.CardExpiryDate = src.CardExpiryDate;
        this.PartialApprovedFlag = src.PartialApprovedFlag;
        this.TransactionTypeCode = src.TransactionTypeCode;
        this.FallbackIndicator = src.FallbackIndicator;
        this.CardEntryMode = src.CardEntryMode;
        this.TipAmount = src.TipAmount;
        this.CustomerName = src.CustomerName;
        this.TransactionDate = src.TransactionDate;
        this.CashBackAmount = src.CashBackAmount;
        this.AddressVerification = src.AddressVerification;
        this.ReceiptToken = src.ReceiptToken;
        this.BalanceAmount = src.BalanceAmount;
        this.ReferenceNumber = src.ReferenceNumber;
        this.GiftCardTypePassCode = src.GiftCardTypePassCode;
        this.LangIndicator = src.LangIndicator;
        this.EMVFlag = src.EMVFlag;
        this.SubCardType = src.SubCardType;
        this.SignatureReceiptFlag = src.SignatureReceiptFlag;
        this.ApprovalCode = src.ApprovalCode;
        this.TransactionAmount = src.TransactionAmount;
        this.TransactionTime = src.TransactionTime;
        this.ProcessorResponseCode = src.ProcessorResponseCode;
        this.EMVData = src.EMVData;
        this.VoidData = src.VoidData;
        this.AuthorizedAmount = src.AuthorizedAmount;
        this.ResponseText = src.ResponseText;
        this.ProcessorResponseText = src.ProcessorResponseText;
        this.BatchNumber = src.BatchNumber;
        this.AurusPayTicketNum = src.AurusPayTicketNum;
        this.CardEndingNbr = src.CardEndingNbr;
        this.CardNbrF6L4 = src.CardNbrF6L4;
    }

}