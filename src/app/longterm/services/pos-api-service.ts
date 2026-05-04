


import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalConstants } from '../../global/global.constants';
import { Dept, SaleItem, SalesCat, SalesCategorySaveResponse } from '../models/sale.item';
import { SaleItemResultsModel } from '../models/sale.item.results.model';
import { Observable, throwError } from 'rxjs';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { VendorLoginResultsModel } from '../../models/vendor.login.results.model';
import { LogonDataService } from '../../global/logon-data-service.service';
import { LTC_CustomerLookupResultsModel } from '../../models/customer';
import { LocationConfigModel } from '../models/location-config';
import { LTC_LocationAssociatesResultsModel } from '../models/location.associates';
import { SaveTicketResultsModel, TicketSplit } from '../../models/ticket.split';
import { DailyExchRateMdl } from '../../models/exchange.rate'
import { TenderTypeModel } from '../models/tender.type';
import { LTC_SingleTransactionResultsModel, LTC_Ticket, LTC_TransactionDetailsModel, SingleTransactionId, TicketLookupResult } from '../models/ticket.list';
import { TicketTender,  SaveTenderResult, SaveTenderResultModel } from '../../models/ticket.tender';
import { ExchCardTndr, SaveExchCardTndrResult, SaveExchCardTndrResultModel } from '../../models/exch.card.tndr';
import { LTC_SaveSalesItemModel, LTC_SaveSalesItemModelParameters } from '../models/long-term-sale-item';
import { MobileBase } from '../../models/mobile.base';
import { AssociateSaleTips } from '../../models/associate.sale.tips';
import { LoadTicketStatLocRequest, LoadTicketStatLocResultModel } from '../models/ticket.status.location.models';
import { ContractSummaryReport } from '../../models/sales.tran.report.models';
import { VendorContractSummaryResultsModel } from '../../models/saletran.report.model';
import { LTC_StoreLocation_Result } from '../models/store.location';
import { SettlementReportResultModel } from '../reports/settlement/models';
import { LTC_BalanceDueTicketsResultsModel } from '../models/balancedue.tickets.model';
import { LTC_NoSaleResultsModel } from '../models/nosale.report.model';
import { LTC_CancelledTicketsResultsModel, TicketCancelResultsModel } from '../models/canceled.tickets.model';
import { CashDrawerSummaryResultsModel, LTC_CashDrawerVariance } from '../models/cash.drawer.model';
import { LTC_ItemButtonMenuResultsModel } from '../models/item.button.menu.models';
import { LTC_ContractResultsModel } from '../models/contract.models';
import { LTC_TicketStatusLocationResult } from '../models/ticket.status.model';


@Injectable({
  providedIn: 'root'
})
export class PosApiService {

    headerObjs: HttpHeaders;
    vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

    allItemButtonMenuList: SaleItem[] = [];
    deptList: Dept[] = [];

    constructor(private httpClient: HttpClient) {
        this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
        this.headerObjs = this.headerObjs.append('Accept', '*/*');
        
        
        //this._sharedSvc.LogonDetails.subscribe(data => {
        //    this.vendorLoginResult = data;
        //    //console.log('subscribe data arrived')

        //});
        //this.vendorLoginResult = _sharedSvc.getLTVendorLogonData();
        //this.getAllSaleItems();
    }

    //public getVendorLogonData(): VendorLoginResultsModel {
    //    //console.log('getVendorLogonData')
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

    public getSaleItemListFromDB(locationId: number, contractid: number, facilityid: number, businessFunctionId: number, salesCategoryId: number, departmentId: number, active: number = 1): Observable<SaleItemResultsModel> {
        //console.log('SalesTranSvc getSaleItemListFromDB called')
        let url = GlobalConstants.CPOS_SVCS_URL + '/ltc/GetMenuItem?guid=' + GlobalConstants.GET_GUID +
            '&uid=0&pLocationUID=' + locationId + '&pContractUID=' + contractid + '&pFacilityUID=' + facilityid + '&pBusinessFunctionUID=' + businessFunctionId + '&pSalesCatUID=' + salesCategoryId + '&pDepartmentUID=' + departmentId + '&pActive=' + active;
            
        return this.httpClient.get<SaleItemResultsModel>(url, { headers: this.headerObjs });
    }
 
