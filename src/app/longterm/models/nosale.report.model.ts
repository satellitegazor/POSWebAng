import { MobileBase } from '../../models/mobile.base';

export class LTC_NoSaleResultsModel {
    results: MobileBase = {} as MobileBase;
    noSaleSummary: LTC_NoSaleReportSummary = new LTC_NoSaleReportSummary();
}

export class LTC_NoSaleReportSummary {
    noSaleTickets: LTC_NoSaleTicket[] = [];
}

export class LTC_NoSaleTicket {
    ticketID: number = 0;
    transactionID: number = 0;
    dropOffDate: Date = {} as Date;
    daysElapsed: number = 0;
    totalAmount: number = 0;
    fcTotalAmount: number = 0;
    associate: string = '';
    customerName: string = '';
    phoneNumber: string = '';
    emailAddress: string = '';
    locationUID: number = 0;
    locationName: string = '';
    transactionDate: Date = {} as Date;
    dfltCurrHtml: string = '';
    dfltCurrCode: string = '';
    dfltCurrSymbol: string = '';
    countryDialCode: string = '';
}
