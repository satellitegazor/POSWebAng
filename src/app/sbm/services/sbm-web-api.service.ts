
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalConstants } from '../../global/global.constants';
import { LogonModel, LogonResultsModel } from '../../models/mobile.client.identity';
import { ContractIdResultsModel, ROV_Contract, ROV_ContractResultsModel, VendorContractDataModel } from '../models/contract.models';
import { LTC_Contract, LTC_ContractResultsModel, LTC_ReferenceResultsModel, ROV_ReferenceResultsModel } from '../../longterm/models/contract.models';
import { FacilityModel } from '../../longterm/models/store.location';
import { CPOS_RegionCountryCurrencyResultsModel } from '../../longterm/models/region.currency.models';
import { EventStartOrEndRequest, ROV_StartOrEndModel } from '../../shorterm/models/models';

@Injectable({
  providedIn: 'root'
})
export class SbmWebApiService {
  private headerObjs: HttpHeaders;

  constructor(private httpClient: HttpClient) {
    this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
    this.headerObjs = this.headerObjs.append('Accept', '*/*');
  }

  public sbmLogon(model: LogonModel): Observable<LogonResultsModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/sbm/SbmLogon?guid=' + GlobalConstants.POST_GUID;
    return this.httpClient.post<LogonResultsModel>(url, JSON.stringify(model), { headers: this.headerObjs });
  }

  public getActiveContractIds(pastEvents: string, currentEvents: string, futureEvents: string, 
      pastMonthsBack: string, uid: string, isStlmtRptJob: string = 'N', 
        autojob: boolean = true): Observable<VendorContractDataModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetActiveContractIds?guid=${GlobalConstants.GET_GUID}` +
      `&pastEvents=${pastEvents}&currentEvents=${currentEvents}&futureEvents=${futureEvents}` +
      `&pastMonthsBack=${pastMonthsBack}&uid=${uid}&isStlmtRptJob=${isStlmtRptJob}&autojob=${autojob}`;
    return this.httpClient.get<VendorContractDataModel>(url, { headers: this.headerObjs });
  }

  public getCountryCurrencyCodes(regcode: string): Observable<CPOS_RegionCountryCurrencyResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetCountryCurrencyCodes?regcode=${regcode}&guid=${GlobalConstants.GET_GUID}`;
    return this.httpClient.get<CPOS_RegionCountryCurrencyResultsModel>(url, { headers: this.headerObjs });
  }

  public getRegionCode(): Observable<any> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetRegionCode?guid=${GlobalConstants.GET_GUID}`;
    return this.httpClient.get<any>(url, { headers: this.headerObjs });
  }

  /**
   * Calls the ltc/LoadLTCContract API endpoint.
   * @param contractUID The contract UID
   * @param uid The user ID
   * @returns Observable<LTC_ContractResultsModel>
   */
  public loadLTCContract(contractUID: number, uid: string): Observable<LTC_ContractResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/LoadLTCContract?guid=${GlobalConstants.GET_GUID}` +
      `&contractUID=${encodeURIComponent(contractUID)}` +
      `&uid=${encodeURIComponent(uid)}`;
    return this.httpClient.get<LTC_ContractResultsModel>(url, { headers: this.headerObjs });
  }

  public loadROVContract(cid: number, uid: string): Observable<ROV_ContractResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/LoadROVContract?guid=${GlobalConstants.GET_GUID}` +
      `&cid=${encodeURIComponent(cid)}` +
      `&uid=${encodeURIComponent(uid)}`;
    return this.httpClient.get<ROV_ContractResultsModel>(url, { headers: this.headerObjs });
  }

  public getLTCReferenceLists(uid: string): Observable<LTC_ReferenceResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/ltc/GetLTCReferenceLists?guid=${GlobalConstants.GET_GUID}` +
      `&uid=${encodeURIComponent(uid)}`;
    return this.httpClient.get<LTC_ReferenceResultsModel>(url, { headers: this.headerObjs });
  }

  public getROVReferenceLists(uid: string): Observable<ROV_ReferenceResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetROVReferenceLists?guid=${GlobalConstants.GET_GUID}` +
      `&uid=${encodeURIComponent(uid)}`;
    return this.httpClient.get<ROV_ReferenceResultsModel>(url, { headers: this.headerObjs });
  }

  public getDERDiscrepancyModel(uid: string): Observable<any> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetDERDiscrepancyModel?uid=${uid}&guid=${GlobalConstants.GET_GUID}`;
    return this.httpClient.get<any>(url, { headers: this.headerObjs });
  }

  public getSingleFacilityLocal(facNbr: string): Observable<FacilityModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetSingleFacilityLocal?facNbr=${facNbr}&guid=${GlobalConstants.GET_GUID}`;
    return this.httpClient.get<FacilityModel>(url, { headers: this.headerObjs });
  }

  public getVendorLocal(sVendorNum: string): Observable<any> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/GetVendorLocal?sVendorNum=${sVendorNum}&guid=${GlobalConstants.GET_GUID}`;
    return this.httpClient.get<any>(url, { headers: this.headerObjs });
  }

  public saveSBMEmailAddr(emailData: any): Observable<any> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/SaveSBMEmailAddr?guid=${GlobalConstants.PUT_GUID}`;
    return this.httpClient.put<any>(url, emailData, { headers: this.headerObjs });
  }

  public loadSBMEmailAddr(uid: string, facilityNum: string): Observable<any> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/LoadSBMEmailAddr?guid=${GlobalConstants.GET_GUID}&uid=${uid}&facilityNum=${facilityNum}`;
    return this.httpClient.get<any>(url, { headers: this.headerObjs });
  }

  public PutLTCContract(uid: string, contract: LTC_Contract): Observable<LTC_ContractResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/SaveLTCContract?guid=${GlobalConstants.PUT_GUID}&uid=${encodeURIComponent(uid)}`;
    return this.httpClient.put<LTC_ContractResultsModel>(url, contract, { headers: this.headerObjs });
  }

  public putROVContract(uid: string, contract: ROV_Contract): Observable<ROV_ContractResultsModel> {
    const url = `${GlobalConstants.CPOS_SVCS_URL}/sbm/SaveROVContract?guid=${GlobalConstants.PUT_GUID}&uid=${encodeURIComponent(uid)}`;
    return this.httpClient.put<ROV_ContractResultsModel>(url, contract, { headers: this.headerObjs });
  }

  public eventStartOrEnd(request: EventStartOrEndRequest): Observable<ROV_StartOrEndModel> {
    const url = GlobalConstants.CPOS_SVCS_URL + '/sbm/EventStartOrEnd?guid=' + encodeURIComponent(GlobalConstants.PUT_GUID);

    return this.httpClient.put<ROV_StartOrEndModel>(url, JSON.stringify(request), { headers: this.headerObjs });
  }

}