    public getVendorLoginResult(): VendorLoginResultsModel {
        //console.log('SalesTranSvc getVendorLoginResult called')
        return this.vendorLoginResult;
    }

    public getCustomerLookup(pFirst: string, pLast: string, pPhone: string, uid: number): Observable<LTC_CustomerLookupResultsModel> {
        //console.log('SalesTranSvc getSaleItemListFromDB called')
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

    public getLTCStoreLocation(locationId: number, uid: string): Observable<LTC_StoreLocation_Result> {
        return this.httpClient.get<LTC_StoreLocation_Result>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetLTCStoreLocation?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
                + '&locationId=' + locationId.toString()
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public saveTicketForGuestCheck(model: TicketSplit) {

        //console.log('SalesTranSvc saveTicketForGuestCheck called', model)
        
        return this.httpClient.put<SaveTicketResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveSplitPayments?guid=' + GlobalConstants.PUT_GUID + '&uid=' + model.individualUID + '&DBVal=0',
            JSON.stringify(model),
            { headers: this.headerObjs });
    }

    public saveCompleteTicketSplit(model: TicketSplit) {

        //console.log('SalesTranSvc saveCompleteTicketSplit called ', model)
        
        return this.httpClient.put<SaveTicketResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveSplitPayments?guid=' + GlobalConstants.PUT_GUID + '&uid=' + model.individualUID + '&DBVal=0',
            JSON.stringify(model),
            { headers: this.headerObjs });
    }

