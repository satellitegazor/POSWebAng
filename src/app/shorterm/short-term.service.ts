import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalConstants } from '../global/global.constants';
import { SaveTicketResultsModel } from '../models/ticket.split';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';
import { MobileBase } from '../models/mobile.base';
import {
  RDeptCategoryResultModels,
  ROV_TransactionDetailsModel,
  ROV_SingleTransactionIDResults,
  ROV_EventsResultModel,
  ROV_AssocLogoutHistory,
  AssociateNamesListResultsModel,
  ROV_SalesTranRptSummaryModel,
  ROV_SalesTranRptDetailModel,
  ROV_SingleTransactionResultsModel,
  ResetPinRequest,
  ROV_AssociatePINUpdateResultsModel,
  RLogonModel,
  ROV_SaleTaxSaveStatusResultModel,
  ROV_SaleTaxSaveModel
} from './models/models';
import { SendEmailRequest } from '../models/misc-models';
import { ROV_Event, SingleTransactionId } from '../longterm/models/ticket.list';
import { EventConfigModel } from './models/event.config';
import { TenderTypeModel } from '../longterm/models/tender.type';
import { DailyExchRateMdl } from '../models/exchange.rate';
import { SaveTicketDetailRequest, SaveTicketDetailResultModel, TranCountForLocEventResultModel } from '../longterm/models/misc.models';
import { CPOSAppType } from '../services-misc/util.service';
import { ROV_POSTicketSplit } from './models/rticket.split';
import { SaveTenderResultModel, TicketTender } from '../models/ticket.tender';

@Injectable({
  providedIn: 'root'
})
export class RovApiService {
  public getEventAssociates(eventId: number, arg1: string): Observable<any> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetEventAssociates?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&eventId=' + eventId.toString()
      + '&arg1=' + encodeURIComponent(arg1);

