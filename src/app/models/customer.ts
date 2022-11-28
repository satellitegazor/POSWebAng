import { MobileBase } from "./mobile.base";

export class LTC_Customer {
    public customerUID: number = 0;
    public cTitle: string = '';
    public cFirstName: string = '';
    public cLastName: string = '';
    public cMI: string = '';
    public cUnit: string = '';
    public cAddress1: string = '';
    public cAddress2: string = '';
    public cCity: string = '';
    public cStateProvice: string = '';
    public cPostalCode: string = '';
    public cEmailAddress: string = '';
    public cPhoneNumber: string = '';
    public cDialCode: string = '';
    public cNotes: string = '';
    public custMaintTimestamp: Date = {} as Date;
    public custMaintUserId: string = '';
}

export class LTC_CustomerLookupResultsModel {
    public results: MobileBase = {} as MobileBase;
    public customers: LTC_Customer[] = [];
}
