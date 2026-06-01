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
  ROV_StartOrEndModel,
  ROV_AssocLogoutHistory
} from './models';

@Injectable({
  providedIn: 'root'
})
export class ShortTermService {
  private headerObjs: HttpHeaders;

  constructor(private httpClient: HttpClient) {
    this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
    this.headerObjs = this.headerObjs.append('Accept', '*/*');
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

  public eventStartOrEnd(request: EventStartOrEndRequest): Observable<ROV_StartOrEndModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/EventStartOrEnd?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);

    return this.httpClient.put<ROV_StartOrEndModel>(url, JSON.stringify(request), { headers: this.headerObjs });
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

  public saveSplitPayments(request: SaveSplitPaymentsRequest): Observable<SaveTicketResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/rov/SaveSplitPayments?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);

    return this.httpClient.put<SaveTicketResultsModel>(url, JSON.stringify(request), { headers: this.headerObjs });
  }
}

export interface EventStartOrEndRequest {
  veid: number;
  startOrEnd: string;
  uid: string;
  cliTimeVar: number;
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
  model: any;
}

export interface LTC_CardCancelReultsModel {
  results: MobileBase;
  [key: string]: any;
}

export interface LTC_ReceiptOptionsModel {
  results: MobileBase;
  [key: string]: any;
}
