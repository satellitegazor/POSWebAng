import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalConstants } from '../../global/global.constants';
import { Dept, SaleItem, SalesCat } from '../models/sale.item';
import { SaleItemResultsModel } from '../models/sale.item.results.model';
import { Observable, throwError } from 'rxjs';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { VendorLoginResultsModel } from '../../models/vendor.login.results.model';
import { LogonDataService } from '../../global/logon-data-service.service';
import { LTC_CustomerLookupResultsModel } from '../../models/customer';
import { LocationConfigModel } from '../models/location-config';
import { LTC_LocationAssociatesResultsModel } from '../models/location.associates';
import { SaveTicketResultsModel, TicketSplit } from 'src/app/models/ticket.split';
import { DailyExchRateMdl } from 'src/app/models/exchange.rate';
import { TenderTypeModel } from '../models/tender.type';
import { LTC_SingleTransactionResultsModel, LTC_Ticket, LTC_TransactionDetailsModel, SingleTransactionId, TicketLookupResult } from '../models/ticket.list';


@Injectable({
  providedIn: 'root'
})
export class SalesTranService {

    headerObjs: HttpHeaders;
    vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

    allItemButtonMenuList: SaleItem[] = [];
    deptList: Dept[] = [];

    constructor(private httpClient: HttpClient) {
        this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
        this.headerObjs = this.headerObjs.append('Accept', '*/*');
        
        
        //this._sharedSvc.LogonDetails.subscribe(data => {
        //    this.vendorLoginResult = data;
        //    console.log('subscribe data arrived')

        //});
        //this.vendorLoginResult = _sharedSvc.getLTVendorLogonData();
        //this.getAllSaleItems();
    }

    //public getVendorLogonData(): VendorLoginResultsModel {
    //    console.log('getVendorLogonData')
    //    this.vendorLoginResult = this._sharedSvc.getLTVendorLogonData();
    //    this.getAllSaleItems();
    //    return this.vendorLoginResult;
    //}

    //public getAllSaleItems() {
    //    this.getSaleItemListFromDB(Number.parseInt(this.vendorLoginResult.locationUID, 0), this.vendorLoginResult.contractUID).subscribe(saleItemRsltMdl => {
    //        this.allItemButtonMenuList = saleItemRsltMdl.itemButtonMenuResults;
    //        this.getDeptList();
    //    });
    //}

