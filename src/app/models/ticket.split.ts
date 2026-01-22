import { SalesTransactionCheckoutItem } from "../longterm/models/salesTransactionCheckoutItem";
import { AssociateSaleTips } from "./associate.sale.tips";
import { LTC_Customer } from "./customer";
import { ExchCardTndr } from "./exch.card.tndr";
import { MobileBase } from "./mobile.base";
import { TicketTender } from "./ticket.tender";
 
    export class TicketSplit {

        ticketRRN: string = '';
        transactionDate: Date = new Date(); // or string if you prefer ISO strings
        individualUID: number = 0;
        locationUID: number = 0;
        taxExempted: boolean = false;
        transactionID: number = 0;
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