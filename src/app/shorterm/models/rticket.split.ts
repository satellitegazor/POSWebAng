import { LTC_Individual, ROV_Event } from "../../longterm/models/ticket.list";
import { SalesTransactionCheckoutItem } from "../../longterm/models/salesTransactionCheckoutItem";
import { AssociateSaleTips } from "../../models/associate.sale.tips";
import { LTC_Customer } from "../../models/customer";
import { ExchCardTndr } from "../../models/exch.card.tndr";
import { MobileBase } from "../../models/mobile.base";
import { TicketTender, TranStatusType } from "../../models/ticket.tender";
import { Rov_SalesTranCheckoutItem } from "./r-salestran-checkout-item"

export class ROV_POSTicketSplit {
    ticketRrn: string = '';
    eventId: number = 0;
    transactionDate: Date = new Date(0);
    individualUid: number = 0;
    taxExempted: boolean = false;
    transactionID: number = 0;
    ticketNumber: number = 0;
    cancelTransactionId: number = 0;
    isRefund: boolean = false;
    balanceDue: number = 0;
    instructions: string = '';
    ticketTenderList: TicketTender[] = [];
    updateCustomer: boolean = false;
    customerId: number = 0;
    customer: LTC_Customer = new LTC_Customer();
    totalSale: number = 0;
    totalSaleFc: number = 0;
    tktList: Rov_SalesTranCheckoutItem[] = [];
    refundReason: string = '';
    refundCode: string = '';
    isPartialPay: boolean = false;
    partialAmount: number = 0;
    partialAmountFC: number = 0;
    updateCoupons: boolean = false;
    associateTips: AssociateSaleTips[] = [];
    tCouponPerc: number = 0;
    tCouponAmt: number = 0;
    tDCouponAmt: number = 0;
    orderFormNum: string = '';
    shipHandling: number = 0;
    shipHandlingTaxAmt: number = 0;
    shipHandlingFC: number = 0;
    shipHandlingTaxAmtFC: number = 0;
    cliTimeVar: number = 0;
    vMTndr: ExchCardTndr[] = [];     // changed from single object to array as per your code
    tranStatus: number = 0;
    voidType: string = '';
    voidTypeDesc: string = '';
    tabSerialNum: string = '';
    ipAddress: string = '';
    isSplitPayR5: boolean = false;
    fromLinuxTab: boolean = false;
    tipAmountDC: number = 0;
    tipAmountNDC: number = 0;
}

export function mapLtcTicketToTicketSplit(ltc: ROV_Ticket): ROV_POSTicketSplit {
    const split = new ROV_POSTicketSplit(); // assuming RTicketSplit has a default constructor
    const rawTicket = ltc as any;

    // Core ticket fields
    split.eventId = ltc.eventID ?? 0;
    split.transactionID = ltc.transactionID ?? 0;
    split.ticketNumber = ltc.ticketNumber;
    split.cancelTransactionId = 0;
    split.isRefund = false;
    split.balanceDue = ltc.balanceDue ?? 0;

    split.customerId = ltc.customer != null ? ltc.customer.customerUID : 0;
    split.shipHandling = ltc.shipHandling ?? 0;
    split.shipHandlingTaxAmt = ltc.shipHandlingTaxAmt ?? 0;
    split.shipHandlingFC = rawTicket.fCShipHandling ?? rawTicket.fcShipHandling ?? rawTicket.shipHandlingFC ?? 0;
    split.shipHandlingTaxAmtFC = rawTicket.fCShipHandlingTaxAmt ?? rawTicket.fcShipHandlingTaxAmt ?? rawTicket.shipHandlingTaxAmtFC ?? 0;

    split.taxExempted = ltc.taxExempted == 0 ? false : true;
    split.transactionDate = ltc.transactionDate ? new Date(ltc.transactionDate) : new Date();
    split.tranStatus = TranStatusType.InProgress;

     if(ltc.tenders.length > 0) {
         ltc.tenders.forEach(inCompleteTender => {
            let tndr : TicketTender = TicketTender.deepCopy(inCompleteTender);
            split.ticketTenderList.push(tndr);
        });
    }

    if(ltc.items.length > 0) {
        ltc.items.forEach(inCompleteTicketItem => {
            let item: Rov_SalesTranCheckoutItem = Rov_SalesTranCheckoutItem.deepCopy(inCompleteTicketItem);
            split.tktList.push(item);
        });
    }
    //split.tktList = JSON.parse(JSON.stringify(ltc.items))

    // Customer (assuming LTC_Customer → your customer model)
    split.customer = ltc.customer ? { ...ltc.customer } : {} as LTC_Customer;

    return split;
}

