import { MobileBase } from "../../models/mobile.base";

export class EventConfigModel {
    public config: EventConfig = new EventConfig();
    public result: MobileBase = {} as MobileBase;
}

export class EventConfig {
    public businessFunctionUID: number = 0;
    public businessModel: number = 0;
    public allowPartPay: boolean = false;
    public allowSaveTkt: boolean = false;
    public allowTips: boolean = false;
    public openCashDrawer: boolean = false;
    public exchCouponsAfterTax: boolean = false;
    public vendCouponsAfterTax: boolean = false;
    public facilityUID: number = 0;
    public facilityNumber: string = '';
    public eventID: number = 0;
    public eventName: string = '';
    public pinReqdForSalesTran: boolean = false;
    public associateName: string = '';
    public associateRole: string = '';
    public associateRoleDesc: string = '';
    public contractUID: number = 0;
    public contractNumber: string = '';
    public vendorNumber: string = '';
    public vendorName: string = '';
    public facilityName: string = '';
    public individualUID: number = 0;
    public indLocUID: number = 0;
    public contractStart: Date = {} as Date;
    public contractEnd: Date = {} as Date;
    public busFuncCode: string = '';
    public assocEmail: string = '';
    public isVendorLogin: boolean = false;
    public sBMUserFirstName: string = '';
    public sBMUserMiddleName: string = '';
    public sBMUserLastName: string = '';
    public sBMUserJobTitle: string = '';
    public sBMUserFullName: string = '';
    public sBMFaciltyNumber: string = '';
    public sBMFacilityName: string = '';
    public rgnCode: string = '';
    public countryCode: string = '';
    public currCode: string = '';
    public cCDevice: string = '';
    public regionId: string = '';
    public defaultCurrency: string = '';
    public usdFastcash: string = '';
    public frgnFastcash: string = '';
    public countryDialCode: string = '';
    public addressLine1: string = '';
    public addressLine2: string = '';
    public city: string = '';
    public stateProvice: string = '';
    public phoneNumber: string = '';
    public postalCode: string = '';
    public eagleCashOptn: boolean = false;
    public useShipHndlng: boolean = false;
    public inProgTranId: number = 0;
    public tenderDateTime: Date = {} as Date;
    public inProgTranTabSerialNum: string = '';
    public discMilstarBinRange: string = '650155';
}