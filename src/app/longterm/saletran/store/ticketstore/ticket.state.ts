import { SaveTicketResultsModel, TicketSplit, TicketTotals } from "../../../../models/ticket.split"
import { LocationConfig } from "../../../models/location-config";

export interface saleTranDataInterface {
    tktObj: TicketSplit;
    tktTotals: TicketTotals;
    saveTktRsltMdl: SaveTicketResultsModel;
    locationConfig: LocationConfig;
}

export const tktObjInitialState: saleTranDataInterface = {
    tktObj: new TicketSplit(),
    tktTotals: new TicketTotals(),
    saveTktRsltMdl: new SaveTicketResultsModel(),
    locationConfig: new LocationConfig()
}

