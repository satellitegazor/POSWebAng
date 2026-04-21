import { MobileBase } from '../../models/mobile.base';

export class LTC_BalanceDueTicketsResultsModel {
	results: MobileBase = {} as MobileBase;
	balDueTktSummary: LTC_BalanceDueTicketReportSummary = new LTC_BalanceDueTicketReportSummary();
}

export class LTC_BalanceDueTicketReportSummary {
	balDueTickets: LTC_BalanceDueTickets[] = [];
}

export class LTC_BalanceDueTickets {
	ticketID: number = 0;
    transactionID: number = 0;
    partPayID: number = 0;
	dropOffDate: Date = {} as Date;
	daysElapsed: number = 0;
	totalAmount: number = 0;
	fcTotalAmount: number = 0;
	balanceDue: number = 0;
	fcBalanceDue: number = 0;
	associate: string = '';
	customerName: string = '';
	phoneNumber: string = '';
	emailAddress: string = '';
	locationUID: number = 0;
	locationName: string = '';
	transactionDate: Date = {} as Date;
	payByDueDate: Date = {} as Date;
	dfltCurrHtml: string = '';
	dfltCurrCode: string = '';
	dfltCurrSymbol: string = '';
	countryDialCode: string = '';
}
