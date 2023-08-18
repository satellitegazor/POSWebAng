import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CPOSWebSvcService {
  
  headerObjs: HttpHeaders;
  constructor(private httpClient: HttpClient) {
    this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
    this.headerObjs = this.headerObjs.append('Accept', '*/*');
  }

  private cposWebSvcUrl: string = 'https://localhost/cposwebsvc/'

  
  captureCardData(displayMsg: string, appType: number): Observable<MSRSwipeData> {    

    return this.httpClient.get<MSRSwipeData>(this.cposWebSvcUrl + 'pinpad/CaptureCardData?DisplayMsg='+ displayMsg + '&AppType=' + appType.toString(),
    { headers: this.headerObjs });   

  }

  captureCardTran(invoiceId: string, exchNum: string, tranAmt: number, isRefund: boolean): Observable<VfoneCaptureTran> {

    return this.httpClient.get<VfoneCaptureTran>(this.cposWebSvcUrl + 'pinpad/CaptureCardTran?InvoiceId=' + invoiceId + '&ExchNum=' + exchNum + '&TranAmt=' + tranAmt + '&IsRefund=' + isRefund,
    { headers: this.headerObjs });
  }

  captureSignature(val: string): Observable<SigCapture> {
    return this.httpClient.get<SigCapture>(this.cposWebSvcUrl + 'pinpad/CaptureSignature?val=' + val,
    {headers: this.headerObjs});
  }

  captureMsrSwipe(displayMsg: string, appType: number): Observable<MSRSwipeData> {    

    return this.httpClient.get<MSRSwipeData>(this.cposWebSvcUrl + 'msr/CaptureCardData?DisplayMsg='+ displayMsg + '&AppType=' + appType.toString(),
    { headers: this.headerObjs });   

  }

  captureSigpadSignature(val: string): Observable<SigCapture> {
    return this.httpClient.get<SigCapture>(this.cposWebSvcUrl + 'sigpad/CaptureSignature?DisplayMsg=' + val,
    {headers: this.headerObjs});
  }

}