    public saveTenderObj(tndrObj: TicketTender) {
        //console.log('SalesTranSvc saveTenderObj called', tndrObj)
        return this.httpClient.put<SaveTenderResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveTender?guid=' + GlobalConstants.PUT_GUID 
                + '&uid=' + tndrObj.tndMaintUserId 
                + '&appType=2'
                + '&bFromLinuxTab=true',
            JSON.stringify(tndrObj),
            { headers: this.headerObjs });
    }

    public saveTicketDetail(uid: number, appType: number, request: SaveTicketDetailRequest): Observable<SaveTicketDetailResultModel> {
        return this.httpClient.put<SaveTicketDetailResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveTicketDetail?guid=' + GlobalConstants.PUT_GUID
                + '&uid=' + uid.toString()
                + '&appType=' + appType.toString(),
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }

    public inactiveTicketDetail(uid: number, request: InactiveTicketDetailRequest): Observable<InactiveTicketDetailResultModel> {
        return this.httpClient.put<InactiveTicketDetailResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/InactiveTicketDetail?guid=' + GlobalConstants.PUT_GUID
                + '&uid=' + uid.toString(),
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }

    public getInProgressTenders(tranId: number, appType: number, tenderStatus: number, uid: number) {
        return this.httpClient.get<InProgressTendersResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetInProgressTenders?guid=' + GlobalConstants.GET_GUID
                + '&tranId=' + tranId.toString()
                + '&appType=' + appType.toString()
                + '&tenderStatus=' + tenderStatus.toString()
                + '&uid=' + uid.toString(),
            { headers: this.headerObjs }
        );
    }

    public saveFDMSTenderObj(fdmsTndr: ExchCardTndr, transactionId: number, appType: number, uid: number) {
        //console.log('SalesTranSvc saveFDMSenderObj called', transactionId)
        return this.httpClient.put<SaveExchCardTndrResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveFDMSTender?guid=' + GlobalConstants.PUT_GUID 
                + '&uid=' + uid 
                + '&appType=' + appType 
                + '&TransactionId=' + transactionId,
            JSON.stringify(fdmsTndr),
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

    public getSaleTranReport(
        cid: number,
        lid: number,
        assocUID: number,
        fNum: string,
        fDt: string,
        tDt: string,
        uid: string,
        DBVal: number,
        FrgnCurr: boolean = false
    ): Observable<VendorContractSummaryResultsModel> {
        return this.httpClient.get<VendorContractSummaryResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetSaleTranReport?guid=' + GlobalConstants.GET_GUID
                + '&cid=' + cid.toString()
                + '&lid=' + lid.toString()
                + '&assocUID=' + assocUID.toString()
                + '&fNum=' + fNum
                + '&fDt=' + fDt
                + '&tDt=' + tDt
                + '&uid=' + uid
                + '&DBVal=' + DBVal.toString()
                + '&FrgnCurr=' + FrgnCurr,
            { headers: this.headerObjs }
        );
    }

    public getBalanceDueTickets(
        cid: number,
        lid: number,
        fNum: string,
        fDt: string,
        tDt: string,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<LTC_BalanceDueTicketsResultsModel> {
        return this.httpClient.get<LTC_BalanceDueTicketsResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetBalanceDueTickets?guid=' + encodeURIComponent(guid)
                + '&cid=' + cid.toString()
                + '&lid=' + lid.toString()
                + '&fNum=' + encodeURIComponent(fNum)
                + '&fDt=' + encodeURIComponent(fDt)
                + '&tDt=' + encodeURIComponent(tDt)
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public getNoSaleReport(
        cid: number,
        lid: number,
        fNum: string,
        fDt: string,
        tDt: string,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<LTC_NoSaleResultsModel> {
        return this.httpClient.get<LTC_NoSaleResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetNoSaleReport?guid=' + encodeURIComponent(guid)
                + '&cid=' + cid.toString()
                + '&lid=' + lid.toString()
                + '&fNum=' + encodeURIComponent(fNum)
                + '&fDt=' + encodeURIComponent(fDt)
                + '&tDt=' + encodeURIComponent(tDt)
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public getCancelledTickets(
        cid: number,
        lid: number,
        fNum: string,
        fDt: string,
        tDt: string,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<LTC_CancelledTicketsResultsModel> {
        return this.httpClient.get<LTC_CancelledTicketsResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetCancelledTickets?guid=' + encodeURIComponent(guid)
                + '&cid=' + cid.toString()
                + '&lid=' + lid.toString()
                + '&fNum=' + encodeURIComponent(fNum)
                + '&fDt=' + encodeURIComponent(fDt)
                + '&tDt=' + encodeURIComponent(tDt)
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public getCashDrawerReport(
        cid: number,
        lid: number,
        fNum: string,
        fDt: string,
        tDt: string,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<CashDrawerSummaryResultsModel> {
        return this.httpClient.get<CashDrawerSummaryResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetCashDrawerReport?guid=' + encodeURIComponent(guid)
                + '&cid=' + cid.toString()
                + '&lid=' + lid.toString()
                + '&fNum=' + encodeURIComponent(fNum)
                + '&fDt=' + encodeURIComponent(fDt)
                + '&tDt=' + encodeURIComponent(tDt)
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public getCashDrawerVariance(
        lid: number,
        maintTS: string,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<LTC_CashDrawerVariance> {
        return this.httpClient.get<LTC_CashDrawerVariance>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetCashDrawerVariance?guid=' + encodeURIComponent(guid)
                + '&lid=' + lid.toString()
                + '&maintTS=' + encodeURIComponent(maintTS)
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public getConcessionMenuItem(
        pLocationUID: number,
        pContractUID: number,
        pFacilityUID: number,
        pBusinessFunctionUID: number,
        pSalesCatUID: number,
        pDepartmentUID: number,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<LTC_ItemButtonMenuResultsModel> {
        return this.httpClient.get<LTC_ItemButtonMenuResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetConcessionMenuItem?guid=' + encodeURIComponent(guid)
                + '&uid=' + encodeURIComponent(uid)
                + '&pLocationUID=' + pLocationUID.toString()
                + '&pContractUID=' + pContractUID.toString()
                + '&pFacilityUID=' + pFacilityUID.toString()
                + '&pBusinessFunctionUID=' + pBusinessFunctionUID.toString()
                + '&pSalesCatUID=' + pSalesCatUID.toString()
                + '&pDepartmentUID=' + pDepartmentUID.toString(),
            { headers: this.headerObjs }
        );
    }

    public loadLTCContract(
        contractUID: number,
        uid: string,
        guid: string = GlobalConstants.GET_GUID
    ): Observable<LTC_ContractResultsModel> {
        return this.httpClient.get<LTC_ContractResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/LoadLTCContract?guid=' + encodeURIComponent(guid)
                + '&contractUID=' + contractUID.toString()
                + '&uid=' + encodeURIComponent(uid),
            { headers: this.headerObjs }
        );
    }

    public getSettlementReport(
        cid: number,
        month: string,
        uid: string,
        lid: number = 0,
        showPmntDueDate: string = '',
        RgnCode: string = "",
        CliTimeVar: number = 0
    ): Observable<SettlementReportResultModel> {
        return this.httpClient.get<SettlementReportResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetSettlementReport?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
                + '&cid=' + cid.toString()
                + '&month=' + encodeURIComponent(month)
                + '&uid=' + encodeURIComponent(uid)
                + '&lid=' + lid.toString()
                + '&rgnCode=' + encodeURIComponent(RgnCode)
                + '&showPmntDueDate=' + encodeURIComponent(showPmntDueDate)
                + '&CliTimeVar=' + CliTimeVar.toString(),
            { headers: this.headerObjs }
        );
    }

    public aurusGiftCardInquiryForConus(
        guid: string,
        uid: string,
        facilityNumber: string,
        transactionAmount: number,
        cardNumberEncrypted: string,
        cardExpiryYear: number,
        cardExpiryMonth: number,
        ticketTenderId: number,
        transactionId: number,
        regionId: number,
        appType: number
    ): Observable<Conus_GC_Balance_Model> {
        const url = GlobalConstants.CPOS_SVCS_URL + '/common/AurusGiftCardInquiry'
            + '?guid=' + encodeURIComponent(guid)
            + '&uid=' + encodeURIComponent(uid);

        const request: AurusGiftCardRequest = {
            FacilityNumber: facilityNumber,
            TransactionAmount: transactionAmount,
            CardNumberEncrypted: cardNumberEncrypted,
            CardExpiryYear: cardExpiryYear,
            CardExpiryMonth: cardExpiryMonth,
            TicketTenderId: ticketTenderId,
            TransactionId: transactionId,
            RegionId: regionId,
            AppType: appType
        };

        return this.httpClient.post<Conus_GC_Balance_Model>(url, JSON.stringify(request), { headers: this.headerObjs });
    }

    public aurusGiftCardRedeemForConus(
        guid: string,
        uid: string,
        facilityNumber: string,
        transactionAmount: number,
        cardNumberEncrypted: string,
        cardExpiryYear: number,
        cardExpiryMonth: number,
        ticketTenderId: number,
        transactionId: number,
        regionId: number,
        appType: number
    ): Observable<Conus_GC_Balance_Model> {
        
        const url = GlobalConstants.CPOS_SVCS_URL + '/common/AurusGiftCardRedeem'
            + '?guid=' + encodeURIComponent(guid)
            + '&uid=' + encodeURIComponent(uid);

        const request: AurusGiftCardRequest = {
            FacilityNumber: facilityNumber,
            TransactionAmount: transactionAmount,
            CardNumberEncrypted: cardNumberEncrypted,
            CardExpiryYear: cardExpiryYear,
            CardExpiryMonth: cardExpiryMonth,
            TicketTenderId: ticketTenderId,
            TransactionId: transactionId,
            RegionId: regionId,
            AppType: appType

        };

        return this.httpClient.post<Conus_GC_Balance_Model>(url, JSON.stringify(request), { headers: this.headerObjs });
    }

    public getTicketLookup(individualUID: number, locationid: number, ticketNum: number, phone: string, firstname: string, lastname: string) {

        return this.httpClient.get<TicketLookupResult>(GlobalConstants.CPOS_SVCS_URL + '/ltc/GetTicketLookup?guid=' + GlobalConstants.GET_GUID +
            '&uid=' + individualUID.toString() + '&lid=' + locationid.toString() + '&ticketnum=' + ticketNum.toString() + '&phone=' + phone + '&fname=' + firstname + '&lname=' + lastname ,
            { headers: this.headerObjs });
    }

    public getTranCountForLocEvent(locEvtId: number, appType: number, uid: string): Observable<TranCountForLocEventResultModel> {
        return this.httpClient.get<TranCountForLocEventResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/GetTranCountForLocEvent?guid=' + GlobalConstants.GET_GUID
                + '&locEvtId=' + locEvtId.toString()
                + '&appType=' + appType.toString()
                + '&uid=' + uid,
            { headers: this.headerObjs }
        );
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

    public updateSalesCatName(uid: number, salesCat: SalesCat): Observable<SalesCategorySaveResponse> {
        return this.httpClient.put<SalesCategorySaveResponse>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveSalesCategory?guid=' + GlobalConstants.PUT_GUID + '&uid=' + uid + '&DBVal=0',
            JSON.stringify(salesCat),
            { headers: this.headerObjs });
    }

    public saveItemButtonMenu(itmBtnMnu: LTC_SaveSalesItemModelParameters, uid: number): Observable<LTC_SaveSalesItemModel>
    {       //console.log('SalesTranSvc saveFDMSenderObj called', transactionId)
        return this.httpClient.put<LTC_SaveSalesItemModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveItemButtonMenu?guid=' + GlobalConstants.PUT_GUID
            + '&uid=' + uid,
            JSON.stringify(itmBtnMnu),
            { headers: this.headerObjs });
    }

    /**
     * Calls the WebAPI endpoint ltc/GetAssociateDetsToCopy
     * @param guid string
     * @param pFromLid number
     * @param pToLid number
     * @param uid string
     * @returns Observable<LTC_LocationAssociatesResultsModel>
     */
    public getAssociateDetsToCopy(pFromLid: number, pToLid: number, uid: string): Observable<LTC_LocationAssociatesResultsModel> {
        const url = `${GlobalConstants.CPOS_SVCS_URL}/ltc/GetAssociateDetsToCopy?guid=${encodeURIComponent(GlobalConstants.GET_GUID)}&pFromLid=${pFromLid}&pToLid=${pToLid}&uid=${encodeURIComponent(uid)}`;
        return this.httpClient.get<LTC_LocationAssociatesResultsModel>(url, { headers: this.headerObjs });
    }

    //This is called from TicketStatus modal dialog after saving transaction for LaundryDrycleaning Business Model
    public updateTicketStatusLocation(uid: string, request: UpdateTicketStatusLocationRequest): Observable<UpdateTicketStatusLocationResultModel> {
        return this.httpClient.put<UpdateTicketStatusLocationResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/UpdateTicketStatusLocation?guid=' + GlobalConstants.PUT_GUID
                + '&uid=' + uid,
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }

    //This is called from Ticket Status Page that can be accessed from Main Menu for Laundry Drycleaning business model.
    public updateTktStatRacLoc(
        uid: string,
        request: UpdateTicketStatusLocationRequest,
        guid: string = GlobalConstants.PUT_GUID
    ): Observable<LTC_TicketStatusLocationResult> {
        return this.httpClient.put<LTC_TicketStatusLocationResult>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/UpdateTktStatRacLoc?guid=' + encodeURIComponent(guid)
                + '&uid=' + encodeURIComponent(uid),
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }
    //This is called to populate various ticket status on the Ticket STatus Page accessed from Main Menu
    public loadTicketStatLoc(uid: number, request: LoadTicketStatLocRequest): Observable<LoadTicketStatLocResultModel> {
        return this.httpClient.post<LoadTicketStatLocResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/LoadTicketStatLoc?guid=' + GlobalConstants.POST_GUID
                + '&uid=' + uid.toString(),
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }

    public cancelTicket(
        transactionId: number,
        uid: string,
        cliTimeVar: number = 0,
        cancelType: string = 'PG'
    ): Observable<TicketCancelResultsModel> {
        return this.httpClient.put<TicketCancelResultsModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/CancelTicket?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID)
                + '&transactionId=' + transactionId.toString()
                + '&uid=' + encodeURIComponent(uid)
                + '&cliTimeVar=' + cliTimeVar.toString()
                + '&cancelType=' + encodeURIComponent(cancelType),
            null,
            { headers: this.headerObjs }
        );
    }

    public sendEmail(uid: string, request: SendEmailRequest, guid: string = GlobalConstants.POST_GUID): Observable<MobileBase> {
        return this.httpClient.post<MobileBase>(
            GlobalConstants.CPOS_SVCS_URL + '/common/SendEmail?guid=' + encodeURIComponent(guid)
                + '&uid=' + encodeURIComponent(uid),
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }


    public saveLocationAssociates(request: SaveLocationAssociatesRequest): Observable<LTC_LocationAssociatesResultsModel> {

        const url = `${GlobalConstants.CPOS_SVCS_URL}/ltc/SaveLocationAssociates?guid=${encodeURIComponent(GlobalConstants.PUT_GUID)}`;
        
        return this.httpClient.put<LTC_LocationAssociatesResultsModel>(url, JSON.stringify(request), { headers: this.headerObjs });
    }

}

export interface InProgressTendersResultModel {
    results: MobileBase;
    tenders: TicketTender[];
    partialPayments: PartPaymentInfo[];
    associateTips: AssociateSaleTips[];
}

export interface PartPaymentInfo {
    partPayId: number;
    partPayAmount: number;
    partPayAmountFC: number;
}

export interface TranCountForLocEventResultModel {
    results: MobileBase;
    tranCount: number;
    locEventId: number;
}

export interface SaveTicketDetailRequest {
    appType: number;
    transactionId: number;
    ticketDetailId: number;
    salesItemUID: number;
    seqNbr: number;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    fcUnitPrice: number;
    salesTaxPct: number;
    envTaxPct: number;
    discountAmount: number;
    fcDiscountAmount: number;
    couponLineItemDollarAmount: number;
    fcCouponLineItemDollarAmount: number;
    lineItemDollarDisplayAmount: number;
    fcLineItemDollarDisplayAmount: number;
    lineItemTaxAmount: number;
    fcLineItemTaxAmount: number;
    lineItemEnvTaxAmount: number;
    fcLineItemEnvTaxAmount: number;
    lineItmKatsaCpnAmt: number;
    fcLineItmKatsaCpnAmt: number;
    deptUID: number;
    srvdByAssocVal: number;
    isMisc: boolean;
    isFulfilled: boolean;
    isForeignCurr: boolean;
    isDefaultUSD: boolean;
    noOfTags: number;
    maintUserId: number;
    cliTimeVar: number;
    active: boolean;
}

export interface SaveTicketDetailResultModel {
    results: MobileBase;
    ticketDetailId: number;
    transactionId: number;
    salesItemId: number;
    itemDescription: string;
}

export interface InactiveTicketDetailRequest {
    locEvtId: number;
    tranId: number;
    ticketDetailId: number;
    appType: number;
    userId: number;
    voidTicket: boolean;
    voidTypeCode: string;
    voidOtherReason: string;
}

export interface InactiveTicketDetailResultModel {
    results: MobileBase;
}

export interface UpdateTicketStatusLocationRequest {
    transactionId: number;
    readyByDate: Date | null;
    statusId: number;
    rackLocationId: number;
    rckLocDesc: string;
    payByDueDate: Date | null;
    locationId: number;
    userId: string;
}

export interface TicketStatusRackModel {
    tktStatusRackId: number;
    transactionId: number;
    tktStatusId: number | null;
    rackLocationId: number | null;
    readyByDate: Date | null;
    maintUserId: string;
    maintTimeStamp: Date;
    payByDueDate: Date | null;
    rckLocDesc: string;
}

export interface UpdateTicketStatusLocationResultModel {
    results: MobileBase;
    data: TicketStatusRackModel;
    queryStatus: number;
    queryMessage: string;
    errorNumber: number;
}

export interface Conus_GC_Balance_Model {
    results: MobileBase;
    sResp: string;
    stAuth: string;
    stReasonCode: string;
    balance: number;
}

export interface AurusGiftCardRequest {
    FacilityNumber: string;
    TransactionAmount: number;
    CardNumberEncrypted: string;
    CardExpiryYear: number;
    CardExpiryMonth: number;
    TicketTenderId: number;
    TransactionId: number;
    RegionId: number;
    AppType: number;

}

export interface SendEmailRequest {
    EmailAddress: string;
    EmailContent: string;
    Subject: string;
}
// Add this interface if not already present
export interface SaveLocationAssociatesRequest {
    // Define properties as per backend contract
    // Example:
    // locationId: number;
    // associates: any[];
    // ...
}