    public getSaleItemListFromDB(locationId: number, contractid: number): Observable<SaleItemResultsModel> {
        console.log('SalesTranSvc getSaleItemListFromDB called')
        return this.httpClient.get<SaleItemResultsModel>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetMenuItem?guid=' + GlobalConstants.GET_GUID +
            '&uid=0&pLocationUID=' + locationId + '&pContractUID=' + contractid + '&pFacilityUID=0&pBusinessFunctionUID=0&pSalesCatUID=0&pDepartmentUID=0&pActive=1',
            { headers: this.headerObjs });
    }
 
    public getVendorLoginResult(): VendorLoginResultsModel {
        console.log('SalesTranSvc getVendorLoginResult called')
        return this.vendorLoginResult;
    }

    public getCustomerLookup(pFirst: string, pLast: string, pPhone: string, uid: number): Observable<LTC_CustomerLookupResultsModel> {
        console.log('SalesTranSvc getSaleItemListFromDB called')
        return this.httpClient.get<LTC_CustomerLookupResultsModel>(GlobalConstants.CPOS_SVCS_URL + '/common/GetCustomerLookup?guid=' + GlobalConstants.GET_GUID +
            '&uid=0&pFirst=' + pFirst + '&pLast=' + pLast  + '&pPhone=' + pPhone + '',
            { headers: this.headerObjs });
    }

    public getLocationConfig(locationId: number, individualUID: number) {

        return this.httpClient.get<LocationConfigModel>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetLocationConfigs?guid=' + GlobalConstants.GET_GUID +
            '&uid=' + individualUID.toString() + '&lid=' + locationId.toString(),
            { headers: this.headerObjs });
    }

    public getLocationAssociates(locationId: number, individualUID: number) {

        return this.httpClient.get<LTC_LocationAssociatesResultsModel>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetLocationAssociates?guid=' + GlobalConstants.GET_GUID +
            '&lid=' + locationId.toString() + '&uid=' + individualUID.toString() + '&active=1',
            { headers: this.headerObjs });
    }

    public saveTicketSplit(model: TicketSplit) {
        
        return this.httpClient.put<SaveTicketResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveSplitPayments?guid=' + GlobalConstants.PUT_GUID + '&uid=' + model.individualUID + '&DBVal=0',
            JSON.stringify(model),
            { headers: this.headerObjs });
    }

    public GetDailyExchRate(locationId: number, busdate: string, individualUID: number) {
        return this.httpClient.get<DailyExchRateMdl>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetDailyExchRate?guid=' + GlobalConstants.GET_GUID + '&LocationId=' + locationId + '&BusDate=' + busdate + '&uid=' + individualUID + '&DBVal=0',
            {headers: this.headerObjs});
    }

    public getTenderTypes(appType: number, individualUID: number) {

        return this.httpClient.get<TenderTypeModel>(GlobalConstants.CPOS_SVCS_URL + '/common/GetTenderTypes?guid=' + GlobalConstants.GET_GUID +
            '&uid=' + individualUID.toString() + '&AppType=' + appType.toString(),
            { headers: this.headerObjs });
    }

    public getTicketLookup(individualUID: number, locationid: number, ticketNum: number, phone: string, firstname: string, lastname: string) {

        return this.httpClient.get<TicketLookupResult>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetTicketLookup?guid=' + GlobalConstants.GET_GUID +
            '&uid=' + individualUID.toString() + '&lid=' + locationid.toString() + '&ticketnum=' + ticketNum.toString() + '&phone=' + phone + '&fname=' + firstname + '&lname=' + lastname ,
            { headers: this.headerObjs });
    }

    public getTranIdForTicketNum(pLocationUID: number, pTicketNum: number, pIndividualId: number) {

        return this.httpClient.get<SingleTransactionId>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetTranId?guid=' + GlobalConstants.GET_GUID + 
            '&uid=' + pIndividualId.toString() + '&TicketNum=' + pTicketNum.toString() + '&LocationId=' + pLocationUID, 
            {headers: this.headerObjs});
    }

    public getSingleTransaction(uid: number, pTransactionID: number, pIsCancelled: boolean, pCancelTypeId: number, 
            pCancelOtherRsn: string, CliTimeVar: number, pPartPayID: number) {

        return this.httpClient.get<LTC_SingleTransactionResultsModel>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetSingleTransaction?guid=' + GlobalConstants.GET_GUID + 
            '&uid=' + uid.toString() + '&pTransactionID=' + pTransactionID.toString() + '&pIsCancelled=' + pIsCancelled + 
            '&pCancelTypeId=' + pCancelTypeId.toString() + '&pCancelOtherRsn=' + pCancelOtherRsn +
            '&CliTimeVar=' + CliTimeVar.toString() + '&pPartPayID=' + pPartPayID.toString());
    }

    public getTransactionDetails(uid: string = '', pTransactionID: number = 0, pCustomerFirstName: string = '',
        pCustomerLastName: string = '', pCustomerPhone: string = '', pContractUID: number = 0, pLocationUID: number = 0, 
        pFacilityUID: number = 0, pDepartmentUID: number = 0, pSource: string = '', pCustomerUID: number = 0) {

        return this.httpClient.get<LTC_TransactionDetailsModel>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetTransactionDetails?guid=' + GlobalConstants.GET_GUID 
            + '&uid=' + uid.toString() + '&pTransactionID=' + pTransactionID.toString() + '&pCustomerFirstName=' + pCustomerFirstName
            + '&pCustomerLastName=' + pCustomerLastName + '&pCustomerPhone=' + pCustomerPhone + '&pContractUID=' + pContractUID
            + '&pLocationUID=' + pLocationUID + '&pFacilityUID=' + pFacilityUID + '&pDepartmentUID=' + pDepartmentUID
            + '&pSource=' + pSource + '&pCustomerUID=' + pCustomerUID)

    }

}
  