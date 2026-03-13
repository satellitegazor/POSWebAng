import { MobileBase } from "../../models/mobile.base";

export class LoadTicketStatLocRequest {
    public locationId: number = 0;
    public tranId: number = 0;
    public fromDate: string = '';
    public toDate: string = '';
    public lastName: string = '';
    public firstName: string = '';
    public pageSize: number = 2000;
    public pageNum: number = 1;
}

export class LoadTicketStatLocResultModel {
    public results: MobileBase = {} as MobileBase;
    public tickets: TicketStatusLocationData[] = [];
    public ticketStatuses: LTC_TicketStatus[] = [];
    public rackLocations: LTC_RackLocation[] = [];
    public totalRowCount: number = 0;
}

export class TicketStatusLocationData {
    public ticketNumber: number = 0;
    public dropOffDate: Date = {} as Date;
    public quantity: number = 0;
    public totalSaleAmount: number = 0;
    public totalTips: number = 0;
    public totalPaid: number = 0;
    public balanceDue: number = 0;
    public customerName: string = '';
    public phoneNumber: string = '';
    public locationUID: number = 0;
    public transactionID: number = 0;
    public tktStatusId: number = 0;
    public rackLocationId: number = 0;
    public readyByDate: Date | null = null;
    public tktStatusRackId: number = 0;
    public payByDueDate: Date | null = null;
    public rckLocDesc: string = '';
    public cDialCode: string = '';
}

export class LTC_TicketStatus {
    public tktStatusId: number = 0;
    public tktStatusCode: string = '';
    public description: string = '';
    public displayOrder: number = 0;
    public active: boolean = false;
}

export class LTC_RackLocation {
    public rckLocationUID: number = 0;
    public description: string = '';
}