import { TicketSplit } from "src/app/models/ticket.split"

export interface tktObjInterface {
    tktObj: TicketSplit;
}

export const tktObjInitialState: tktObjInterface = {
    tktObj: new TicketSplit()
}