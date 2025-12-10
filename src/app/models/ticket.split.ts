import { SalesTransactionCheckoutItem } from "../longterm/models/salesTransactionCheckoutItem";
import { AssociateSaleTips } from "./associate.sale.tips";
import { LTC_Customer } from "./customer";
import { ExchCardTndr } from "./exch.card.tndr";
import { MobileBase } from "./mobile.base";
import { TicketTender } from "./ticket.tender";
 
export class TicketSplit {

    public individualUID: number = 0;
    public eventId: number = 0;
    public associateTips: AssociateSaleTips[] = [] as AssociateSaleTips[] ;
    public balanceDue: number = 0;
    public cancelTransactionID: number = 0;
    public cliTimeVar: number = 0;
    public customerId: number = 0;
    public customer: LTC_Customer = {} as LTC_Customer;
    public instructions: string = '';
    public isPartialPay: boolean = false;
    public isRefund: boolean = false;
    public locationUID: number = 0;
    public partialAmount: number = 0;
    public partialAmountFC: number = 0;
    public refundCode: string = '';
    public refundReason: string = '';
    public taxExempted: boolean = false;
    public tCouponAmt: number = 0;
    public tDCouponAmt: number = 0;
    public tCouponPerc: number = 0;
    public tktList: SalesTransactionCheckoutItem[] = [];
    public ticketTenderList: TicketTender[] = [];
    public totalSale: number = 0;
    public totalSaleFC: number = 0;
    public transactionDate: Date = {} as Date;
    public transactionID: number = 0;
    public updateCustomer: boolean = false;
    public updateCoupons: boolean = false;
    public orderFormNum: string = '';
    public shipHandling: number = 0;
    public shipHandlingTaxAmt: number = 0;
    public shipHandlingFC: number = 0;
    public shipHandlingTaxAmtFC: number = 0;
    public ticketRRN: string = '';
    public VMTndr: ExchCardTndr = new ExchCardTndr();
    public tipAmountDC: number = 0;
    public tipAmountNDC: number = 0;
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
    }