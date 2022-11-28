import { MobileBase } from "src/app/models/mobile.base";

export class LTC_LocationAssociatesResultsModel
{
    public results: MobileBase = {} as MobileBase;

    public associates: LTC_Associates[] = [];

    public pINReqdForSalesTran: boolean = false;

    public locationTimeStamp:Date = {} as Date;
}

export class LTC_Associates
{
    public IndividualUID: number = 0;
    public IndividualRoleTypeUID: number = 0;
    public PIN: string = '';
    public FirstName: string = '';
    public LastName: string = '';
    public EmailAddress: string = '';
    public PhoneNumber: string = '';
    public CODE: string = '';
    public Description: string = '';
    public HasUpdates: string = '';
    public IndividualLocationUID: number = 0;
    public MaintTimestamp: Date = {} as Date;
    public MaintUserId: string = '';
    public IndividualActive: boolean = false;    
    public PrivActConfmComplete: boolean =false;
    public IndCountryDialCode: string = '';

}