import { Injectable } from '@angular/core';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';
import { DailyExchRate } from '../models/exchange.rate';
import { EventConfig } from './models/event.config';
import { TenderTypeModel } from '../longterm/models/tender.type';

@Injectable({
    providedIn: 'root'
})
export class RovLogonDataService {

    private static readonly ROV_TENDER_TYPES_KEY = 'rovTenderTypes';
    private _rovTenderTypeMdl: TenderTypeModel = {} as TenderTypeModel;
    constructor() { }

    public setRovVendorLogonData(rovVendorLogonData: VendorLoginResultsModel): void {

        sessionStorage.setItem('associatePINCount', rovVendorLogonData.associatePINCount.toString());
        sessionStorage.setItem('resetPIN', rovVendorLogonData.resetPIN.toString());
        sessionStorage.setItem('contractUID', rovVendorLogonData.contractUID.toString());
        sessionStorage.setItem('contractNumber', rovVendorLogonData.contractNumber);
        sessionStorage.setItem('contractStart', rovVendorLogonData.contractStart);
        sessionStorage.setItem('userIdentity', rovVendorLogonData.userIdentity.toString());
        sessionStorage.setItem('userRoles', rovVendorLogonData.userRoles.toString());
        sessionStorage.setItem('asociateRole', rovVendorLogonData.associateRole);
        sessionStorage.setItem('associateRoleDesc', rovVendorLogonData.associateRoleDesc);
        sessionStorage.setItem('associateName', rovVendorLogonData.associateName);
        //sessionStorage.setItem('locationUID', rovVendorLogonData.locationUID);
        sessionStorage.setItem('eventId', rovVendorLogonData.eventId.toString());
        sessionStorage.setItem('eventName', rovVendorLogonData.eventName);
        sessionStorage.setItem('facilityNumber', rovVendorLogonData.facilityNumber);
        sessionStorage.setItem('facilityName', rovVendorLogonData.facilityName);
        sessionStorage.setItem('individualUID', rovVendorLogonData.individualUID);
        sessionStorage.setItem('isAuthorized', rovVendorLogonData.isAuthorized.toString());
        sessionStorage.setItem('showPrivTrngConfrm', rovVendorLogonData.showPrivTrngConfrm.toString());
        sessionStorage.setItem('cliTimeVar', rovVendorLogonData.cliTimeVar.toString());
        sessionStorage.setItem('pageID', rovVendorLogonData.pageID.toString());
        sessionStorage.setItem('eventStart', rovVendorLogonData.eventStart.toString());
        sessionStorage.setItem('eventEnd', rovVendorLogonData.eventEnd.toString());
        sessionStorage.setItem('busFuncCode', rovVendorLogonData.busFuncCode);
        sessionStorage.setItem('busModel', rovVendorLogonData.busModel.toString());
        sessionStorage.setItem('eventEnded', rovVendorLogonData.eventEnded.toString());
        sessionStorage.setItem('emailAddr', rovVendorLogonData.emailAddr);
        sessionStorage.setItem('privActConfmComplete', String(rovVendorLogonData.privActConfmComplete != null ? rovVendorLogonData.privActConfmComplete : false));
        sessionStorage.setItem('regionId', rovVendorLogonData.regionId);
        sessionStorage.setItem('rgnCode', rovVendorLogonData.rgnCode);
        sessionStorage.setItem('countryCode', rovVendorLogonData.countryCode);
        sessionStorage.setItem('currCode', rovVendorLogonData.currCode);
        sessionStorage.setItem('ccDevice', rovVendorLogonData.ccDevice);
        sessionStorage.setItem('uuidExists', String(rovVendorLogonData.uuidExists != null ? rovVendorLogonData.uuidExists : false))
        sessionStorage.setItem('eagleCashOptn', String(rovVendorLogonData.eagleCashOptn != null ? rovVendorLogonData.eagleCashOptn : false));
        sessionStorage.setItem('useShipHndlng', String(rovVendorLogonData.useShipHndlng != null ? rovVendorLogonData.useShipHndlng : false));
        sessionStorage.setItem('tokenString', rovVendorLogonData.tokenString);

    }

