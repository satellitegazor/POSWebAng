import { MobileBase } from '../../models/mobile.base';

export class LTC_CancelledTicketsResultsModel {
	results: MobileBase = {} as MobileBase;
	ltcCancelledTickets: LTC_CancelledTicketReportSummary = new LTC_CancelledTicketReportSummary();
}

export class LTC_CancelledTicketReportSummary {
	cancelledTickets: LTC_CancelledTickets[] = [];
}

export class LTC_CancelledTickets {
	ticketID: number = 0;
	dropOffDate: Date = {} as Date;
	cancelDate: Date = {} as Date;
	daysElapsed: number = 0;
	totalAmount: number = 0;
	fcTotalAmount: number = 0;
	associate: string = '';
	customerName: string = '';
	phoneNumber: string = '';
	reason: string = '';
	locationUID: number = 0;
	locationName: string = '';
	transactionID: number = 0;
	transactionDate: Date = {} as Date;
	dfltCurrHtml: string = '';
	dfltCurrCode: string = '';
	dfltCurrSymbol: string = '';
	countryDialCode: string = '';
    emailAddress: string = '';
    cancelReason: string = '';

}
