import { MobileBase } from '../../models/mobile.base';

export class LTC_TicketStatusLocationResult {
	results: MobileBase = {} as MobileBase;
	tktStLocList: LTC_TicketStatusLocation[] = [];
	tktStatTypeList: LTC_TicketStatusType[] = [];
	refundRsn: LTC_RefundReasonType[] = [];
	autoRacks: LTC_RackLocations[] = [];
	tktStatusAllRowsCount: number = 0;
}

export class LTC_TicketStatusLocation {
	ticketNumber: number = 0;
	dropOffDate: Date = {} as Date;
	readyByDate: Date | null = null;
	quantity: number = 0;
	totalSaleAmount: number = 0;
	totalTips: number = 0;
	totalPaid: number = 0;
	balanceDue: number = 0;
	customerName: string = '';
	phoneNumber: string = '';
	tktStatusId: number = 0;
	rackLocationId: number = 0;
	locationUID: number = 0;
	transactionID: number = 0;
	tktStatusRackId: number = 0;
	payByDueDate: Date | null = null;
	rckLocDesc: string = '';
	cDialCode: string = '';
}

export class LTC_TicketStatusType {
	ticketStatusId: number = 0;
	description: string = '';
	active: boolean = false;
	displayOrder: number = 0;
}

export class LTC_RefundReasonType {
	refundReasonUID: number = 0;
	refundReasonCode: string = '';
	refundReasonText: string = '';
	isConcessionFood: boolean = false;
	displayOrder: string = '';
}

export class LTC_RackLocations {
	description: string = '';
	rckLocationUID: number = 0;
}

export class UpdateTicketStatusLocationRequest {
	transactionId: number = 0;
	readyByDate: Date | null = null;
	statusId: number = 0;
	rackLocationId: number = 0;
	rckLocDesc: string = '';
	payByDueDate: Date | null = null;
	locationId: number = 0;
	userId: string = '';
}
