import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VLogonModel } from './models/vlogon.model';
import { GlobalConstants } from '../global/global.constants';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';

@Injectable({
    providedIn: 'root'
})
export class LogonSvc {

    private headerObjs: HttpHeaders;
    constructor(private httpclient: HttpClient) {
        this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
        this.headerObjs = this.headerObjs.append('Accept', '*/*');
    } 

    public GetLocations(vendornum: String): Observable<any> {

        let CliTimeVar = GlobalConstants.GetClientTimeVariance();
        return this.httpclient.get<any>(GlobalConstants.CPOS_SVCS_URL + '/common/GetVendorLocations?guid=' + GlobalConstants.GET_GUID + '&vid=' + vendornum + '&CliTimeVar=' + CliTimeVar,
            { headers: this.headerObjs });
    }


    public logonUser(mdl: VLogonModel): Observable<VendorLoginResultsModel> {
            
        return this.httpclient.post<VendorLoginResultsModel>(GlobalConstants.CPOS_SVCS_URL + '/common/ValPin',  JSON.stringify(mdl) , { headers: this.headerObjs });
    }

    public testUser(): Observable<any> {
        const strVal: any = "StringValue to test the http post in angular to web api";
        return this.httpclient.post<any>(GlobalConstants.CPOS_SVCS_URL + '/common/TestPost', JSON.stringify(strVal), { headers: this.headerObjs });
    }

}