    public getRovVendorLogonData(): VendorLoginResultsModel {

        var rovVndrLgnData: VendorLoginResultsModel = new VendorLoginResultsModel();
        rovVndrLgnData.associatePINCount = Number(sessionStorage.getItem('associatePINCount') ? sessionStorage.getItem('associatePINCount') : '0')
        rovVndrLgnData.resetPIN = Number(sessionStorage.getItem('resetPIN') ? sessionStorage.getItem('resetPIN') : '0')
        rovVndrLgnData.contractUID = Number(sessionStorage.getItem('contractUID') ? sessionStorage.getItem('contractUID') : '0')
        rovVndrLgnData.contractNumber = String(sessionStorage.getItem('contractNumber') ? sessionStorage.getItem('contractNumber') : '0')
        rovVndrLgnData.contractStart = String(sessionStorage.getItem('contractStart') ? sessionStorage.getItem('contractStart') : '0')
        //ltVndrLgnData.userIdentity = Number(sessionStorage.getItem('userIdentity') ? sessionStorage.getItem('userIdentity') :  '0' )
        //ltVndrLgnData.userRoles = Number(sessionStorage.getItem('userRoles') ? sessionStorage.getItem('userRoles') :  '0' )
        rovVndrLgnData.associateRole = String(sessionStorage.getItem('asociateRole') ? sessionStorage.getItem('asociateRole') : '0')
        rovVndrLgnData.associateRoleDesc = String(sessionStorage.getItem('associateRoleDesc') ? sessionStorage.getItem('associateRoleDesc') : '0')
        rovVndrLgnData.associateName = String(sessionStorage.getItem('associateName') ? sessionStorage.getItem('associateName') : '0')
        //rovVndrLgnData.locationUID = String(sessionStorage.getItem('locationUID') ? sessionStorage.getItem('locationUID') : '0')
        rovVndrLgnData.eventId = Number(sessionStorage.getItem('eventId') ? sessionStorage.getItem('eventId') : '0')
        rovVndrLgnData.eventName = String(sessionStorage.getItem('eventName') ? sessionStorage.getItem('eventName') : '0')
        rovVndrLgnData.facilityNumber = String(sessionStorage.getItem('facilityNumber') ? sessionStorage.getItem('facilityNumber') : '0')
        rovVndrLgnData.facilityName = String(sessionStorage.getItem('facilityName') ? sessionStorage.getItem('facilityName') : '0')
        rovVndrLgnData.individualUID = String(sessionStorage.getItem('individualUID') ? sessionStorage.getItem('individualUID') : '0')
        rovVndrLgnData.isAuthorized = Boolean(sessionStorage.getItem('isAuthorized') ? sessionStorage.getItem('isAuthorized') : '0')
        rovVndrLgnData.showPrivTrngConfrm = Number(sessionStorage.getItem('showPrivTrngConfrm') ? sessionStorage.getItem('showPrivTrngConfrm') : '0')
        rovVndrLgnData.cliTimeVar = Number(sessionStorage.getItem('cliTimeVar') ? sessionStorage.getItem('cliTimeVar') : '0')
        rovVndrLgnData.pageID = Number(sessionStorage.getItem('pageID') ? sessionStorage.getItem('pageID') : '0')
        rovVndrLgnData.eventStart = new Date(String(sessionStorage.getItem('eventStart') ? sessionStorage.getItem('eventStart') : '0'))
        rovVndrLgnData.eventEnd = new Date(String(sessionStorage.getItem('eventEnd') ? sessionStorage.getItem('eventEnd') : '0'))
        rovVndrLgnData.busFuncCode = String(sessionStorage.getItem('busFuncCode') ? sessionStorage.getItem('busFuncCode') : '0')
        rovVndrLgnData.busModel = Number(sessionStorage.getItem('busModel') ? sessionStorage.getItem('busModel') : '0')
        rovVndrLgnData.eventEnded = Boolean(sessionStorage.getItem('eventEnded') ? sessionStorage.getItem('eventEnded') : '0')
        rovVndrLgnData.emailAddr = String(sessionStorage.getItem('emailAddr') ? sessionStorage.getItem('emailAddr') : '0')
        rovVndrLgnData.privActConfmComplete = Boolean(sessionStorage.getItem('privActConfmComplete') ? sessionStorage.getItem('privActConfmComplete') : '0')
        rovVndrLgnData.regionId = String(sessionStorage.getItem('regionId') ? sessionStorage.getItem('regionId') : '0')
        rovVndrLgnData.rgnCode = String(sessionStorage.getItem('rgnCode') ? sessionStorage.getItem('rgnCode') : '0')
        rovVndrLgnData.countryCode = String(sessionStorage.getItem('countryCode') ? sessionStorage.getItem('countryCode') : '0')
        rovVndrLgnData.currCode = String(sessionStorage.getItem('currCode') ? sessionStorage.getItem('currCode') : '0')
        rovVndrLgnData.ccDevice = String(sessionStorage.getItem('ccDevice') ? sessionStorage.getItem('ccDevice') : '0')
        rovVndrLgnData.usdFastcash = String(sessionStorage.getItem('usdFastcash') ? sessionStorage.getItem('usdFastcash') : '0')
        rovVndrLgnData.frgnFastcash = String(sessionStorage.getItem('frgnFastcash') ? sessionStorage.getItem('frgnFastcash') : '0')
        rovVndrLgnData.uuidExists = Boolean(sessionStorage.getItem('uuidExists') ? sessionStorage.getItem('uuidExists') : '0')
        rovVndrLgnData.eagleCashOptn = Boolean(sessionStorage.getItem('eagleCashOptn') ? sessionStorage.getItem('eagleCashOptn') : '0')
        rovVndrLgnData.useShipHndlng = Boolean(sessionStorage.getItem('useShipHndlng') ? sessionStorage.getItem('useShipHndlng') : '0')
        rovVndrLgnData.tokenString = String(sessionStorage.getItem('tokenString') ? sessionStorage.getItem('tokenString') : '0')

        return rovVndrLgnData;
    }

