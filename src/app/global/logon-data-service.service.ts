import { Injectable } from '@angular/core';
import { DailyExchRate } from '../models/exchange.rate';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';
import { LocationConfig, LocationConfigModel } from '../saletran/models/location-config';

@Injectable({
  providedIn: 'root'
})
export class LogonDataService {

    private _ltvendorLogonData: VendorLoginResultsModel = {} as VendorLoginResultsModel;
    private _ltLocationConfig: LocationConfigModel = {} as LocationConfigModel;

    constructor() { }

    public setLTVendorLogonData(ltVendorLogonData: VendorLoginResultsModel): void {

        sessionStorage.setItem('associatePINCount', ltVendorLogonData.associatePINCount.toString());
        sessionStorage.setItem('resetPIN', ltVendorLogonData.resetPIN.toString());
        sessionStorage.setItem('contractUID', ltVendorLogonData.contractUID.toString());
        sessionStorage.setItem('contractNumber', ltVendorLogonData.contractNumber);
        sessionStorage.setItem('contractStart', ltVendorLogonData.contractStart);
        sessionStorage.setItem('userIdentity', ltVendorLogonData.userIdentity.toString());
        sessionStorage.setItem('userRoles', ltVendorLogonData.userRoles.toString());
        sessionStorage.setItem('asociateRole', ltVendorLogonData.asociateRole);
        sessionStorage.setItem('associateRoleDesc', ltVendorLogonData.associateRoleDesc);
        sessionStorage.setItem('associateName', ltVendorLogonData.associateName);
        sessionStorage.setItem('locationUID', ltVendorLogonData.locationUID);
        sessionStorage.setItem('eventId', ltVendorLogonData.eventId.toString());
        sessionStorage.setItem('eventName', ltVendorLogonData.eventName);
        sessionStorage.setItem('facilityNumber', ltVendorLogonData.facilityNumber);
        sessionStorage.setItem('facilityName', ltVendorLogonData.facilityName);
        sessionStorage.setItem('individualUID', ltVendorLogonData.individualUID);
        sessionStorage.setItem('isAuthorized', ltVendorLogonData.isAuthorized.toString());
        sessionStorage.setItem('showPrivTrngConfrm', ltVendorLogonData.showPrivTrngConfrm.toString());
        sessionStorage.setItem('cliTimeVar', ltVendorLogonData.cliTimeVar.toString());
        sessionStorage.setItem('pageID', ltVendorLogonData.pageID.toString());
        sessionStorage.setItem('eventStart', ltVendorLogonData.eventStart.toString());
        sessionStorage.setItem('eventEnd', ltVendorLogonData.eventEnd.toString());
        sessionStorage.setItem('busFuncCode', ltVendorLogonData.busFuncCode);
        sessionStorage.setItem('busModel', ltVendorLogonData.busModel.toString());
        sessionStorage.setItem('eventEnded', ltVendorLogonData.eventEnded.toString());
        sessionStorage.setItem('emailAddr', ltVendorLogonData.emailAddr);
        sessionStorage.setItem('privActConfmComplete', String(ltVendorLogonData.privActConfmComplete != null ? ltVendorLogonData.privActConfmComplete : false));
        sessionStorage.setItem('regionId', ltVendorLogonData.regionId);
        sessionStorage.setItem('rgnCode', ltVendorLogonData.rgnCode);
        sessionStorage.setItem('countryCode', ltVendorLogonData.countryCode);
        sessionStorage.setItem('currCode', ltVendorLogonData.currCode);
        sessionStorage.setItem('ccDevice', ltVendorLogonData.ccDevice);
        sessionStorage.setItem('usdFastcash', ltVendorLogonData.usdFastcash);
        sessionStorage.setItem('frgnFastcash', ltVendorLogonData.frgnFastcash);
        sessionStorage.setItem('uuidExists', String(ltVendorLogonData.uuidExists != null ? ltVendorLogonData.uuidExists : false ))
        sessionStorage.setItem('eagleCashOptn', String(ltVendorLogonData.eagleCashOptn != null ? ltVendorLogonData.eagleCashOptn : false));
        sessionStorage.setItem('useShipHndlng', String(ltVendorLogonData.useShipHndlng != null ? ltVendorLogonData.useShipHndlng : false));
        sessionStorage.setItem('tokenString', ltVendorLogonData.tokenString);
    }

