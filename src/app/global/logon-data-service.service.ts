import { Injectable } from '@angular/core';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';
import { LocationConfigModel } from '../saletran/models/location-config';

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
        sessionStorage.setItem('privActConfmComplete', ltVendorLogonData.privActConfmComplete.toString());
        sessionStorage.setItem('regionId', ltVendorLogonData.regionId);
        sessionStorage.setItem('rgnCode', ltVendorLogonData.rgnCode);
        sessionStorage.setItem('countryCode', ltVendorLogonData.countryCode);
        sessionStorage.setItem('currCode', ltVendorLogonData.currCode);
        sessionStorage.setItem('ccDevice', ltVendorLogonData.ccDevice);
        sessionStorage.setItem('usdFastcash', ltVendorLogonData.usdFastcash);
        sessionStorage.setItem('frgnFastcash', ltVendorLogonData.frgnFastcash);
        sessionStorage.setItem('uuidExists', ltVendorLogonData.uuidExists.toString());
        sessionStorage.setItem('eagleCashOptn', ltVendorLogonData.eagleCashOptn.toString());
        sessionStorage.setItem('useShipHndlng', ltVendorLogonData.useShipHndlng.toString());
        sessionStorage.setItem('tokenString', ltVendorLogonData.tokenString);
    }

    public getLTVendorLogonData(): VendorLoginResultsModel {
        var ltVndrLgnData: VendorLoginResultsModel = new VendorLoginResultsModel();
        ltVndrLgnData.associatePINCount = Number(sessionStorage.getItem("associatePINCount") ? "0" : sessionStorage.getItem("associatePINCount"));
        //
        ltVndrLgnData.associatePINCount = Number(sessionStorage.getItem('associatePINCount') ? '0' : sessionStorage.getItem('associatePINCount'));
        ltVndrLgnData.resetPIN = Number(sessionStorage.getItem('resetPIN') ? '0' : sessionStorage.getItem('resetPIN'));
        ltVndrLgnData.contractUID = Number(sessionStorage.getItem('contractUID') ? '0' : sessionStorage.getItem('contractUID'));
        ltVndrLgnData.contractNumber = String(sessionStorage.getItem('contractNumber') ? "0" : sessionStorage.getItem('contractNumber'));
        ltVndrLgnData.contractStart = String(sessionStorage.getItem('contractStart') ? '0' : sessionStorage.getItem('contractStart'));


        ltVndrLgnData.asociateRole = String(sessionStorage.getItem('asociateRole') ? '0' : sessionStorage.getItem('asociateRole'));
        ltVndrLgnData.associateRoleDesc = String(sessionStorage.getItem('associateRoleDesc') ? '0' : sessionStorage.getItem('associateRoleDesc'));
        ltVndrLgnData.associateName = String(sessionStorage.getItem('associateName') ? '0' : sessionStorage.getItem('associateName'));
        ltVndrLgnData.locationUID = String(sessionStorage.getItem('locationUID') ? '0' : sessionStorage.getItem('locationUID'));
        ltVndrLgnData.eventId = Number(sessionStorage.getItem('eventId') ? '0' : sessionStorage.getItem('eventId'));
        ltVndrLgnData.eventName = String(sessionStorage.getItem('eventName') ? '0' : sessionStorage.getItem('eventName'));
        ltVndrLgnData.facilityNumber = String(sessionStorage.getItem('facilityNumber') ? '0' : sessionStorage.getItem('facilityNumber'));
        ltVndrLgnData.facilityName = String(sessionStorage.getItem('facilityName') ? '0' : sessionStorage.getItem('facilityName'));
        ltVndrLgnData.individualUID = String(sessionStorage.getItem('individualUID') ? '0' : sessionStorage.getItem('individualUID'));
        ltVndrLgnData.isAuthorized = Boolean(sessionStorage.getItem('isAuthorized') ? '0' : sessionStorage.getItem('isAuthorized'));
        ltVndrLgnData.showPrivTrngConfrm = Number(sessionStorage.getItem('showPrivTrngConfrm') ? '0' : sessionStorage.getItem('showPrivTrngConfrm'));
        ltVndrLgnData.cliTimeVar = Number(sessionStorage.getItem('cliTimeVar') ? '0' : sessionStorage.getItem('cliTimeVar'));
        ltVndrLgnData.pageID = Number(sessionStorage.getItem('pageID') ? '0' : sessionStorage.getItem('pageID'));
        ltVndrLgnData.eventStart = new Date(String(sessionStorage.getItem('eventStart') ? '0' : sessionStorage.getItem('eventStart')));
        ltVndrLgnData.eventEnd = new Date(String(sessionStorage.getItem('eventEnd') ? '0' : sessionStorage.getItem('eventEnd')));
        ltVndrLgnData.busFuncCode = String(sessionStorage.getItem('busFuncCode') ? '0' : sessionStorage.getItem('busFuncCode'));
        ltVndrLgnData.busModel = Number(sessionStorage.getItem('busModel') ? '0' : sessionStorage.getItem('busModel'));
        ltVndrLgnData.eventEnded = Boolean(sessionStorage.getItem('eventEnded') ? '0' : sessionStorage.getItem('eventEnded'));
        ltVndrLgnData.emailAddr = String(sessionStorage.getItem('emailAddr') ? '0' : sessionStorage.getItem('emailAddr'));
        ltVndrLgnData.privActConfmComplete = Boolean(sessionStorage.getItem('privActConfmComplete') ? '0' : sessionStorage.getItem('privActConfmComplete'));
        ltVndrLgnData.regionId = String(sessionStorage.getItem('regionId') ? '0' : sessionStorage.getItem('regionId'));
        ltVndrLgnData.rgnCode = String(sessionStorage.getItem('rgnCode') ? '0' : sessionStorage.getItem('rgnCode'));
        ltVndrLgnData.countryCode = String(sessionStorage.getItem('countryCode') ? '0' : sessionStorage.getItem('countryCode'));
        ltVndrLgnData.currCode = String(sessionStorage.getItem('currCode') ? '0' : sessionStorage.getItem('currCode'));
        ltVndrLgnData.ccDevice = String(sessionStorage.getItem('ccDevice') ? '0' : sessionStorage.getItem('ccDevice'));
        ltVndrLgnData.usdFastcash = String(sessionStorage.getItem('usdFastcash') ? '0' : sessionStorage.getItem('usdFastcash'));
        ltVndrLgnData.frgnFastcash = String(sessionStorage.getItem('frgnFastcash') ? '0' : sessionStorage.getItem('frgnFastcash'));
        ltVndrLgnData.uuidExists = Boolean(sessionStorage.getItem('uuidExists') ? '0' : sessionStorage.getItem('uuidExists'));
        ltVndrLgnData.eagleCashOptn = Boolean(sessionStorage.getItem('eagleCashOptn') ? '0' : sessionStorage.getItem('eagleCashOptn'));
        ltVndrLgnData.useShipHndlng = Boolean(sessionStorage.getItem('useShipHndlng') ? '0' : sessionStorage.getItem('useShipHndlng'));
        ltVndrLgnData.tokenString = String(sessionStorage.getItem('tokenString') ? '0' : sessionStorage.getItem('tokenString'));
        

        return ltVndrLgnData;
    }

    public setLocationConfig(locConfig: LocationConfigModel) {
        this._ltLocationConfig = locConfig;
    }

    public getLocationConfig() {
        return this._ltLocationConfig;
    }
}
