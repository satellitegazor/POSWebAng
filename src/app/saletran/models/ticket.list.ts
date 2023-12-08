import { MobileBase } from "src/app/models/mobile.base";

export class TicketList {
    public ticketNum: string = '';
    public transactionId: string = '';

}

export class TicketLookupResult
{
    public results: MobileBase = {} as MobileBase;
    public tickets: TicketLookupModel[] = [];
}

export class TicketLookupModel
{ 
    public transactionID: number = 0; 
    public ticketNumber: number = 0; 
    public locationUID: number = 0; 
}