import { TicketSplit } from "src/app/models/ticket.split";
import { TicketTender } from "src/app/models/ticket.tender";

export class TenderUtil {
    public static IsTicketComplete(tktObj: TicketSplit, allowPartPay: boolean): boolean {

        if (tktObj.tktList.length == 0) {
            //console.log("Ticket is empty, cannot be completed.");
            return false;
        }

        if (tktObj.ticketTenderList.length == 0) {
            //console.log("No tenders found for the ticket, cannot be completed.");
            return false;
        }
        let ticketTotal = 0;

        for (const key in tktObj.tktList) {
            ticketTotal += parseFloat((tktObj.tktList[key].lineItemDollarDisplayAmount).toFixed(2));
        }

        for (const key in tktObj.associateTips) {
            ticketTotal += parseFloat((tktObj.associateTips[key].tipAmount).toFixed(2));
        }

        let tenderTotals = 0;
        tktObj.ticketTenderList.forEach((tender) => {
            tenderTotals += parseFloat((tender.tenderAmount).toFixed(2));
        })

        if ((allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals) || Number(Number(ticketTotal).toFixed(2)) == Number(Number(tenderTotals).toFixed(2))) {
            //console.log("Ticket is complete with total: " + ticketTotal + " and tender total: " + tenderTotals);
            return true;
        }
        else {
            //console.log("Ticket is not complete. Ticket total: " + ticketTotal + ", Tender total: " + tenderTotals);
            return false;
        }
        return true;
    }

    public IsTicketComplete(tktObj: TicketSplit, allowPartPay: boolean): boolean {
    
        if (tktObj.tktList.length == 0)
          return false;
    
        if (tktObj.ticketTenderList.length == 0)
          return false;
    
        let ticketTotal = 0;
    
        for (const key in tktObj.tktList) {
          ticketTotal += tktObj.tktList[key].lineItemDollarDisplayAmount;
        }
    
        for (const key in tktObj.associateTips) {
          ticketTotal += tktObj.associateTips[key].tipAmount;
        }
    
        //let allowPartPay = this._logonDataSvc.getAllowPartPay();
    
        let tenderTotals = 0;
    
        for (const key in tktObj.ticketTenderList) {
          tenderTotals += tktObj.ticketTenderList[key].tenderAmount;
        }
    
        if (allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals || Number(Number(ticketTotal).toFixed(2)) == Number(Number(tenderTotals).toFixed(2))) {
          return true;
        }
        else {
          return false;
        }
      }
      
    public static copyTenderObj(srcTndr: TicketTender): TicketTender {
        let tndrCopy = new TicketTender();
    
        tndrCopy.ticketTenderId = srcTndr.ticketTenderId;
        tndrCopy.tenderTypeId = srcTndr.tenderTypeId;
        tndrCopy.tenderTransactionId = srcTndr.tenderTransactionId;
        tndrCopy.tenderTypeCode = srcTndr.tenderTypeCode;
        tndrCopy.tenderTypeDesc = srcTndr.tenderTypeDesc;
        tndrCopy.isRefundType = srcTndr.isRefundType;
        tndrCopy.isSignature = srcTndr.isSignature;
        tndrCopy.displayOrder = srcTndr.displayOrder;
        tndrCopy.cardEndingNbr = srcTndr.cardEndingNbr;
        tndrCopy.tracking = srcTndr.tracking;
        tndrCopy.traceId = srcTndr.traceId;
        tndrCopy.authNbr = srcTndr.authNbr;
        tndrCopy.rrn = srcTndr.rrn;
    
        tndrCopy.tenderAmount = srcTndr.tenderAmount;
        tndrCopy.changeDue = srcTndr.changeDue;
        tndrCopy.fcChangeDue = srcTndr.fcChangeDue;
        tndrCopy.cardBalance = srcTndr.cardBalance;
        tndrCopy.fcTenderAmount = srcTndr.fcTenderAmount;
        tndrCopy.fcCurrCode = srcTndr.fcCurrCode;
    
        tndrCopy.transactionNumber = srcTndr.transactionNumber;
        tndrCopy.tndMaintTimestamp = srcTndr.tndMaintTimestamp ? new Date(srcTndr.tndMaintTimestamp.getTime()) : {} as Date;
        tndrCopy.tndMaintUserId = srcTndr.tndMaintUserId;
        tndrCopy.tipAmount = srcTndr.tipAmount;
        tndrCopy.fcTipAmount = srcTndr.fcTipAmount;
    
        tndrCopy.exchCardType = srcTndr.exchCardType;
        tndrCopy.exchCardPymntType = srcTndr.exchCardPymntType;
        tndrCopy.cardEntryMode = srcTndr.cardEntryMode;
    
        tndrCopy.signatureType = srcTndr.signatureType;
        tndrCopy.milstarPlanNum = srcTndr.milstarPlanNum;
        tndrCopy.checkNumber = srcTndr.checkNumber;
    
        tndrCopy.isAuthorized = srcTndr.isAuthorized;
        tndrCopy.ctroutd = srcTndr.ctroutd;
        tndrCopy.tenderStatus = srcTndr.tenderStatus;
        tndrCopy.cliTimeVar = srcTndr.cliTimeVar;
        tndrCopy.refundAuthNbr = srcTndr.refundAuthNbr;
        tndrCopy.inStoreCardNbrTmp = srcTndr.inStoreCardNbrTmp;
        tndrCopy.voidRRN = srcTndr.voidRRN;
        tndrCopy.tndrTimeStamp = srcTndr.tndrTimeStamp ? new Date(srcTndr.tndrTimeStamp.getTime()) : {} as Date;
        tndrCopy.refundCardNbr = srcTndr.refundCardNbr;
        tndrCopy.refundCardType = srcTndr.refundCardType;
        tndrCopy.refundCardEntryMode = srcTndr.refundCardEntryMode;
        tndrCopy.refundEmvCvm = srcTndr.refundEmvCvm;
        tndrCopy.isDiscoverMilstar = srcTndr.isDiscoverMilstar;
        tndrCopy.partPayId = srcTndr.partPayId;
        tndrCopy.partPayAmount = srcTndr.partPayAmount;
        tndrCopy.partPayAmountFC = srcTndr.partPayAmountFC;
    
        return tndrCopy;
      }
}