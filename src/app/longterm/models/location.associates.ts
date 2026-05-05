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
    public pin: string = '';
    public firstName: string = '';
    public lastName: string = '';
    public emailAddress: string = '';
    public phoneNumber: string = '';
    public code: string = '';
    public description: string = '';
    public hasUpdates: boolean = false;
    public individualLocationUID: number = 0;
    public maintTimestamp: Date = {} as Date;
    public maintUserId: string = '';
    public individualActive: boolean = false;    
    public privActConfmComplete: boolean =false;
    public indCountryDialCode: string = '';
    public dcTipAmount: number = 0;
    public ndcTipAmount: number = 0;
    public locationUID: number = 0;
    public active: boolean = false;

}

export class AssociatePINUpdateResultsModel {
  results: MobileBase = {} as MobileBase;
  vendorNumber: string = '';
  vendorName: string = '';
  facilityNumber: string = '';
  facilityName: string = '';
  locationName: string = '';
  associateEmail: string = '';
  contractStart: Date = {} as Date;
  contractEnd: Date = {} as Date;
  individualRole: string = '';
  associateName: string = '';
}

export class ResetAssociatePINRequest {
  locationId: number = 0;
  individualId: number = 0;
  credentials: string = '';
}

export class LTCOtherContractResultsModel {
  results: MobileBase = {} as MobileBase;
  otherContractLocations: LTCOtherContractLocations[] = [];
  hasContracts: boolean = false;
  hasPrevLocations: boolean = false;
}

export class LTCOtherContractLocations {
  contractStatus: string = '';
  locationUID: string = '';
  locationName: string = '';
  contractUID: number = 0;
  contractNumber: string = '';
}