    public getLTVendorLogonData(): VendorLoginResultsModel {
        var ltVndrLgnData: VendorLoginResultsModel = new VendorLoginResultsModel();
    
        ltVndrLgnData.associatePINCount = Number(sessionStorage.getItem('associatePINCount') ? sessionStorage.getItem('associatePINCount') :  '0' )
        ltVndrLgnData.resetPIN = Number(sessionStorage.getItem('resetPIN') ? sessionStorage.getItem('resetPIN') :  '0' )
        ltVndrLgnData.contractUID = Number(sessionStorage.getItem('contractUID') ? sessionStorage.getItem('contractUID') :  '0' )
        ltVndrLgnData.contractNumber = String(sessionStorage.getItem('contractNumber') ? sessionStorage.getItem('contractNumber') :  '0' )
        ltVndrLgnData.contractStart = String(sessionStorage.getItem('contractStart') ? sessionStorage.getItem('contractStart') :  '0' )
        //ltVndrLgnData.userIdentity = Number(sessionStorage.getItem('userIdentity') ? sessionStorage.getItem('userIdentity') :  '0' )
        //ltVndrLgnData.userRoles = Number(sessionStorage.getItem('userRoles') ? sessionStorage.getItem('userRoles') :  '0' )
        ltVndrLgnData.asociateRole = String(sessionStorage.getItem('asociateRole') ? sessionStorage.getItem('asociateRole') :  '0' )
        ltVndrLgnData.associateRoleDesc = String(sessionStorage.getItem('associateRoleDesc') ? sessionStorage.getItem('associateRoleDesc') :  '0' )
        ltVndrLgnData.associateName = String(sessionStorage.getItem('associateName') ? sessionStorage.getItem('associateName') :  '0' )
        ltVndrLgnData.locationUID = String(sessionStorage.getItem('locationUID') ? sessionStorage.getItem('locationUID') :  '0' )
        ltVndrLgnData.eventId = Number(sessionStorage.getItem('eventId') ? sessionStorage.getItem('eventId') :  '0' )
        ltVndrLgnData.eventName = String(sessionStorage.getItem('eventName') ? sessionStorage.getItem('eventName') :  '0' )
        ltVndrLgnData.facilityNumber = String(sessionStorage.getItem('facilityNumber') ? sessionStorage.getItem('facilityNumber') :  '0' )
        ltVndrLgnData.facilityName = String(sessionStorage.getItem('facilityName') ? sessionStorage.getItem('facilityName') :  '0' )
        ltVndrLgnData.individualUID = String(sessionStorage.getItem('individualUID') ? sessionStorage.getItem('individualUID') :  '0' )
        ltVndrLgnData.isAuthorized = Boolean(sessionStorage.getItem('isAuthorized') ? sessionStorage.getItem('isAuthorized') :  '0' )
        ltVndrLgnData.showPrivTrngConfrm = Number(sessionStorage.getItem('showPrivTrngConfrm') ? sessionStorage.getItem('showPrivTrngConfrm') :  '0' )
        ltVndrLgnData.cliTimeVar = Number(sessionStorage.getItem('cliTimeVar') ? sessionStorage.getItem('cliTimeVar') :  '0' )
        ltVndrLgnData.pageID = Number(sessionStorage.getItem('pageID') ? sessionStorage.getItem('pageID') :  '0' )
        ltVndrLgnData.eventStart = new Date(String(sessionStorage.getItem('eventStart') ? sessionStorage.getItem('eventStart') :  '0' ))
        ltVndrLgnData.eventEnd = new Date(String(sessionStorage.getItem('eventEnd') ? sessionStorage.getItem('eventEnd') :  '0' ))
        ltVndrLgnData.busFuncCode = String(sessionStorage.getItem('busFuncCode') ? sessionStorage.getItem('busFuncCode') :  '0' )
        ltVndrLgnData.busModel = Number(sessionStorage.getItem('busModel') ? sessionStorage.getItem('busModel') :  '0' )
        ltVndrLgnData.eventEnded = Boolean(sessionStorage.getItem('eventEnded') ? sessionStorage.getItem('eventEnded') :  '0' )
        ltVndrLgnData.emailAddr = String(sessionStorage.getItem('emailAddr') ? sessionStorage.getItem('emailAddr') :  '0' )
        ltVndrLgnData.privActConfmComplete = Boolean(sessionStorage.getItem('privActConfmComplete') ? sessionStorage.getItem('privActConfmComplete') :  '0' )
        ltVndrLgnData.regionId = String(sessionStorage.getItem('regionId') ? sessionStorage.getItem('regionId') :  '0' )
        ltVndrLgnData.rgnCode = String(sessionStorage.getItem('rgnCode') ? sessionStorage.getItem('rgnCode') :  '0' )
        ltVndrLgnData.countryCode = String(sessionStorage.getItem('countryCode') ? sessionStorage.getItem('countryCode') :  '0' )
        ltVndrLgnData.currCode = String(sessionStorage.getItem('currCode') ? sessionStorage.getItem('currCode') :  '0' )
        ltVndrLgnData.ccDevice = String(sessionStorage.getItem('ccDevice') ? sessionStorage.getItem('ccDevice') :  '0' )
        ltVndrLgnData.usdFastcash = String(sessionStorage.getItem('usdFastcash') ? sessionStorage.getItem('usdFastcash') :  '0' )
        ltVndrLgnData.frgnFastcash = String(sessionStorage.getItem('frgnFastcash') ? sessionStorage.getItem('frgnFastcash') :  '0' )
        ltVndrLgnData.uuidExists = Boolean(sessionStorage.getItem('uuidExists') ? sessionStorage.getItem('uuidExists') :  '0' )
        ltVndrLgnData.eagleCashOptn = Boolean(sessionStorage.getItem('eagleCashOptn') ? sessionStorage.getItem('eagleCashOptn') :  '0' )
        ltVndrLgnData.useShipHndlng = Boolean(sessionStorage.getItem('useShipHndlng') ? sessionStorage.getItem('useShipHndlng') :  '0' )
        ltVndrLgnData.tokenString = String(sessionStorage.getItem('tokenString') ? sessionStorage.getItem('tokenString') :  '0' )
        
        return ltVndrLgnData;
    }