    public setRovEventConfig(evConfig: EventConfig) {

        if (evConfig == null)
            return;

        sessionStorage.setItem('businessFunctionUID', evConfig.businessFunctionUID.toString());
        sessionStorage.setItem('businessModel', evConfig.businessModel.toString());
        sessionStorage.setItem('allowPartPay', (evConfig.allowPartPay ? evConfig.allowPartPay : false).toString());
        sessionStorage.setItem('allowSaveTkt', (evConfig.allowSaveTkt ? evConfig.allowSaveTkt : false).toString());
        sessionStorage.setItem('allowTips', (evConfig.allowTips ? evConfig.allowTips : false).toString());
        sessionStorage.setItem('openCashDrawer', (evConfig.openCashDrawer ? evConfig.openCashDrawer : false).toString());
        sessionStorage.setItem('exchCouponsAfterTax', (evConfig.exchCouponsAfterTax ? evConfig.exchCouponsAfterTax : false).toString());
        sessionStorage.setItem('vendCouponsAfterTax', (evConfig.vendCouponsAfterTax ? evConfig.vendCouponsAfterTax : false).toString());
        sessionStorage.setItem('facilityUID', evConfig.facilityUID.toString());
        sessionStorage.setItem('facilityNumber', evConfig.facilityNumber)
        sessionStorage.setItem('eventID', evConfig.eventID.toString());
        sessionStorage.setItem('eventName', evConfig.eventName);
        sessionStorage.setItem('pinReqdForSalesTran', (evConfig.pinReqdForSalesTran ? evConfig.pinReqdForSalesTran : false).toString());
        sessionStorage.setItem('associateName', evConfig.associateName);
        sessionStorage.setItem('associateRole', evConfig.associateRole);
        sessionStorage.setItem('associateRoleDesc', evConfig.associateRoleDesc);
        sessionStorage.setItem('contractUID', evConfig.contractUID.toString());
        sessionStorage.setItem('contractNumber', evConfig.contractNumber);
        //sessionStorage.setItem('vendorNumber', locConfig.vendorNumber);
        //sessionStorage.setItem('vendorName', locConfig.vendorName);
        sessionStorage.setItem('facilityName', evConfig.facilityName);
        sessionStorage.setItem('individualUID', (evConfig.individualUID != null ? evConfig.individualUID : '0').toString());
        sessionStorage.setItem('indLocUID', (evConfig.indLocUID != null ? evConfig.indLocUID : '0').toString());
        sessionStorage.setItem('contractStart', evConfig.contractStart.toString());
        sessionStorage.setItem('contractEnd', String(evConfig.contractEnd != null ? evConfig.contractEnd : false));
        sessionStorage.setItem('busFuncCode', evConfig.busFuncCode);
        sessionStorage.setItem('assocEmail', evConfig.assocEmail);
        sessionStorage.setItem('isVendorLogin', String(evConfig.isVendorLogin != null ? evConfig.isVendorLogin : false));
        sessionStorage.setItem('sBMUserFirstName', evConfig.sBMUserFirstName);
        sessionStorage.setItem('sBMUserMiddleName', evConfig.sBMUserMiddleName);
        sessionStorage.setItem('sBMUserLastName', evConfig.sBMUserLastName);
        sessionStorage.setItem('sBMUserJobTitle', evConfig.sBMUserJobTitle);
        sessionStorage.setItem('sBMUserFullName', evConfig.sBMUserFullName);
        sessionStorage.setItem('sBMFaciltyNumber', evConfig.sBMFaciltyNumber);
        sessionStorage.setItem('sBMFacilityName', evConfig.sBMFacilityName);
        sessionStorage.setItem('rgnCode', evConfig.rgnCode);
        sessionStorage.setItem('countryCode', evConfig.countryCode);
        sessionStorage.setItem('currCode', evConfig.currCode);
        sessionStorage.setItem('cCDevice', evConfig.cCDevice);
        sessionStorage.setItem('regionId', evConfig.regionId);
        sessionStorage.setItem('defaultCurrency', evConfig.defaultCurrency);
        sessionStorage.setItem('usdFastcash', evConfig.usdFastcash);
        sessionStorage.setItem('frgnFastcash', evConfig.frgnFastcash);
        sessionStorage.setItem('countryDialCode', evConfig.countryDialCode);
        sessionStorage.setItem('addressLine1', evConfig.addressLine1);
        sessionStorage.setItem('addressLine2', evConfig.addressLine2);
        sessionStorage.setItem('city', evConfig.city);
        sessionStorage.setItem('stateProvice', evConfig.stateProvice);
        sessionStorage.setItem('phoneNumber', evConfig.phoneNumber);
        sessionStorage.setItem('postalCode', evConfig.postalCode);
        sessionStorage.setItem('eagleCashOptn', String(evConfig.eagleCashOptn != null ? evConfig.eagleCashOptn : false));
        sessionStorage.setItem('useShipHndlng', String(evConfig.useShipHndlng != null ? evConfig.useShipHndlng : false));

        sessionStorage.setItem('inProgTranId', String(evConfig.inProgTranId));
        sessionStorage.setItem('inProgTranTabSerialNum', evConfig.inProgTranTabSerialNum);
        sessionStorage.setItem('tenderDateTime', String(evConfig.tenderDateTime));
        sessionStorage.setItem('discMilstarBinRange', evConfig.discMilstarBinRange);

    }


