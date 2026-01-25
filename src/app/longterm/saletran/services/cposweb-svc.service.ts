import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PinPadResult } from './models/pinpad-result';
import { MSRSwipeData } from './models/msr-swipe-data';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { SigCapture } from './models/capture-signature.model';
import { VerifoneCommStatus } from '../../models/general-classes';

@Injectable({
  providedIn: 'root'
})
export class CPOSWebSvcService {
  
  headerObjs: HttpHeaders;
  constructor(private httpClient: HttpClient) {
    this.headerObjs = new HttpHeaders().set('Content-Type', 'application/json');
    this.headerObjs = this.headerObjs.append('Accept', '*/*');
  }

  private cposWebSvcUrl: string = 'http://127.0.0.1:8000/cposwebsvc/'

  private getErrorMessage(error: any): { msg: string; statusCode: number } {
    let errorMsg = 'An unknown error occurred';
    let statusCode = error.status || 0;

    if (error.status === 0) {
      errorMsg = 'Pinpad Service is unreachable. Please check the connection and try again.';
    } else if (error.status === 404) {
      errorMsg = 'Pinpad Service endpoint not found (404).';
    } else if (error.status === 500) {
      errorMsg = 'Pinpad Service: Internal server error (500). The service is experiencing issues.';
    } else if (error.error instanceof ErrorEvent) {
      errorMsg = `Pinpad Service: Client error: ${error.error.message}`;
    } else if (error.statusText) {
      errorMsg = `Pinpad Service: Server error: ${error.statusText}`;
    }

    console.error('Pinpad Service: HTTP Error:', `Error (${statusCode}): ${errorMsg}`);
    return { msg: errorMsg, statusCode };
  }

  private handleMSRSwipeDataError(error: any): Observable<MSRSwipeData> {
    const { msg, statusCode } = this.getErrorMessage(error);
    const errorResult = new MSRSwipeData();
    errorResult.rslt.IsSuccessful = false;
    errorResult.rslt.ReturnMsg = `Error (${statusCode}): ${msg}`;
    errorResult.rslt.VersionNum = '';
    return of(errorResult);
  }

  private handleExchCardTndrError(error: any): Observable<ExchCardTndr> {
    const { msg, statusCode } = this.getErrorMessage(error);
    const errorResult = new ExchCardTndr();
    errorResult.rslt.IsSuccessful = false;
    errorResult.rslt.ReturnMsg = `Error (${statusCode}): ${msg}`;
    errorResult.rslt.VersionNum = '';
    return of(errorResult);
  }

  private handleSigCaptureError(error: any): Observable<SigCapture> {
    const { msg, statusCode } = this.getErrorMessage(error);
    const errorResult = new SigCapture();
    errorResult.rslt.IsSuccessful = false;
    errorResult.rslt.ReturnMsg = `Error (${statusCode}): ${msg}`;
    errorResult.rslt.VersionNum = '';
    return of(errorResult);
  }

  private handleVerifoneCommStatusError(error: any): Observable<VerifoneCommStatus> {
    const { msg, statusCode } = this.getErrorMessage(error);
    const errorResult = new VerifoneCommStatus();
    errorResult.IsSuccess = false;
    errorResult.ResultData = `Error (${statusCode}): ${msg}`;
    errorResult.DetailedStatus = `Error (${statusCode}): ${msg}`;
    return of(errorResult);
  }

  
  captureCardData(displayMsg: string, appType: number): Observable<MSRSwipeData> {    

    return this.httpClient.get<MSRSwipeData>(this.cposWebSvcUrl + 'pinpad/CaptureCardData?DisplayMsg='+ displayMsg + '&AppType=' + appType.toString(),
    { headers: this.headerObjs }).pipe(
      catchError(error => this.handleMSRSwipeDataError(error))
    );   

  }

  captureCardTran(invoiceId: string, exchNum: string, tranAmt: number, isRefund: boolean): Observable<ExchCardTndr> {

    return this.httpClient.get<ExchCardTndr>(this.cposWebSvcUrl + 'pinpad/CaptureCardTran?InvoiceId=' + invoiceId + '&ExchNum=' + exchNum + '&TranAmt=' + tranAmt + '&IsRefund=' + isRefund + "&PlanNum=10001" ,
    { headers: this.headerObjs }).pipe(
      catchError(error => this.handleExchCardTndrError(error))
    );
  }

  captureSignature(val: string): Observable<SigCapture> {
    return this.httpClient.get<SigCapture>(this.cposWebSvcUrl + 'pinpad/CaptureSignature?val=' + val,
    {headers: this.headerObjs}).pipe(
      catchError(error => this.handleSigCaptureError(error))
    );
  }

  captureMsrSwipe(displayMsg: string, appType: number): Observable<MSRSwipeData> {    

    return this.httpClient.get<MSRSwipeData>(this.cposWebSvcUrl + 'msr/CaptureCardData?DisplayMsg='+ displayMsg + '&AppType=' + appType.toString(),
    { headers: this.headerObjs }).pipe(
      catchError(error => this.handleMSRSwipeDataError(error))
    );   

  }

  captureSigpadSignature(val: string): Observable<SigCapture> {
    return this.httpClient.get<SigCapture>(this.cposWebSvcUrl + 'sigpad/CaptureSignature?DisplayMsg=' + val,
    {headers: this.headerObjs}).pipe(
      catchError(error => this.handleSigCaptureError(error))
    );
  }

  pinpadHeartbeat(val: string): Observable<VerifoneCommStatus> {
    return this.httpClient.get<VerifoneCommStatus>(this.cposWebSvcUrl + 'pinpad/HeartBeat?val=' + val,
      { headers: this.headerObjs }).pipe(
      catchError(error => this.handleVerifoneCommStatusError(error))
    );
  }
}
