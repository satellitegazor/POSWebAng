import { SalesTransactionCheckoutItem } from "../saletran/models/salesTransactionCheckoutItem";
import { AssociateSaleTips } from "./associate.sale.tips";
import { LTC_Customer } from "./customer";
import { ExchCardTndr } from "./exch.card.tndr";
import { MobileBase } from "./mobile.base";
import { TicketTender } from "./ticket.tender";
 
export class TicketSplit {

    public individualUID: number = 0;
    public eventId: number = 0;
    public associateTips: AssociateSaleTips[] = [] ;
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
    public vMTndr: ExchCardTndr = new ExchCardTndr();
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

    }