    public getRovEventConfig(): EventConfig {
        //return this._ltLocationConfig;
        let rovConfig: EventConfig = new EventConfig();
        rovConfig.businessFunctionUID = Number(sessionStorage.getItem('businessFunctionUID') ? sessionStorage.getItem('businessFunctionUID') : '0');
        rovConfig.businessModel = Number(sessionStorage.getItem('businessModel') ? sessionStorage.getItem('businessModel') : '0');
        rovConfig.allowPartPay = (sessionStorage.getItem('allowPartPay') ? sessionStorage.getItem('allowPartPay')?.toLowerCase() : 'false') == 'true';
        rovConfig.allowSaveTkt = (sessionStorage.getItem('allowSaveTkt') ? sessionStorage.getItem('allowSaveTkt')?.toLowerCase() : 'false') == 'true';
        rovConfig.allowTips = (sessionStorage.getItem('allowTips') ? sessionStorage.getItem('allowTips') : 'false') == 'true';
        rovConfig.openCashDrawer = (sessionStorage.getItem('openCashDrawer') ? sessionStorage.getItem('openCashDrawer') : 'false') == 'true';
        rovConfig.exchCouponsAfterTax = (sessionStorage.getItem('exchCouponsAfterTax') ? sessionStorage.getItem('exchCouponsAfterTax') : 'false') == 'true';
        rovConfig.vendCouponsAfterTax = (sessionStorage.getItem('vendCouponsAfterTax') ? sessionStorage.getItem('vendCouponsAfterTax') : 'false') == 'true';
        rovConfig.facilityUID = Number(sessionStorage.getItem('facilityUID') ? sessionStorage.getItem('facilityUID') : '0');
        rovConfig.facilityNumber = String(sessionStorage.getItem('facilityNumber') ? sessionStorage.getItem('facilityNumber') : '0');
        rovConfig.eventID = Number(sessionStorage.getItem('eventID') ? sessionStorage.getItem('eventID') : '0');
        rovConfig.eventName = String(sessionStorage.getItem('eventName') ? sessionStorage.getItem('eventName') : '0');
        //locConfig.storeName = String(sessionStorage.getItem('storeName') ? sessionStorage.getItem('storeName') : '0');
        rovConfig.pinReqdForSalesTran = (sessionStorage.getItem('pinReqdForSalesTran') ? sessionStorage.getItem('pinReqdForSalesTran') : 'false') == 'true';
        rovConfig.associateName = String(sessionStorage.getItem('associateName') ? sessionStorage.getItem('associateName') : '0');
        rovConfig.associateRole = String(sessionStorage.getItem('associateRole') ? sessionStorage.getItem('associateRole') : '0');
        rovConfig.associateRoleDesc = String(sessionStorage.getItem('associateRoleDesc') ? sessionStorage.getItem('associateRoleDesc') : '0');
        rovConfig.contractUID = Number(sessionStorage.getItem('contractUID') ? sessionStorage.getItem('contractUID') : '0');
        rovConfig.contractNumber = String(sessionStorage.getItem('contractNumber') ? sessionStorage.getItem('contractNumber') : '0');
        rovConfig.vendorNumber = String(sessionStorage.getItem('vendorNumber') ? sessionStorage.getItem('vendorNumber') : '0');
        rovConfig.vendorName = String(sessionStorage.getItem('vendorName') ? sessionStorage.getItem('vendorName') : '0');
        rovConfig.facilityName = String(sessionStorage.getItem('facilityName') ? sessionStorage.getItem('facilityName') : '0');
        rovConfig.individualUID = Number(sessionStorage.getItem('individualUID') ? sessionStorage.getItem('individualUID') : '0');
        rovConfig.indLocUID = Number(sessionStorage.getItem('indLocUID') ? sessionStorage.getItem('indLocUID') : '0');
        rovConfig.contractStart = new Date(String(sessionStorage.getItem('contractStart') ? sessionStorage.getItem('contractStart') : '1970-01-01:00:00:000'));
        rovConfig.contractEnd = new Date(String(sessionStorage.getItem('contractEnd') ? sessionStorage.getItem('contractEnd') : '1970-01-01:00:00:000'));
        rovConfig.busFuncCode = String(sessionStorage.getItem('busFuncCode') ? sessionStorage.getItem('busFuncCode') : '0');
        rovConfig.assocEmail = String(sessionStorage.getItem('assocEmail') ? sessionStorage.getItem('assocEmail') : '0');
        rovConfig.isVendorLogin = (sessionStorage.getItem('isVendorLogin') ? sessionStorage.getItem('isVendorLogin') : 'false') == 'true';
        rovConfig.sBMUserFirstName = String(sessionStorage.getItem('sBMUserFirstName') ? sessionStorage.getItem('sBMUserFirstName') : '0');
        rovConfig.sBMUserMiddleName = String(sessionStorage.getItem('sBMUserMiddleName') ? sessionStorage.getItem('sBMUserMiddleName') : '0');
        rovConfig.sBMUserLastName = String(sessionStorage.getItem('sBMUserLastName') ? sessionStorage.getItem('sBMUserLastName') : '0');
        rovConfig.sBMUserJobTitle = String(sessionStorage.getItem('sBMUserJobTitle') ? sessionStorage.getItem('sBMUserJobTitle') : '0');
        rovConfig.sBMUserFullName = String(sessionStorage.getItem('sBMUserFullName') ? sessionStorage.getItem('sBMUserFullName') : '0');
        rovConfig.sBMFaciltyNumber = String(sessionStorage.getItem('sBMFaciltyNumber') ? sessionStorage.getItem('sBMFaciltyNumber') : '0');
        rovConfig.sBMFacilityName = String(sessionStorage.getItem('sBMFacilityName') ? sessionStorage.getItem('sBMFacilityName') : '0');
        rovConfig.rgnCode = String(sessionStorage.getItem('rgnCode') ? sessionStorage.getItem('rgnCode') : '0');
        rovConfig.countryCode = String(sessionStorage.getItem('countryCode') ? sessionStorage.getItem('countryCode') : '0');
        rovConfig.currCode = String(sessionStorage.getItem('currCode') ? sessionStorage.getItem('currCode') : '0');
        rovConfig.cCDevice = String(sessionStorage.getItem('cCDevice') ? sessionStorage.getItem('cCDevice') : '0');
        rovConfig.regionId = String(sessionStorage.getItem('regionId') ? sessionStorage.getItem('regionId') : '0');
        rovConfig.defaultCurrency = String(sessionStorage.getItem('defaultCurrency') ? sessionStorage.getItem('defaultCurrency') : '0');
        rovConfig.usdFastcash = String(sessionStorage.getItem('usdFastcash') ? sessionStorage.getItem('usdFastcash') : '0');
        rovConfig.frgnFastcash = String(sessionStorage.getItem('frgnFastcash') ? sessionStorage.getItem('frgnFastcash') : '0');
        rovConfig.countryDialCode = String(sessionStorage.getItem('countryDialCode') ? sessionStorage.getItem('countryDialCode') : '0');
        rovConfig.addressLine1 = String(sessionStorage.getItem('addressLine1') ? sessionStorage.getItem('addressLine1') : '0');
        rovConfig.addressLine2 = String(sessionStorage.getItem('addressLine2') ? sessionStorage.getItem('addressLine2') : '0');
        rovConfig.city = String(sessionStorage.getItem('city') ? sessionStorage.getItem('city') : '0');
        rovConfig.stateProvice = String(sessionStorage.getItem('stateProvice') ? sessionStorage.getItem('stateProvice') : '0');
        rovConfig.phoneNumber = String(sessionStorage.getItem('phoneNumber') ? sessionStorage.getItem('phoneNumber') : '0');
        rovConfig.postalCode = String(sessionStorage.getItem('postalCode') ? sessionStorage.getItem('postalCode') : '0');
        rovConfig.eagleCashOptn = (sessionStorage.getItem('eagleCashOptn') ? sessionStorage.getItem('eagleCashOptn') : 'false') == 'true';
        rovConfig.useShipHndlng = (sessionStorage.getItem('useShipHndlng') ? sessionStorage.getItem('useShipHndlng') : 'false') == 'true';
        rovConfig.inProgTranId = (sessionStorage.getItem('inProgTranId') ? Number(sessionStorage.getItem('inProgTranId')) : 0)
        rovConfig.inProgTranTabSerialNum = (sessionStorage.getItem('inProgTranTabSerialNum') ?? "")
        rovConfig.tenderDateTime = sessionStorage.getItem('tenderDateTime')
            ? new Date(sessionStorage.getItem('tenderDateTime')!)
            : new Date();
        rovConfig.discMilstarBinRange = sessionStorage.getItem('discMilstarBinRange') ?? '650155';
        return rovConfig;
    }

