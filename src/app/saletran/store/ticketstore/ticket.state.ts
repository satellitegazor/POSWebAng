import { TicketSplit } from "src/app/models/ticket.split"

export interface tktObjInterface {
    tktObj: TicketSplit;
    amtPaidDC: number;
    amtPaidNDC: number;
    subTotalDC: number;
    subTotalNDC: number;
    grandTotalDC: number;
    grandTotalNDC: number;
}

export const tktObjInitialState: tktObjInterface = {
    tktObj: new TicketSplit(),
    amtPaidDC: 0,
    amtPaidNDC: 0,
    subTotalDC: 0,
    subTotalNDC: 0,
    grandTotalDC: 0,
    grandTotalNDC: 0
}