import { SaleItem } from "../saletran/models/sale.item";
import { AssociateSaleTips } from "./associate.sale.tips";
import { LTC_Customer } from "./customer";
import { ExchCardTndr } from "./exch.card.tndr";
import { TicketTender } from "./ticket.tender";
 
export class TicketSplit {

    public ticketRRN: string = '';
    public eventId: number = 0;
    public associateTips: AssociateSaleTips[] = [] ;
    public balanceDue: number = 0;
    public cancelTransactionID: number = 0;
    public customerId: number = 0;
    public customer: LTC_Customer = {} as LTC_Customer;
    public individualUID: number = 0;
    public instructions: string = '';
    public isPartialPay: boolean = false;
    public isRefund: boolean = false;
    public locationUID: number = 0;
    public partialAmount: number = 0;
    public partialAmountFC: number = 0;
    public refundCode: string = '';
    public refundReason: string = '';
    public taxExempted: boolean = false;
    public tktList: SaleItem[] = [];
    public ticketTenderList: TicketTender[] = [];
    public totalSale: number = 0;
    public totalSaleFC: number = 0;
    public transactionDate: Date = {} as Date;
    public transactionID: number = 0;
    public updateCustomer: boolean = false;
    public updateCoupons: boolean = false;
    public tCouponAmt: number = 0;
    public tDCouponAmt: number = 0;
    public tCouponPerc: number = 0;
    public orderFormNum: string = '';
    public shipHandling: number = 0;
    public shipHandlingTaxAmt: number = 0;
    public shipHandlingFC: number = 0;
    public shipHandlingTaxAmtFC: number = 0;
    public cliTimeVar: number = 0;
    public vMTndr: ExchCardTndr = new ExchCardTndr();
    }