import { MobileBase } from "src/app/models/mobile.base";

 
export class VLogonModel {
    public cliTimeVar: number = 0;
    public contractType: boolean = false;
    public exchangeNumber: string = '';
    public facilityName: string = '';
    public facilityNumber: string = '';
    public guid: string = '';
    public individualUID: number = 0;
    public locationUID: number = 0;
    public loggingOut: boolean = false;
    public newPIN: string = '';
    public pageID: number = 0;
    public pin: string = '';
    public privActConfmComplete: boolean = false;
    public regionId: string = '';
    public showPrivTrngConfrm: number = 0;
    public vendorNumber: string = '';
    public verifyPIN: string = '';
}

export class AbbrLocationsModel {
    public contractEndDate: Date = {} as Date;
    public contractStartDate: Date = {} as Date;
    public contractUID: number = 0;
    public exchangeNumber: string = '';
    public facilityName: string = '';
    public facilityNumber: string = '';
    public locationUID: number = 0;
    public regionId: number = 0;
    public selected: string = '';
}

export class VendorLocationsResultModel {
    results: MobileBase = {} as MobileBase;
    locations: AbbrLocationsModel[] = [];
}