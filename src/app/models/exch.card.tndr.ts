import { PinPadResult } from "../longterm/saletran/services/models/pinpad-result";

export class ExchCardTndr {
    public rslt: PinPadResult = new PinPadResult();
    public Result: string = '';
    public ResponseText: string = '';
 
    public CUSTOMER_ZIP: string = '';
    public MERCH_REF: string = '';
    public MERCH_DECL: string = '';
    public CVV2_CODE: string = '';
    public AVS_CODE: string = '';
    public CARD_EXP_YEAR: number = 0;
    public CARD_EXP_MONTH: number = 0;
    public CARDHOLDER: string = '';
    public EMV_REVERSAL_TYPE: number = 0;
    public PRESWIPED: number = 0;
    public EMV_TAG_9F35: string = '';
    public INVOICE: string = '';
    public FIRST6_LAST4: string = '';
    public MACHINE_NAME: string = '';
    public RESPONSE_XML: string = '';
    public ticketTenderId: number = 0;
    public transactionId: number = 0;


    public resultCode: string = '';
    public TerminationStatus: string = '';
    public Counter: number = 0;
    public TRANS_SEQ_NUM: string = '';
    public INTRN_SEQ_NUM: string = '';
    public TROUTD: string = '';
    public CTROUTD: string = '';
    public lPTOKEN: string = '';
    public CARD_TOKEN: string = '';
    public PAYMENT_TYPE: string = '';
    public PAYMENT_MEDIA: string = '';
    public PPCV: string = '';
    public CARD_ABBRV: string = '';
    public sUB_CARD_TYPE: string = '';
    public EBT_TYPE: string = '';
    public ACCT_NUM: string = '';
    public AUTH_CODE: string = '';
    public AVAILABLE_BALANCE: number = 0;
    public APPROVED_AMOUNT: number = 0;
    public ORIG_TRANS_AMOUNT: number = 0;
    public DIFF_AMOUNT_DUE: number = 0;
    public FSA_AMOUNT: number = 0;
    public CASHBACK_AMNT: number = 0;
    public TIP_AMOUNT: number = 0;
    public FS_AVAIL_BALANCE: number = 0;
    public CB_AVAIL_BALANCE: number = 0;
    public CARD_ENTRY_MODE: string = '';
    public AUTH_RESP_CODE: string = '';
    public HOST_RESPCODE: string = '';
    public HESPONSE_CODE: string = '';
    public AUTHNWID: string = '';
    public AUTHNWNAME: string = '';
    public BANK_USERDATA: string = '';
    public EMBOSSED_ACCT_NUM: string = '';
    public SAF_NUM: string = '';
    public MERCHID: string = '';
    public TERMID: string = '';
    public RECEIPT_DATA: string = '';
    public TRANS_DATE: string = '';
    public TRANS_TIME: string = '';
    public BATCH_TRACE_ID: string = '';
    public TRAINING_MODE: string = '';
    public POS_RECON: string = '';
    public VSP_CODE: string = '';
    public VSP_RESULTDESC: string = '';
    public VSP_TRXID: string = '';
    public SIGNATUREDATA: string = '';
    public MIME_TYPE: string = '';
    public EMV_TAG_4F: string = '';
    public EMV_TAG_50: string = '';
    public EMV_TAG_5F2A: string = '';
    public EMV_TAG_5F34: string = '';
    public EMV_TAG_82: string = '';
    public EMV_TAG_8A: string = '';
    public EMV_TAG_95: string = '';
    public EMV_TAG_9A: string = '';
    public EMV_TAG_9B: string = '';
    public EMV_TAG_9C: string = '';
    public EMV_TAG_9F02: string = '';
    public EMV_TAG_9F03: string = '';
    public vEMV_TAG_9F07: string = '';
    public EMV_TAG_9F0D: string = '';
    public EMV_TAG_9F0E: string = '';
    public EMV_TAG_9F0F: string = '';
    public EMV_TAG_9F10: string = '';
    public EMV_TAG_9F12: string = '';
    public EMV_TAG_9F1A: string = '';
    public EMV_TAG_9F26: string = '';
    public EMV_TAG_9F27: string = '';
    public EMV_TAG_9F34: string = '';
    public EMV_TAG_9F36: string = '';
    public EMV_TAG_9F37: string = '';
    public EMV_MODE: string = '';
    public EMV_CVM: string = '';
    public EMV_CHIP_INDICATOR: string = '';
    public TAC_DEFAULT: string = '';
    public TAC_DENIAL: string = '';
    public TAC_ONLINE: string = '';
    public EMV_TAG_84: string = '';
    public EMV_TAG_9F21: string = '';
    public EMV_TAG_9F08: string = '';
    public EMV_TAG_9F09: string = '';
    public EMV_TAG_9F33: string = '';
    public MachineName: string = '';
    public PinPadSerialNum: string = '';
    public ResponseXml: string = '';
    public VFONE_WEBSRV_VER: string = '';
    public RRN: string = '';


