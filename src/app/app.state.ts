import { LocationConfig } from "./longterm/models/location-config";
import { SaveTicketResultsModel, TicketSplit, TicketTotals } from "./models/ticket.split";
import { EventConfig } from "./shorterm/models/event.config";
import { ROV_POSTicketSplit, RSaveTicketResultsModel, RTicketTotals } from "./shorterm/models/rticket.split";

export class RootObject {
  loginAuthState: LoginAuthState = new LoginAuthState();
  TktObjState: TktObjState = new TktObjState();
  LocatonConfigState: LocatonConfigState = new LocatonConfigState();
  sharedLocatonAssocState: SharedLocatonAssocState = new SharedLocatonAssocState();
  RovTktObjState: RovTktObjState = new RovTktObjState();
  EventConfigState: EventConfigState = new EventConfigState();
}

export class LoginAuthState {
  authMdl: any = null; // replace `any` with a proper type if known
}

export class TktObjState  {
  tktObj: TicketSplit = new TicketSplit();
  tktTotals: TicketTotals = new TicketTotals();
  saveTktRsltMdl: SaveTicketResultsModel = new SaveTicketResultsModel();
  locationConfig: LocationConfig = new LocationConfig();
}

export class LocatonConfigState {
  locationCnfg: LocationConfig = new LocationConfig();
}

export class SharedLocatonAssocState {
  locAssocs: any = null;
}

export class RovTktObjState {
  tktObj: ROV_POSTicketSplit = new ROV_POSTicketSplit();
  tktTotals: RTicketTotals = new RTicketTotals();
  saveTktRsltMdl: RSaveTicketResultsModel = new RSaveTicketResultsModel();
}

export class EventConfigState {
  eventConfig: EventConfig = new EventConfig();
}
