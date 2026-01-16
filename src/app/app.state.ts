import { LocationConfig } from "./longterm/models/location-config";
import { SaveTicketResultsModel, TicketSplit, TicketTotals } from "./models/ticket.split";

export class RootObject {
  loginAuthState: LoginAuthState = new LoginAuthState();
  TktObjState: TktObjState = new TktObjState();
  LocatonConfigState: LocatonConfigState = new LocatonConfigState();
  sharedLocatonAssocState: SharedLocatonAssocState = new SharedLocatonAssocState();
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