    public copyFrom(src: ExchCardTndr): void {
        if (!src) {
            return;
        }

        // Deep copy nested object
        this.rslt = src.rslt ? Object.assign(new PinPadResult(), src.rslt) : new PinPadResult();

        this.Result = src.Result;
        this.ResponseText = src.ResponseText;

        this.CUSTOMER_ZIP = src.CUSTOMER_ZIP;
        this.MERCH_REF = src.MERCH_REF;
        this.MERCH_DECL = src.MERCH_DECL;
        this.CVV2_CODE = src.CVV2_CODE;
        this.AVS_CODE = src.AVS_CODE;
        this.CARD_EXP_YEAR = src.CARD_EXP_YEAR;
        this.CARD_EXP_MONTH = src.CARD_EXP_MONTH;
        this.CARDHOLDER = src.CARDHOLDER;
        this.EMV_REVERSAL_TYPE = src.EMV_REVERSAL_TYPE;
        this.PRESWIPED = src.PRESWIPED;
        this.EMV_TAG_9F35 = src.EMV_TAG_9F35;
        this.INVOICE = src.INVOICE;
        this.FIRST6_LAST4 = src.FIRST6_LAST4;
        this.MACHINE_NAME = src.MACHINE_NAME;
        this.RESPONSE_XML = src.RESPONSE_XML;
        this.ticketTenderId = src.ticketTenderId;
        this.transactionId = src.transactionId;

        this.resultCode = src.resultCode;
        this.TerminationStatus = src.TerminationStatus;
        this.Counter = src.Counter;
        this.TRANS_SEQ_NUM = src.TRANS_SEQ_NUM;
        this.INTRN_SEQ_NUM = src.INTRN_SEQ_NUM;
        this.TROUTD = src.TROUTD;
        this.CTROUTD = src.CTROUTD;
        this.lPTOKEN = src.lPTOKEN;
        this.CARD_TOKEN = src.CARD_TOKEN;
        this.PAYMENT_TYPE = src.PAYMENT_TYPE;
        this.PAYMENT_MEDIA = src.PAYMENT_MEDIA;
        this.PPCV = src.PPCV;
        this.CARD_ABBRV = src.CARD_ABBRV;
        this.sUB_CARD_TYPE = src.sUB_CARD_TYPE;
        this.EBT_TYPE = src.EBT_TYPE;
        this.ACCT_NUM = src.ACCT_NUM;
        this.AUTH_CODE = src.AUTH_CODE;
        this.AVAILABLE_BALANCE = src.AVAILABLE_BALANCE;
        this.APPROVED_AMOUNT = src.APPROVED_AMOUNT;
        this.ORIG_TRANS_AMOUNT = src.ORIG_TRANS_AMOUNT;
        this.DIFF_AMOUNT_DUE = src.DIFF_AMOUNT_DUE;
        this.FSA_AMOUNT = src.FSA_AMOUNT;
        this.CASHBACK_AMNT = src.CASHBACK_AMNT;
        this.TIP_AMOUNT = src.TIP_AMOUNT;
        this.FS_AVAIL_BALANCE = src.FS_AVAIL_BALANCE;
        this.CB_AVAIL_BALANCE = src.CB_AVAIL_BALANCE;
        this.CARD_ENTRY_MODE = src.CARD_ENTRY_MODE;
        this.AUTH_RESP_CODE = src.AUTH_RESP_CODE;
        this.HOST_RESPCODE = src.HOST_RESPCODE;
        this.HESPONSE_CODE = src.HESPONSE_CODE;
        this.AUTHNWID = src.AUTHNWID;
        this.AUTHNWNAME = src.AUTHNWNAME;
        this.BANK_USERDATA = src.BANK_USERDATA;
        this.EMBOSSED_ACCT_NUM = src.EMBOSSED_ACCT_NUM;
        this.SAF_NUM = src.SAF_NUM;
        this.MERCHID = src.MERCHID;
        this.TERMID = src.TERMID;
        this.RECEIPT_DATA = src.RECEIPT_DATA;
        this.TRANS_DATE = src.TRANS_DATE;
        this.TRANS_TIME = src.TRANS_TIME;
        this.BATCH_TRACE_ID = src.BATCH_TRACE_ID;
        this.TRAINING_MODE = src.TRAINING_MODE;
        this.POS_RECON = src.POS_RECON;
        this.VSP_CODE = src.VSP_CODE;
        this.VSP_RESULTDESC = src.VSP_RESULTDESC;
        this.VSP_TRXID = src.VSP_TRXID;
        this.SIGNATUREDATA = src.SIGNATUREDATA;
        this.MIME_TYPE = src.MIME_TYPE;

        this.EMV_TAG_4F = src.EMV_TAG_4F;
        this.EMV_TAG_50 = src.EMV_TAG_50;
        this.EMV_TAG_5F2A = src.EMV_TAG_5F2A;
        this.EMV_TAG_5F34 = src.EMV_TAG_5F34;
        this.EMV_TAG_82 = src.EMV_TAG_82;
        this.EMV_TAG_8A = src.EMV_TAG_8A;
        this.EMV_TAG_95 = src.EMV_TAG_95;
        this.EMV_TAG_9A = src.EMV_TAG_9A;
        this.EMV_TAG_9B = src.EMV_TAG_9B;
        this.EMV_TAG_9C = src.EMV_TAG_9C;
        this.EMV_TAG_9F02 = src.EMV_TAG_9F02;
        this.EMV_TAG_9F03 = src.EMV_TAG_9F03;
        this.vEMV_TAG_9F07 = src.vEMV_TAG_9F07;
        this.EMV_TAG_9F0D = src.EMV_TAG_9F0D;
        this.EMV_TAG_9F0E = src.EMV_TAG_9F0E;
        this.EMV_TAG_9F0F = src.EMV_TAG_9F0F;
        this.EMV_TAG_9F10 = src.EMV_TAG_9F10;
        this.EMV_TAG_9F12 = src.EMV_TAG_9F12;
        this.EMV_TAG_9F1A = src.EMV_TAG_9F1A;
        this.EMV_TAG_9F26 = src.EMV_TAG_9F26;
        this.EMV_TAG_9F27 = src.EMV_TAG_9F27;
        this.EMV_TAG_9F34 = src.EMV_TAG_9F34;
        this.EMV_TAG_9F36 = src.EMV_TAG_9F36;
        this.EMV_TAG_9F37 = src.EMV_TAG_9F37;
        this.EMV_MODE = src.EMV_MODE;
        this.EMV_CVM = src.EMV_CVM;
        this.EMV_CHIP_INDICATOR = src.EMV_CHIP_INDICATOR;
        this.TAC_DEFAULT = src.TAC_DEFAULT;
        this.TAC_DENIAL = src.TAC_DENIAL;
        this.TAC_ONLINE = src.TAC_ONLINE;
        this.EMV_TAG_84 = src.EMV_TAG_84;
        this.EMV_TAG_9F21 = src.EMV_TAG_9F21;
        this.EMV_TAG_9F08 = src.EMV_TAG_9F08;
        this.EMV_TAG_9F09 = src.EMV_TAG_9F09;
        this.EMV_TAG_9F33 = src.EMV_TAG_9F33;

        this.MachineName = src.MachineName;
        this.PinPadSerialNum = src.PinPadSerialNum;
        this.ResponseXml = src.ResponseXml;
        this.VFONE_WEBSRV_VER = src.VFONE_WEBSRV_VER;
        this.RRN = src.RRN;
    }

}

export class SaveExchCardTndrResult {
    public exchCardTndrId: number = 0;
    public ticketTenderId: number = 0;
}

export class SaveExchCardTndrResultModel {
    public data: SaveExchCardTndrResult = new SaveExchCardTndrResult();
    public message: string = '';
    public success: boolean = false;
}