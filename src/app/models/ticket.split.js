"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSplit = void 0;
var exch_card_tndr_1 = require("./exch.card.tndr");
var TicketSplit = /** @class */ (function () {
    function TicketSplit() {
        this.ticketRRN = '';
        this.eventId = 0;
        this.associateTips = [];
        this.balanceDue = 0;
        this.cancelTransactionID = 0;
        this.customerId = 0;
        this.individualUID = 0;
        this.instructions = '';
        this.isPartialPay = false;
        this.isRefund = false;
        this.locationUID = 0;
        this.partialAmount = 0;
        this.partialAmountFC = 0;
        this.refundCode = '';
        this.refundReason = '';
        this.taxExempted = false;
        this.tktList = [];
        this.ticketTenderList = [];
        this.totalSale = 0;
        this.totalSaleFC = 0;
        this.transactionID = 0;
        this.updateCustomer = false;
        this.updateCoupons = false;
        this.tCouponAmt = 0;
        this.tDCouponAmt = 0;
        this.tCouponPerc = 0;
        this.orderFormNum = '';
        this.shipHandling = 0;
        this.shipHandlingTaxAmt = 0;
        this.shipHandlingFC = 0;
        this.shipHandlingTaxAmtFC = 0;
        this.cliTimeVar = 0;
        this.vMTndr = new exch_card_tndr_1.ExchCardTndr();
    }
    return TicketSplit;
}());
exports.TicketSplit = TicketSplit;

//# sourceMappingURL=ticket.split.js.map