    public setTranIsRefund(IsRefund: boolean) {
        sessionStorage.setItem('tranmode', IsRefund.toString());
    }

    public getTranIsRefund() {
        return (sessionStorage.getItem('tranmode') ? sessionStorage.getItem('tranmode')?.toLowerCase() : 'false') == 'true';
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

    public getEventId(): number {
        return Number(sessionStorage.getItem('eventId') ? sessionStorage.getItem('eventId') : '0');
    }

    public getExchCouponAfterTax(): boolean {
        return (sessionStorage.getItem('exchCouponsAfterTax') ? sessionStorage.getItem('exchCouponsAfterTax')?.toLowerCase() : 'false') == 'true';
    }
    public getVendorCouponAfterTax(): boolean {
        return (sessionStorage.getItem('vendCouponsAfterTax') ? sessionStorage.getItem('vendCouponsAfterTax')?.toLowerCase() : 'false') == 'true';
    }

    public getDailyExchRate(): DailyExchRate {
        var dailyExchRate: DailyExchRate = new DailyExchRate();

        dailyExchRate.busDate = new Date(Date.parse(sessionStorage.getItem('BusDate') ? sessionStorage.getItem('BusDate')! : "01/01/1970"));
        dailyExchRate.cliTimeVar = Number(sessionStorage.getItem('CliTimeVar') ? sessionStorage.getItem('CliTimeVar') : '0');
        dailyExchRate.currCode = String(sessionStorage.getItem('CurrCode') ? sessionStorage.getItem('CurrCode') : '');
        dailyExchRate.dailyExchRateId = Number(sessionStorage.getItem('DailyExchRateId') ? sessionStorage.getItem('DailyExchRateId') : '0');
        dailyExchRate.dfltCurrCode = String(sessionStorage.getItem('DfltCurrCode') ? sessionStorage.getItem('DfltCurrCode') : '');
        dailyExchRate.exchangeRate = Number(sessionStorage.getItem('ExchangeRate') ? sessionStorage.getItem('ExchangeRate') : '0');
        dailyExchRate.isForeignCurr = Boolean(sessionStorage.getItem('IsForeignCurr') ? (sessionStorage.getItem('IsForeignCurr') == 'true' ? 1 : 0) : 0);
        dailyExchRate.oneFCurrRate = Number(sessionStorage.getItem('OneFCurrRate') ? sessionStorage.getItem('OneFCurrRate') : '0');
        dailyExchRate.oneUSDRate = Number(sessionStorage.getItem('OneUSDRate') ? sessionStorage.getItem('OneUSDRate') : '0');
        dailyExchRate.prevDayExchRate = Number(sessionStorage.getItem('PrevDayExchRate') ? sessionStorage.getItem('PrevDayExchRate') : '0');
        dailyExchRate.prevDayIsOneUSD = Boolean(sessionStorage.getItem('PrevDayIsOneUSD') ? sessionStorage.getItem('PrevDayIsOneUSD') : 'false');
        dailyExchRate.saleTranCount = Number(sessionStorage.getItem('SaleTranCount') ? sessionStorage.getItem('SaleTranCount') : '0');

        return dailyExchRate;
    }

    public setDailyExchRate(exchRate: DailyExchRate) {
        sessionStorage.setItem('IsForeignCurr', exchRate.isForeignCurr.toString());
        if (exchRate.isForeignCurr) {
            // Additional logic for foreign currency can be added here
            sessionStorage.setItem('BusDate', exchRate.busDate.toString());
            sessionStorage.setItem('CliTimeVar', exchRate.cliTimeVar.toString());
            sessionStorage.setItem('CurrCode', exchRate.currCode.toString());
            sessionStorage.setItem('DailyExchRateId', exchRate.dailyExchRateId.toString());
            sessionStorage.setItem('DfltCurrCode', exchRate.dfltCurrCode.toString());
            if (exchRate.currCode != exchRate.dfltCurrCode) {
                sessionStorage.setItem('NonDfltCurrCode', exchRate.currCode.toString());
            }
            else {
                sessionStorage.setItem('NonDfltCurrCode', 'USD');
            }
            sessionStorage.setItem('ExchangeRate', exchRate.exchangeRate.toString());
            sessionStorage.setItem('OneFCurrRate', exchRate.oneFCurrRate.toString());
            sessionStorage.setItem('OneUSDRate', exchRate.oneUSDRate.toString());
            sessionStorage.setItem('PrevDayExchRate', exchRate.prevDayExchRate.toString());
            sessionStorage.setItem('PrevDayIsOneUSD', exchRate.prevDayIsOneUSD.toString());
            sessionStorage.setItem('SaleTranCount', exchRate.saleTranCount.toString());
        }
        else {
            sessionStorage.setItem('BusDate', new Date().toLocaleDateString());
            sessionStorage.setItem('ExchangeRate', '1');
            sessionStorage.setItem('CurrCode', "USD");
            sessionStorage.setItem('DfltCurrCode', "USD");
            sessionStorage.setItem('OneUSDRate', "1");
            sessionStorage.setItem('NonDfltCurrCode', 'USD');
            sessionStorage.setItem('OneFCurrRate', "1");
            sessionStorage.setItem('PrevDayExchRate', "1");
            sessionStorage.setItem('PrevDayIsOneUSD', "1");
        }
    }

    public setLoadTicket(loadTicket: boolean) {
        sessionStorage.setItem('LoadTicket', loadTicket.toString());
    }

    public getLoadTicket(): boolean {
        return Boolean(sessionStorage.getItem('LoadTicket') ? sessionStorage.getItem('LoadTicket') : 'false').valueOf();
    }

    public getBusDate(): Date {
        let dt = sessionStorage.getItem('BusDate');
        return new Date(Date.parse(dt ? dt : "01/01/1970"));
    }
    public getExchangeRate(): number {
        return Number(sessionStorage.getItem('ExchangeRate') ? sessionStorage.getItem('ExchangeRate') : '0').valueOf();
    }
    public getIsForeignCurr(): boolean {
        return Boolean(sessionStorage.getItem('IsForeignCurr') ? (sessionStorage.getItem('IsForeignCurr') == 'true' ? 1 : 0) : 0);
    }

    public getNonDfltCurrCode(): string {
        return String(sessionStorage.getItem('NonDfltCurrCode') ? sessionStorage.getItem('NonDfltCurrCode') : '').valueOf();
    }
    public getDfltCurrCode(): string {
        return String(sessionStorage.getItem('DfltCurrCode') ? sessionStorage.getItem('DfltCurrCode') : 'USD').valueOf();
    }

    public getTenderTypes(): TenderTypeModel {
        const savedTenderTypes = sessionStorage.getItem(RovLogonDataService.ROV_TENDER_TYPES_KEY);
        if (!savedTenderTypes) {
            return { results: {} as any, types: [] } as TenderTypeModel;
        }

        try {
            return JSON.parse(savedTenderTypes) as TenderTypeModel;
        }
        catch {
            this.clearTenderTypes();
            return { results: {} as any, types: [] } as TenderTypeModel;
        }
    }

    public setTenderTypes(tndrMdl: TenderTypeModel) {
        const tenderTypeMdl = JSON.parse(JSON.stringify(tndrMdl || {})) as TenderTypeModel;
        tenderTypeMdl.results = tenderTypeMdl.results || ({} as any);
        tenderTypeMdl.types = tenderTypeMdl.types || [];

        let locConfig = this.getRovEventConfig();
        if (locConfig.eagleCashOptn == false) {

            let egTndrs = tenderTypeMdl.types.filter(tndr => tndr.tenderTypeCode == 'EG');
            if (egTndrs && egTndrs.length > 0) {
                let eg = egTndrs[0]
                if (eg)
                    eg.displayThisTender = false;

            }
        }

        if (locConfig.rgnCode == 'OCONE' || locConfig.rgnCode == 'OCONP') {
            const excludedByDevice: Record<string, Set<string>> = {
                E: new Set(['CC', 'CR']),
                C: new Set(['XC', 'XR'])
            };
            const excluded = locConfig.cCDevice && excludedByDevice[locConfig.cCDevice];
            if (excluded) {
                tenderTypeMdl.types = tenderTypeMdl.types.filter(tndr => !excluded.has(tndr.tenderTypeCode));
            }
        }
        else if (locConfig.rgnCode == 'CON') {
            const excludedCON = new Set(['XC', 'XR', 'MS', 'MR']);
            tenderTypeMdl.types = tenderTypeMdl.types.filter(tndr => !excludedCON.has(tndr.tenderTypeCode));
        }

        sessionStorage.setItem(RovLogonDataService.ROV_TENDER_TYPES_KEY, JSON.stringify(tenderTypeMdl));
    }

    public clearTenderTypes(): void {
        sessionStorage.removeItem(RovLogonDataService.ROV_TENDER_TYPES_KEY);
    }

}