    public setLocationConfig(locConfig: LocationConfigModel) {

        if (locConfig == null || locConfig.configs == null || locConfig.configs.length == 0)
            return;

        sessionStorage.setItem('businessFunctionUID', locConfig.configs[0].businessFunctionUID.toString());
        sessionStorage.setItem('businessModel', locConfig.configs[0].businessModel.toString());
        sessionStorage.setItem('allowPartPay', (locConfig.configs[0].allowPartPay ? locConfig.configs[0].allowPartPay : false).toString());
        sessionStorage.setItem('allowSaveTkt', (locConfig.configs[0].allowSaveTkt ? locConfig.configs[0].allowSaveTkt : false).toString());
        sessionStorage.setItem('allowTips', (locConfig.configs[0].allowTips ? locConfig.configs[0].allowTips : false).toString());
        sessionStorage.setItem('openCashDrawer', (locConfig.configs[0].openCashDrawer ? locConfig.configs[0].openCashDrawer : false).toString());
        sessionStorage.setItem('exchCouponsAfterTax', (locConfig.configs[0].exchCouponsAfterTax ? locConfig.configs[0].exchCouponsAfterTax : false).toString());
        sessionStorage.setItem('vendCouponsAfterTax', (locConfig.configs[0].vendCouponsAfterTax ? locConfig.configs[0].vendCouponsAfterTax : false).toString());
        sessionStorage.setItem('facilityUID', locConfig.configs[0].facilityUID.toString());
        sessionStorage.setItem('facilityNumber', locConfig.configs[0].facilityNumber)
        sessionStorage.setItem('locationUID', locConfig.configs[0].locationUID.toString());
        sessionStorage.setItem('locationName', locConfig.configs[0].locationName);
        sessionStorage.setItem('storeName', locConfig.configs[0].storeName);
        sessionStorage.setItem('pINReqdForSalesTran', (locConfig.configs[0].pINReqdForSalesTran ? locConfig.configs[0].pINReqdForSalesTran : false).toString());
        sessionStorage.setItem('associateName', locConfig.configs[0].associateName);
        sessionStorage.setItem('associateRole', locConfig.configs[0].associateRole);
        sessionStorage.setItem('associateRoleDesc', locConfig.configs[0].associateRoleDesc);
        sessionStorage.setItem('contractUID', locConfig.configs[0].contractUID.toString());
        sessionStorage.setItem('contractNumber', locConfig.configs[0].contractNumber);
        sessionStorage.setItem('vendorNumber', locConfig.configs[0].vendorNumber);
        sessionStorage.setItem('vendorName', locConfig.configs[0].vendorName);
        sessionStorage.setItem('facilityName', locConfig.configs[0].facilityName);
        sessionStorage.setItem('individualUID', (locConfig.configs[0].individualUID != null ? locConfig.configs[0].individualUID : '0').toString());
        sessionStorage.setItem('indLocUID', (locConfig.individuals[0].indLocUID != null ? locConfig.individuals[0].indLocUID : '0').toString());
        sessionStorage.setItem('contractStart', locConfig.configs[0].contractStart.toString());
        sessionStorage.setItem('contractEnd', String(locConfig.configs[0].contractEnd != null ? locConfig.configs[0].contractEnd : false));
        sessionStorage.setItem('busFuncCode', locConfig.configs[0].busFuncCode);
        sessionStorage.setItem('assocEmail', locConfig.configs[0].assocEmail);
        sessionStorage.setItem('isVendorLogin', String(locConfig.configs[0].isVendorLogin != null ? locConfig.configs[0].isVendorLogin : false));
        sessionStorage.setItem('sBMUserFirstName', locConfig.configs[0].sBMUserFirstName);
        sessionStorage.setItem('sBMUserMiddleName', locConfig.configs[0].sBMUserMiddleName);
        sessionStorage.setItem('sBMUserLastName', locConfig.configs[0].sBMUserLastName);
        sessionStorage.setItem('sBMUserJobTitle', locConfig.configs[0].sBMUserJobTitle);
        sessionStorage.setItem('sBMUserFullName', locConfig.configs[0].sBMUserFullName);
        sessionStorage.setItem('sBMFaciltyNumber', locConfig.configs[0].sBMFaciltyNumber);
        sessionStorage.setItem('sBMFacilityName', locConfig.configs[0].sBMFacilityName);
        sessionStorage.setItem('rgnCode', locConfig.configs[0].rgnCode);
        sessionStorage.setItem('countryCode', locConfig.configs[0].countryCode);
        sessionStorage.setItem('currCode', locConfig.configs[0].currCode);
        sessionStorage.setItem('cCDevice', locConfig.configs[0].cCDevice);
        sessionStorage.setItem('regionId', locConfig.configs[0].regionId);
        sessionStorage.setItem('defaultCurrency', locConfig.configs[0].defaultCurrency);
        sessionStorage.setItem('uSDFastcash', locConfig.configs[0].uSDFastcash);
        sessionStorage.setItem('frgnFastcash', locConfig.configs[0].frgnFastcash);
        sessionStorage.setItem('countryDialCode', locConfig.configs[0].countryDialCode);
        sessionStorage.setItem('addressLine1', locConfig.configs[0].addressLine1);
        sessionStorage.setItem('addressLine2', locConfig.configs[0].addressLine2);
        sessionStorage.setItem('city', locConfig.configs[0].city);
        sessionStorage.setItem('stateProvice', locConfig.configs[0].stateProvice);
        sessionStorage.setItem('phoneNumber', locConfig.configs[0].phoneNumber);
        sessionStorage.setItem('postalCode', locConfig.configs[0].postalCode);
        sessionStorage.setItem('eagleCashOptn', String(locConfig.configs[0].eagleCashOptn != null ? locConfig.configs[0].eagleCashOptn : false));
        sessionStorage.setItem('useShipHndlng', String(locConfig.configs[0].useShipHndlng != null ? locConfig.configs[0].useShipHndlng : false));

        if( typeof (this._ltLocationConfig.configs) == 'undefined' || this._ltLocationConfig.configs.length == 0) {
            this._ltLocationConfig = locConfig;
        }
    }