    return this.httpClient.get<any>(url, { headers: this.headerObjs });
  }
  private headerObjs: HttpHeaders;

  constructor(private httpClient: HttpClient) {
    this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
    this.headerObjs = this.headerObjs.append('Accept', '*/*');
  }

  public logonUser(mdl: RLogonModel): Observable<VendorLoginResultsModel> {
          
    return this.httpClient.post<VendorLoginResultsModel>(GlobalConstants.CPOS_SVCS_URL + '/rov/ValPin',  JSON.stringify(mdl) , { headers: this.headerObjs });
  }

  public getConcessionMenuItem(
    uid: string,
    pEventUID: number,
    pFacilityUID: number,
    pActive: boolean = true
  ): Observable<RDeptCategoryResultModels> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetConcessionMenuItem?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&uid=' + encodeURIComponent(uid)
      + '&pEventUID=' + pEventUID.toString()
      + '&pFacilityUID=' + pFacilityUID.toString()
      + '&pActive=' + pActive;

    return this.httpClient.get<RDeptCategoryResultModels>(url, { headers: this.headerObjs });
  }

  public getRovTransactionDetails(
    uid: string,
    pTransactionID: number,
    pCustomerFirstName: string,
    pCustomerLastName: string,
    pCustomerPhone: string,
    pContractUID: number,
    pEventUID: number,
    pFacilityUID: number,
    pDepartmentUID: number,
    pSource: string,
    pCustomerUID: number
  ): Observable<ROV_TransactionDetailsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetRovTransactionDetails?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&uid=' + encodeURIComponent(uid)
      + '&pTransactionID=' + pTransactionID.toString()
      + '&pCustomerFirstName=' + encodeURIComponent(pCustomerFirstName)
      + '&pCustomerLastName=' + encodeURIComponent(pCustomerLastName)
      + '&pCustomerPhone=' + encodeURIComponent(pCustomerPhone)
      + '&pContractUID=' + pContractUID.toString()
      + '&pEventUID=' + pEventUID.toString()
      + '&pFacilityUID=' + pFacilityUID.toString()
      + '&pDepartmentUID=' + pDepartmentUID.toString()
      + '&pSource=' + encodeURIComponent(pSource)
      + '&pCustomerUID=' + pCustomerUID.toString();

    return this.httpClient.get<ROV_TransactionDetailsModel>(url, { headers: this.headerObjs });
  }

  public getTransactionID(
    uid: string,
    pTicketNumber: number,
    pEventID: number,
    pContractUID: number
  ): Observable<ROV_SingleTransactionIDResults> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetTransactionID?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&uid=' + encodeURIComponent(uid)
      + '&pTicketNumber=' + pTicketNumber.toString()
      + '&pEventID=' + pEventID.toString()
      + '&pContractUID=' + pContractUID.toString();

    return this.httpClient.get<ROV_SingleTransactionIDResults>(url, { headers: this.headerObjs });
  }

  public getAllRovingEvents(
    vid: string,
    exchnum: string,
    cid: string,
    uid: string
  ): Observable<ROV_EventsResultModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetAllRovingEvents?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&vid=' + encodeURIComponent(vid)
      + '&exchnum=' + encodeURIComponent(exchnum)
      + '&cid=' + encodeURIComponent(cid)
      + '&uid=' + encodeURIComponent(uid);

    return this.httpClient.get<ROV_EventsResultModel>(url, { headers: this.headerObjs });
  }

  public GetRovEvent(
    EventId: number,
    uid: string
  ): Observable<ROV_Event> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetRovEvent?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&EventId=' + EventId.toString()
      + '&uid=' + encodeURIComponent(uid);

    return this.httpClient.get<ROV_Event>(url, { headers: this.headerObjs });
  }

  public GetEventConfig(
    eventId: number,
    uid: string
  ): Observable<EventConfigModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetEventConfig?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&eventId=' + eventId.toString()
      + '&uid=' + encodeURIComponent(uid);

    return this.httpClient.get<EventConfigModel>(url, { headers: this.headerObjs });
  }

    public getVendorFacEvents(
      vid: string,
      exchnum: string
    ): Observable<ROV_EventsResultModel> {
      const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetVendorFacEvents?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
        + '&vid=' + encodeURIComponent(vid)
        + '&exchnum=' + encodeURIComponent(exchnum)
        + '&cliTimeVar=' + GlobalConstants.GetClientTimeVariance().toString();

      return this.httpClient.get<ROV_EventsResultModel>(url, { headers: this.headerObjs });
    }


  public getValidateRovingEvent(
    creds: string,
    eventId: string,
    uid: string,
    individualuid: number,
    cliTimeVar: number,
    pageID: number,
    appName: string = ''
  ): Observable<VendorLoginResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetValidateRovingEvent?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&creds=' + encodeURIComponent(creds)
      + '&eventId=' + encodeURIComponent(eventId)
      + '&uid=' + encodeURIComponent(uid)
      + '&individualuid=' + individualuid.toString()
      + '&CliTimeVar=' + cliTimeVar.toString()
      + '&pageID=' + pageID.toString()
      + '&appName=' + encodeURIComponent(appName);

    return this.httpClient.get<VendorLoginResultsModel>(url, { headers: this.headerObjs });
  }

  public GetAssociateNamesList(
    cid: number,
    evid: number,
    associateid: number,
    uid: string
  ): Observable<AssociateNamesListResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetAssociateNamesList?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&cid=' + cid.toString()
      + '&evid=' + evid.toString()
      + '&associateid=' + associateid.toString()
      + '&uid=' + encodeURIComponent(uid);

    return this.httpClient.get<AssociateNamesListResultsModel>(url, { headers: this.headerObjs });
  }

  public saveAssocRovLogoutHistory(request: SaveAssocRovLogoutHistoryRequest): Observable<ROV_AssocLogoutHistory> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/SaveAssocRovLogoutHistory?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);

    return this.httpClient.put<ROV_AssocLogoutHistory>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

  public cancelCardTender(request: CancelCardTenderRequest): Observable<LTC_CardCancelReultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/CancelCardTender?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);

    return this.httpClient.put<LTC_CardCancelReultsModel>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

  public receiptOptionSelected(request: ReceiptOptionSelectedRequest): Observable<LTC_ReceiptOptionsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/ReceiptOptionSelected?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);

    return this.httpClient.put<LTC_ReceiptOptionsModel>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

  public logDeclinedTransaction(request: LogDeclinedTransactionRequest): Observable<MobileBase> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/LogDeclinedTransaction?guid=' + encodeURIComponent(GlobalConstants.POST_GUID);

    return this.httpClient.post<MobileBase>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

  public saveSplitPayments(model: ROV_POSTicketSplit): Observable<SaveTicketResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/SaveSplitPayments?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);
    return this.httpClient.put<SaveTicketResultsModel>(url, JSON.stringify(model), { headers: this.headerObjs });
  }

  public saveROVTenderObj(tndrObj: TicketTender): Observable<SaveTenderResultModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveTender?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID)
      + '&uid=' + encodeURIComponent(tndrObj.tndMaintUserId)
      + '&appType=' + CPOSAppType.ShortTerm.toString()
      + '&bFromLinuxTab=true';

    return this.httpClient.put<SaveTenderResultModel>(url, JSON.stringify(tndrObj), { headers: this.headerObjs });
  }

    public saveRovTicketDetail(uid: number, request: SaveTicketDetailRequest): Observable<SaveTicketDetailResultModel> {
        return this.httpClient.put<SaveTicketDetailResultModel>(
            GlobalConstants.CPOS_SVCS_URL + '/ltc/SaveTicketDetail?guid=' + GlobalConstants.PUT_GUID
                + '&uid=' + uid.toString()
                + '&appType=' + CPOSAppType.ShortTerm.toString(),
            JSON.stringify(request),
            { headers: this.headerObjs }
        );
    }

  public resetRovAssociatePin(request: ResetPinRequest): Observable<ROV_AssociatePINUpdateResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/ResetAssociatePIN?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);
    return this.httpClient.put<ROV_AssociatePINUpdateResultsModel>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

  public putRovVendorPinUpdate(request: ResetPinRequest): Observable<ROV_AssociatePINUpdateResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/PutRovVendorPin?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);
    return this.httpClient.put<ROV_AssociatePINUpdateResultsModel>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

  public SalesTranReportDetail(
    ContractId: number,
    EventId: number,
    IndividualId: number,
    FromDate: string = '',
    ToDate: string = '',
    FrgnCurr: boolean = false,
    uid: string
  ): Observable<ROV_SalesTranRptDetailModel> {

    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/SalesTranReportDetail?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&uid=' + encodeURIComponent(uid)
      + '&ContractId=' + ContractId.toString()
      + '&EventId=' + EventId.toString()
      + '&IndividualId=' + IndividualId.toString()
      + '&FromDate=' + encodeURIComponent(FromDate)
      + '&ToDate=' + encodeURIComponent(ToDate)
      + '&FrgnCurr=' + FrgnCurr;

    return this.httpClient.get<ROV_SalesTranRptDetailModel>(url, { headers: this.headerObjs });
  }

  public SalesTranReportSummary(
    ContractId: number,
    EventId: number,
    IndividualId: number,
    FromDate: string = '',
    ToDate: string = '',
    FrgnCurr: boolean = false,
    uid: string
  ): Observable<ROV_SalesTranRptSummaryModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/SalesTranReportSummary?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&uid=' + encodeURIComponent(uid)
      + '&ContractId=' + ContractId.toString()
      + '&EventId=' + EventId.toString()
      + '&IndividualId=' + IndividualId.toString()
      + '&FromDate=' + encodeURIComponent(FromDate)
      + '&ToDate=' + encodeURIComponent(ToDate)
      + '&FrgnCurr=' + FrgnCurr;

    return this.httpClient.get<ROV_SalesTranRptSummaryModel>(url, { headers: this.headerObjs });
  }

  public sendEmail(uid: string, request: SendEmailRequest, guid: string = GlobalConstants.POST_GUID): Observable<MobileBase> {
      return this.httpClient.post<MobileBase>(
          GlobalConstants.CPOS_SVCS_URL + '/common/SendEmail?guid=' + encodeURIComponent(guid)
              + '&uid=' + encodeURIComponent(uid),
          JSON.stringify(request),
          { headers: this.headerObjs }
      );
  }

  public getTranIdForTicketNum(pEventId: number, pTicketNum: number, pIndividualId: number) {

      return this.httpClient.get<SingleTransactionId>(GlobalConstants.CPOS_SVCS_URL + '/rov/GetTranId?guid=' + GlobalConstants.GET_GUID + 
          '&uid=' + pIndividualId.toString() + '&TicketNum=' + pTicketNum.toString() + '&EventId=' + pEventId, 
          {headers: this.headerObjs});
  }

  public getSingleTransaction(
    uid: number,
    pTransactionID: number,
    pGetCancelTndr: boolean = false,
    PartPayId: number = 0,
    bFrmSalesTranRpt: boolean = false,
    DPayRcpt: boolean = false
  ): Observable<ROV_SingleTransactionResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/GetSingleTransaction?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&uid=' + uid.toString()
      + '&pTransactionID=' + pTransactionID.toString()
      + '&pGetCancelTndr=' + pGetCancelTndr
      + '&PartPayId=' + PartPayId.toString()
      + '&bFrmSalesTranRpt=' + bFrmSalesTranRpt
      + '&DPayRcpt=' + DPayRcpt;

    return this.httpClient.get<ROV_SingleTransactionResultsModel>(url, { headers: this.headerObjs });
  }

  public getTenderTypes(individualUID: number) {

      return this.httpClient.get<TenderTypeModel>(GlobalConstants.CPOS_SVCS_URL + '/common/GetTenderTypes?guid=' + GlobalConstants.GET_GUID +
          '&uid=' + individualUID.toString() + '&AppType=2',
          { headers: this.headerObjs });
  }

  public getDailyExchRate(eventId: number, busDate: string, uid: string) {

    return this.httpClient.get<DailyExchRateMdl>(GlobalConstants.CPOS_SVCS_URL + '/rov/GetDailyExchRate?guid=' + encodeURIComponent(GlobalConstants.GET_GUID) +
        '&eventId=' + eventId.toString() + '&busDate=' + encodeURIComponent(busDate) + '&uid=' + encodeURIComponent(uid),
        { headers: this.headerObjs });
  }

  public checkSalesTaxSaveStatus(
    EventId: number,
    uid: number
  ): Observable<ROV_SaleTaxSaveStatusResultModel> {
    
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/CheckSalesTaxSaveStatus?guid=' 
      + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&EventId=' + EventId.toString()
      + '&uid=' + uid.toString();

    return this.httpClient.get<ROV_SaleTaxSaveStatusResultModel>(url, { headers: this.headerObjs });
  }

  public loadSaleTaxPct(
    EventId: number,
    uid: number
  ): Observable<ROV_SaleTaxSaveModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/LoadSaleTaxPct?guid=' + encodeURIComponent(GlobalConstants.GET_GUID)
      + '&EventId=' + EventId.toString()
      + '&uid=' + uid.toString();

    return this.httpClient.get<ROV_SaleTaxSaveModel>(url, { headers: this.headerObjs });
  }

  public saveSaleTaxPct(
    EventId: number,
    uid: string,
    stm: ROV_SaleTaxSaveModel
  ): Observable<ROV_SaleTaxSaveModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/SaveSaleTaxPct?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID)
      + '&EventId=' + EventId.toString()
      + '&uid=' + encodeURIComponent(uid);

    return this.httpClient.put<ROV_SaleTaxSaveModel>(url, JSON.stringify(stm), { headers: this.headerObjs });
  }

  public getTranCountForEvent(eventId: number, uid: string): Observable<TranCountForLocEventResultModel> {
      return this.httpClient.get<TranCountForLocEventResultModel>(
          GlobalConstants.CPOS_SVCS_URL + '/ltc/GetTranCountForLocEvent?guid=' + GlobalConstants.GET_GUID
              + '&locEvtId=' + eventId.toString()
              + '&appType=' + CPOSAppType.ShortTerm.toString()
              + '&uid=' + uid,
          { headers: this.headerObjs }
      );
  }

  
}

export interface SaveAssocRovLogoutHistoryRequest {
  uid: string;
  eventId: number;
  reason: string;
}

export interface CancelCardTenderRequest {
  eascid: number;
  canuid: string;
  tranAmount: number;
  cliTimeVar: number;
}

export interface ReceiptOptionSelectedRequest {
  ttranid: number;
  eascid: number;
  optcode: string;
  tpid: number;
}

export interface LogDeclinedTransactionRequest {
  uid: string;
  model: any;
}

export interface SaveSplitPaymentsRequest {
  uid: string;
  model: ROV_POSTicketSplit;
}

export interface LTC_CardCancelReultsModel {
  results: MobileBase;
  [key: string]: any;
}

export interface LTC_ReceiptOptionsModel {
  results: MobileBase;
  [key: string]: any;
}
