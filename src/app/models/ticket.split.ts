import { SalesTransactionCheckoutItem } from "../longterm/models/salesTransactionCheckoutItem";
import { LTC_Ticket } from "../longterm/models/ticket.list";
import { UtilService } from "../services/util.service";
import { AssociateSaleTips } from "./associate.sale.tips";
import { LTC_Customer } from "./customer";
import { ExchCardTndr } from "./exch.card.tndr";
import { MobileBase } from "./mobile.base";
import { TicketTender, TranStatusType } from "./ticket.tender";

export class TicketSplit {

    ticketRRN: string = '';
    transactionDate: Date = new Date(); // or string if you prefer ISO strings
    individualUID: number = 0;
    locationUID: number = 0;
    taxExempted: boolean = false;
    transactionID: number = 0;
    ticketNumber: number = 0;
    cancelTransactionID: number = 0;
    isRefund: boolean = false;
    balanceDue: number = 0;
    instructions: string = '';
    ticketTenderList: TicketTender[] = [];
    updateCustomer: boolean = false;
    customerId: number = 0;
    customer: LTC_Customer = new LTC_Customer();
    totalSale: number = 0;
    totalSaleFC: number = 0;
    tktList: SalesTransactionCheckoutItem[] = [];
    refundReason: string = '';
    refundCode: string = '';
    isPartialPay: boolean = false;
    partPayId: number = 0;           // long → number
    partialAmount: number = 0;
    partialAmountFC: number = 0;
    updateCoupons: boolean = false;
    associateTips: AssociateSaleTips[] = [];
    tCouponPerc: number = 0;
    tCouponAmt: number = 0;
    tDCouponAmt: number = 0;
    cliTimeVar: number = 0;
    shipHandling: number = 0;
    shipHandlingTaxAmt: number = 0;
    shipHandlingFC: number = 0;
    shipHandlingTaxAmtFC: number = 0;
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
    // Optional constructor for partial initialization (very common in TS)
    constructor(init?: Partial<TicketSplit>) {
        Object.assign(this, init);
    }
}

export function mapLtcTicketToTicketSplit(ltc: LTC_Ticket): TicketSplit {
    const split = new TicketSplit(); // assuming TicketSplit has a default constructor

    // Core ticket fields
    split.locationUID = ltc.locationUID ?? 0;
    split.transactionID = ltc.transactionID ?? 0;
    split.ticketNumber = ltc.ticketNumber;
    split.cancelTransactionID = 0;
    split.isRefund = false;
    split.balanceDue = ltc.balanceDue ?? 0;

    split.customerId = ltc.customer != null ? ltc.customer.customerUID : 0;
    split.shipHandling = ltc.shipHandling ?? 0;
    split.shipHandlingTaxAmt = ltc.shipHandlingTaxAmt ?? 0;
    split.shipHandlingFC = ltc.shipHandling ?? 0;

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
            let item: SalesTransactionCheckoutItem = SalesTransactionCheckoutItem.deepCopy(inCompleteTicketItem);
            split.tktList.push(item);
        });
    }
    //split.tktList = JSON.parse(JSON.stringify(ltc.items))

    // Customer (assuming LTC_Customer → your customer model)
    split.customer = ltc.customer ? { ...ltc.customer } : {} as LTC_Customer;

    return split;
}

export class SaveTicketResultsModel {

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
    public ticketDetailList: TicketDetailListAry[] = [] as TicketDetailListAry[];
    public changeDueUSD: number = 0;
    public changeDueFC: number = 0;

}

export class TicketDetailListAry {
    public saleAssociateId: number = 0;
    public ticketDetailId: number = 0;
    public individualLocationUID: number = 0;
    public salesItemUID: number = 0;
}

export class TicketTotals {
    public amtPaidDC: number = 0;
    public amtPaidNDC: number = 0;
    public subTotalDC: number = 0;
    public subTotalNDC: number = 0;
    public grandTotalDC: number = 0;
    public grandTotalNDC: number = 0;
    public totalExchCpnAmtDC: number = 0;
    public totalExchCpnAmtNDC: number = 0;
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