    public getBusinessModel(): number {
        return Number(sessionStorage.getItem('businessModel') ? sessionStorage.getItem('businessModel') : '0');
    }

    public getAllowPartPay(): boolean {
        return (sessionStorage.getItem('allowPartPay') ? sessionStorage.getItem('allowPartPay')?.toLowerCase() : 'false') == 'true';
    }
    
    public getAllowTips(): boolean {
        return (sessionStorage.getItem('allowTips') ? sessionStorage.getItem('allowTips')?.toLowerCase() : 'false') == 'true';
    }

    public getLocationId(): number {
        return Number(sessionStorage.getItem('locationUID') ? sessionStorage.getItem('locationUID') : '0');
    }

    public getExchCouponAfterTax(): boolean {
        return (sessionStorage.getItem('exchCouponsAfterTax') ? sessionStorage.getItem('exchCouponsAfterTax')?.toLowerCase() : 'false') == 'true';
    }
    public getVendorCouponAfterTax(): boolean {
        return (sessionStorage.getItem('vendCouponsAfterTax') ? sessionStorage.getItem('vendCouponsAfterTax')?.toLowerCase() : 'false') == 'true';
    }

    public getLocationConfig(): LocationConfig {
        //return this._ltLocationConfig;
        let locConfig: LocationConfig = new LocationConfig();
        locConfig.businessFunctionUID = Number(sessionStorage.getItem('businessFunctionUID') ?  sessionStorage.getItem('businessFunctionUID') : '0');
        locConfig.businessModel = Number(sessionStorage.getItem('businessModel') ? sessionStorage.getItem('businessModel') : '0');
        locConfig.allowPartPay = (sessionStorage.getItem('allowPartPay') ? sessionStorage.getItem('allowPartPay')?.toLowerCase() : 'false') == 'true';
        locConfig.allowSaveTkt = (sessionStorage.getItem('allowSaveTkt') ? sessionStorage.getItem('allowSaveTkt')?.toLowerCase() : 'false') == 'true';
        locConfig.allowTips = (sessionStorage.getItem('allowTips') ? sessionStorage.getItem('allowTips') : 'false') == 'true';
        locConfig.openCashDrawer = (sessionStorage.getItem('openCashDrawer') ? sessionStorage.getItem('openCashDrawer') : 'false') == 'true';
        locConfig.exchCouponsAfterTax = (sessionStorage.getItem('exchCouponsAfterTax') ? sessionStorage.getItem('exchCouponsAfterTax') : 'false') == 'true';
        locConfig.vendCouponsAfterTax = (sessionStorage.getItem('vendCouponsAfterTax') ? sessionStorage.getItem('vendCouponsAfterTax') : 'false') == 'true';
        locConfig.facilityUID = Number(sessionStorage.getItem('facilityUID') ? sessionStorage.getItem('facilityUID') : '0');
        locConfig.facilityNumber = String(sessionStorage.getItem('facilityNumber') ? sessionStorage.getItem('facilityNumber') : '0');
        locConfig.locationUID = Number(sessionStorage.getItem('locationUID') ? sessionStorage.getItem('locationUID') : '0');
        locConfig.locationName = String(sessionStorage.getItem('locationName') ? sessionStorage.getItem('locationName') : '0');
        locConfig.storeName = String(sessionStorage.getItem('storeName') ? sessionStorage.getItem('storeName') : '0');
        locConfig.pINReqdForSalesTran = (sessionStorage.getItem('pINReqdForSalesTran') ? sessionStorage.getItem('pINReqdForSalesTran') : 'false') == 'true';
        locConfig.associateName = String(sessionStorage.getItem('associateName') ? sessionStorage.getItem('associateName') : '0');
        locConfig.associateRole = String(sessionStorage.getItem('associateRole') ? sessionStorage.getItem('associateRole') : '0');
        locConfig.associateRoleDesc = String(sessionStorage.getItem('associateRoleDesc') ? sessionStorage.getItem('associateRoleDesc') : '0');
        locConfig.contractUID = Number(sessionStorage.getItem('contractUID') ? sessionStorage.getItem('contractUID') : '0');
        locConfig.contractNumber = String(sessionStorage.getItem('contractNumber') ? sessionStorage.getItem('contractNumber') : '0');
        locConfig.vendorNumber = String(sessionStorage.getItem('vendorNumber') ? sessionStorage.getItem('vendorNumber') : '0');
        locConfig.vendorName = String(sessionStorage.getItem('vendorName') ? sessionStorage.getItem('vendorName') : '0');
        locConfig.facilityName = String(sessionStorage.getItem('facilityName') ? sessionStorage.getItem('facilityName') : '0');
        locConfig.individualUID = Number(sessionStorage.getItem('individualUID') ? sessionStorage.getItem('individualUID') : '0');
        locConfig.indLocUID = Number(sessionStorage.getItem('indLocUID') ? sessionStorage.getItem('indLocUID') : '0');
        locConfig.contractStart = new Date(String(sessionStorage.getItem('contractStart') ? sessionStorage.getItem('contractStart') : '1970-01-01:00:00:000'));
        locConfig.contractEnd = new Date(String(sessionStorage.getItem('contractEnd') ? sessionStorage.getItem('contractEnd'): '1970-01-01:00:00:000'));
        locConfig.busFuncCode = String(sessionStorage.getItem('busFuncCode') ? sessionStorage.getItem('busFuncCode') : '0');
        locConfig.assocEmail = String(sessionStorage.getItem('assocEmail') ? sessionStorage.getItem('assocEmail') : '0');
        locConfig.isVendorLogin = (sessionStorage.getItem('isVendorLogin') ? sessionStorage.getItem('isVendorLogin') : 'false') == 'true';
        locConfig.sBMUserFirstName = String(sessionStorage.getItem('sBMUserFirstName') ? sessionStorage.getItem('sBMUserFirstName') : '0');
        locConfig.sBMUserMiddleName = String(sessionStorage.getItem('sBMUserMiddleName') ? sessionStorage.getItem('sBMUserMiddleName') : '0');
        locConfig.sBMUserLastName = String(sessionStorage.getItem('sBMUserLastName') ? sessionStorage.getItem('sBMUserLastName') : '0');
        locConfig.sBMUserJobTitle = String(sessionStorage.getItem('sBMUserJobTitle') ? sessionStorage.getItem('sBMUserJobTitle') : '0');
        locConfig.sBMUserFullName = String(sessionStorage.getItem('sBMUserFullName') ? sessionStorage.getItem('sBMUserFullName') : '0');
        locConfig.sBMFaciltyNumber = String(sessionStorage.getItem('sBMFaciltyNumber') ? sessionStorage.getItem('sBMFaciltyNumber') : '0');
        locConfig.sBMFacilityName = String(sessionStorage.getItem('sBMFacilityName') ? sessionStorage.getItem('sBMFacilityName') : '0');
        locConfig.rgnCode = String(sessionStorage.getItem('rgnCode') ? sessionStorage.getItem('rgnCode') : '0');
        locConfig.countryCode = String(sessionStorage.getItem('countryCode') ? sessionStorage.getItem('countryCode') : '0');
        locConfig.currCode = String(sessionStorage.getItem('currCode') ? sessionStorage.getItem('currCode') : '0');
        locConfig.cCDevice = String(sessionStorage.getItem('cCDevice') ? sessionStorage.getItem('cCDevice') : '0');
        locConfig.regionId = String(sessionStorage.getItem('regionId') ? sessionStorage.getItem('regionId') : '0');
        locConfig.defaultCurrency = String(sessionStorage.getItem('defaultCurrency') ? sessionStorage.getItem('defaultCurrency') : '0');
        locConfig.uSDFastcash = String(sessionStorage.getItem('uSDFastcash') ? sessionStorage.getItem('uSDFastcash') : '0');
        locConfig.frgnFastcash = String(sessionStorage.getItem('frgnFastcash') ? sessionStorage.getItem('frgnFastcash') : '0');
        locConfig.countryDialCode = String(sessionStorage.getItem('countryDialCode') ? sessionStorage.getItem('countryDialCode') : '0');
        locConfig.addressLine1 = String(sessionStorage.getItem('addressLine1') ? sessionStorage.getItem('addressLine1') : '0');
        locConfig.addressLine2 = String(sessionStorage.getItem('addressLine2') ? sessionStorage.getItem('addressLine2') : '0');
        locConfig.city = String(sessionStorage.getItem('city') ? sessionStorage.getItem('city') : '0');
        locConfig.stateProvice = String(sessionStorage.getItem('stateProvice') ? sessionStorage.getItem('stateProvice') : '0');
        locConfig.phoneNumber = String(sessionStorage.getItem('phoneNumber') ? sessionStorage.getItem('phoneNumber') : '0');
        locConfig.postalCode = String(sessionStorage.getItem('postalCode') ? sessionStorage.getItem('postalCode') : '0');
        locConfig.eagleCashOptn = (sessionStorage.getItem('eagleCashOptn') ? sessionStorage.getItem('eagleCashOptn') : 'false') == 'true';
        locConfig.useShipHndlng = (sessionStorage.getItem('useShipHndlng') ? sessionStorage.getItem('useShipHndlng') : 'false') == 'true';

        return locConfig;
    }