export class RSaveTicketResultsModel {

    public results: MobileBase = {} as MobileBase;
    public transactionId: number = 0;
    public pOSResponse: string = '';
    public pOSAuthNumber: string = '';
    public balanceDue: number = 0;
    public totalAmount: number = 0;
    public tenderTypeCode: string = '';
    public mSCN: string = '';
    public ticketNumber: number = 0;
    public ticketTenderId: number = 0;
    public partPayId: number = 0;
    public refundCount: number = 0;
    public ticketDetailList: RTicketDetailListAry[] = [] as RTicketDetailListAry[];
    public changeDueUSD: number = 0;
    public changeDueFC: number = 0;

}

export class RTicketDetailListAry {
    public saleAssociateId: number = 0;
    public ticketDetailId: number = 0;
    public individualLocationUID: number = 0;
    public salesItemUID: number = 0;
    public salesItemDesc: string = '';
    public isMiscellaneous: boolean = false;
}

export class RTicketTotals {
    public amtPaidDC: number = 0;
    public amtPaidNDC: number = 0;
    public subTotalDC: number = 0;
    public subTotalNDC: number = 0;
    public grandTotalDC: number = 0;
    public grandTotalNDC: number = 0;
    public tranExchCpnAmtDC: number = 0;
    public tranExchCpnAmtNDC: number = 0;
    public exchCpnPct: number = 0;
    public totalSavingsDC: number = 0;
    public totalSavingsNDC: number = 0;
    public totalTaxDC: number = 0;
    public totalTaxNDC: number = 0;
    public tipTotalDC: number = 0;
    public tipTotalNDC: number = 0;
    public partPayDC: number = 0;
    public partPayNDC: number = 0;
    public shipHandlingDC: number = 0;
    public shipHandlingNDC: number = 0;
    public shipHandlingTaxAmtDC: number = 0;
    public shipHandlingTaxAmtNDC: number = 0;
}

export class ROV_Ticket {
    public eventID: number = 0;
    public ticketNumber: number = 0;
    public transactionID: number = 0;
    public contractUID: number = 0;
    public transactionDate: Date = {} as Date;
    public taxExempted: number = 0;
    public ticketInstructions: string = '';
    public maintTimestamp: Date = {} as Date;
    public maintUserId: string = '';
    public amountPaid: number = 0;
    public amountPaidFC: number = 0;
    public balanceDue: number = 0;
    public balanceDueFC: number = 0;
    public partPayments: number = 0;
    public isPartial: number = 0;
    public isFullyPaid: boolean = false;
    public exchCouponsAfterTax: boolean = false;
    public vendCouponsAfterTax: boolean = false;
    public allowTaxExemption: boolean = false;
    public refundReasonCode: string = '';
    public refundReasonText: string = '';
    public tranCouponPercent: number = 0;
    public tranCouponAmount: number = 0;
    public fCTranCouponAmount: number = 0;
    public isSignCaptured: boolean = false;
    public isOConus: boolean = false;
    public dfltCurrCode: string = '';
    public cntrctCurrCode: string = '';
    public dfltCurrSymbol: string = '';
    public cntrctCurrSymbol: string = '';
    public dfltCurrHtml: string = '';
    public cntrctCurrHtml: string = '';
    public cntrctCntryDialCode: string = '';

    public individual: LTC_Individual = {} as LTC_Individual;
    public event: ROV_Event = {} as ROV_Event;
    public tenders: TicketTender[] = [];
    public items: Rov_SalesTranCheckoutItem[] = [];
    public customer: LTC_Customer = {} as LTC_Customer;
    public ticketCancel: ROV_TicketCancel = {} as ROV_TicketCancel;
    public shipHandling: number = 0;
    public shipHandlingTaxAmt: number = 0;
    public fCShipHandling: number = 0;
    public fCShipHandlingTaxAmt: number = 0;
    public prprtyClausDays: string = '';
    public bfCode: string = '';
    public dailyExchRate: any = null;
}

export class ROV_TicketCancel {
    ticketCancelId: number = 0;
    cancelTransactionID: number = 0;
    ticketCancelTypeId: number = 0;
    otherReason: string = '';
    tcMaintTimestamp: Date = {} as Date;
    tcMaintUserId: string = '';
    ticketCancelTypeCode: string = '';
    ticketCancelTypeDesc: string = '';
}

export class ROV_TicketCancelResultsModel {
    results: MobileBase = {} as MobileBase;
    tktCancel: ROV_TicketCancel = new ROV_TicketCancel();
}