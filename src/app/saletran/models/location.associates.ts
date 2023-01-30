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
    public individualUID: number = 0;
    public individualRoleTypeUID: number = 0;
    public pIN: string = '';
    public firstName: string = '';
    public lastName: string = '';
    public emailAddress: string = '';
    public phoneNumber: string = '';
    public cODE: string = '';
    public description: string = '';
    public hasUpdates: string = '';
    public individualLocationUID: number = 0;
    public maintTimestamp: Date = {} as Date;
    public maintUserId: string = '';
    public individualActive: boolean = false;    
    public privActConfmComplete: boolean =false;
    public indCountryDialCode: string = '';
    public dcTipAmount: number = 0;
    public ndcTipAmount: number = 0;

}