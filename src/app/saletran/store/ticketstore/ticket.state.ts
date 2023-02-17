import { TicketSplit, TicketTotals } from "src/app/models/ticket.split"

export interface tktObjInterface {
    tktObj: TicketSplit;
    tktTotals: TicketTotals;
}

export const tktObjInitialState: tktObjInterface = {
    tktObj: new TicketSplit(),
    tktTotals: new TicketTotals()
}