    public setDailyExchRate(exchRate: DailyExchRate) {
        sessionStorage.setItem('BusDate', exchRate.BusDate.toString());
        sessionStorage.setItem('CliTimeVar', exchRate.CliTimeVar.toString());
        sessionStorage.setItem('CurrCode', exchRate.CurrCode.toString());
        sessionStorage.setItem('DailyExchRateId', exchRate.DailyExchRateId.toString());
        sessionStorage.setItem('DfltCurrCode', exchRate.DfltCurrCode.toString());
        sessionStorage.setItem('ExchangeRate', exchRate.ExchangeRate.toString());
        sessionStorage.setItem('ForeignCurrCode', exchRate.ForeignCurrCode.toString());
        sessionStorage.setItem('IsForeignCurr', exchRate.IsForeignCurr.toString());
        sessionStorage.setItem('OneFCurrRate', exchRate.OneFCurrRate.toString());
        sessionStorage.setItem('OneUSDRate', exchRate.OneUSDRate.toString());
        sessionStorage.setItem('PrevDayExchRate', exchRate.PrevDayExchRate.toString());
        sessionStorage.setItem('PrevDayIsOneUSD', exchRate.PrevDayIsOneUSD.toString());
        sessionStorage.setItem('SaleTranCount', exchRate.SaleTranCount.toString());
    }

    public setLoadTicket(loadTicket: boolean) {
        sessionStorage.setItem('LoadTicket', loadTicket.toString());
    }

    public getLoadTicket(): boolean {
        return Boolean(sessionStorage.getItem('LoadTicket') ? sessionStorage.getItem('LoadTicket') : 'false').valueOf();
    }

    public getBusDate(): Date {
        let dt = sessionStorage.getItem('BusDate');
        return new Date(Date.parse( dt ? dt : "01/01/1970"));
    }
    public getExchangeRate(): number {
        return Number(sessionStorage.getItem('ExchangeRate') ? sessionStorage.getItem('ExchangeRate') : '0').valueOf();
    }
    public getIsForeignCurr(): boolean {
        return Boolean(sessionStorage.getItem('IsForeignCurr') ? sessionStorage.getItem('IsForeignCurr') : 'false').valueOf();
    }

    public getForeignCurrCode(): string {
        return String(sessionStorage.getItem('ForeignCurrCode') ? sessionStorage.getItem('ForeignCurrCode') : '').valueOf();
    }
    public getDfltCurrCode(): string {
        return String(sessionStorage.getItem('DfltCurrCode') ? sessionStorage.getItem('DfltCurrCode') : 'USD').valueOf();
    }


}
