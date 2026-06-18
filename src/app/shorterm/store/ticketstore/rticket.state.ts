import { ROV_POSTicketSplit, RSaveTicketResultsModel, RTicketTotals } from "../../models/rticket.split";
import { EventConfig } from "../../models/event.config";

export interface RovSaleTranDataInterface {
    tktObj: ROV_POSTicketSplit;
    tktTotals: RTicketTotals;
    saveTktRsltMdl: RSaveTicketResultsModel;
    eventConfig: EventConfig;
}

export const RovTktObjInitialState: RovSaleTranDataInterface = {
    tktObj: new ROV_POSTicketSplit(),
    tktTotals: new RTicketTotals(),
    saveTktRsltMdl: new RSaveTicketResultsModel(),
    eventConfig: new EventConfig()
}

