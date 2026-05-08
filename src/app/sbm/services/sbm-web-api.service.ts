
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalConstants } from '../../global/global.constants';
import { LogonModel, LogonResultsModel } from '../../models/mobile.client.identity';

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
}
