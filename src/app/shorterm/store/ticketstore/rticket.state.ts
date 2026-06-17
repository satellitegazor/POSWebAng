import { ROV_POSTicketSplit, RSaveTicketResultsModel, RTicketTotals } from "../../models/rticket.split";
import { EventConfig } from "../../models/event.config";

export interface saleTranDataInterface {
    tktObj: ROV_POSTicketSplit;
    tktTotals: RTicketTotals;
    saveTktRsltMdl: RSaveTicketResultsModel;
    eventConfig: EventConfig;
}

export const rTktObjInitialState: saleTranDataInterface = {
    tktObj: new ROV_POSTicketSplit(),
    tktTotals: new RTicketTotals(),
    saveTktRsltMdl: new RSaveTicketResultsModel(),
    eventConfig: new EventConfig()
}

