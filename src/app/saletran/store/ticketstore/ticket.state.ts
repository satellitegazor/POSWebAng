import { SaveTicketResultsModel, TicketSplit, TicketTotals } from "src/app/models/ticket.split"

export interface tktObjInterface {
    tktObj: TicketSplit;
    tktTotals: TicketTotals;
    saveTktRsltMdl: SaveTicketResultsModel;
}

export const tktObjInitialState: tktObjInterface = {
    tktObj: new TicketSplit(),
    tktTotals: new TicketTotals(),
    saveTktRsltMdl: new SaveTicketResultsModel()
}

