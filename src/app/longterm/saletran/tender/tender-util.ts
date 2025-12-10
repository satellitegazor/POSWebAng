import { TicketSplit } from "src/app/models/ticket.split";

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
}