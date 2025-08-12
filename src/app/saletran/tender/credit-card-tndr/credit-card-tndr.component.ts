import { Component } from '@angular/core';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketSplit } from 'src/app/models/ticket.split';
import { firstValueFrom, Subscription, take } from 'rxjs';
import { getRemainingBal, getRemainingBalanceDC, getRemainingBalanceFC, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { TenderType } from '../../models/tender.type';
import { addTender, saveCompleteTicketSplit } from '../../store/ticketstore/ticket.action';
import { UtilService } from 'src/app/services/util.service';
import { VfoneCaptureTran } from '../../services/models/capture-tran.model';

@Component({
  selector: 'app-credit-card-tndr',
  imports: [],
  templateUrl: './credit-card-tndr.component.html',
  styleUrl: './credit-card-tndr.component.css'
})
export class CreditCardTndrComponent {

dcCurrSymbl: any;
ndcCurrSymbl: any;
  constructor(private _cposWebSvc: CPOSWebSvcService, 
    private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService) {
    // Initialization logic can go here if needed
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
    
  private _captureTranResponse: VfoneCaptureTran = {} as VfoneCaptureTran;
  private subscription: Subscription = {} as Subscription;

  private _tndrObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {

    this._store.select(getRemainingBal).subscribe(data => {
      this._tndrObj.tenderAmount = data.amountDC
      this._tndrObj.fcTenderAmount = data.amountNDC;
    })

    this.activatedRoute.queryParams.subscribe(params => {
      this._tndrObj.tenderTypeCode = params['code'];
    })

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;

      this._tktObj = data;
      this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    })

    this._tndrObj.tndMaintUserId = this._logonDataSvc.getLocationConfig().individualUID.toString();
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderStatus = TenderStatusType.InProgress; // Assuming 1 is the
    this._tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
    this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
    this._tndrObj.tenderTypeDesc = "pinpad";
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
  
    this.dcCurrSymbl = this._logonDataSvc.getLocationConfig().defaultCurrency;
    this.ndcCurrSymbl = this._logonDataSvc.getLocationConfig().currCode;

    let exchNum = this._logonDataSvc.getLocationConfig().facilityNumber.substring(0, 4) ;
    let IsRefund = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tndrObj.tenderTypeCode)?.isRefundType || false;

    this._cposWebSvc.captureCardTran(this._tndrObj.rrn, exchNum, this._tndrObj.tenderAmount, IsRefund).subscribe({
      next: (data) => { 
        this._captureTranResponse = data;
        console.log("CaptureCardTran response: ", data);
        
        if(this._captureTranResponse.rslt.IsSuccessful) {
          if(this._captureTranResponse.Result.toLowerCase().includes("approval") || this._captureTranResponse.Result.toLowerCase().includes("approved")) {
            let btn = document.getElementById('btnApprove') as HTMLButtonElement;
            console.log("Transaction approved, proceeding with tender addition.");
            btn.click();
          }
          else {
            let btn = document.getElementById('btnDecline') as HTMLButtonElement;
            console.log("Transaction declined, proceeding with decline action.");
            btn.click();
          }
        }
        else {
          console.error("Transaction failed: ", this._captureTranResponse.rslt.ReturnMsg);
        }
      } ,
      error: (err) => {
        console.error("Error capturing card transaction: ", err);
      }
    });
  }

  async btnApproveClick(evt: Event) {
    console.log("btnApprove clicked");

    
    //tndrObj.currCode = this._logonDataSvc.getLocationConfig().defaultCurrency;
    
    console.log("TenderTypes length" + this._logonDataSvc.getTenderTypes().types.length);
    let tndrTypeObj = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tndrObj.tenderTypeCode);
    if (tndrTypeObj != null) {
      console.log("TenderTypeDesc: " + tndrTypeObj.tenderTypeDesc);
      this._tndrObj.tenderTypeDesc = tndrTypeObj.tenderTypeDesc.valueOf();
    }
    this._tndrObj.tenderStatus = TenderStatusType.Complete; // Assuming 2 is the status for approved tender
    this._tndrObj.authNbr = this._captureTranResponse.AUTH_CODE;
    this._tndrObj.tenderAmount = this._captureTranResponse.APPROVED_AMOUNT;
    this._tndrObj.cardEndingNbr = this._captureTranResponse.ACCT_NUM.slice(-4);;
    this._tndrObj.tenderTypeDesc = "pinpad";
    this._tndrObj.inStoreCardNbrTmp = this._captureTranResponse.ACCT_NUM;    
    
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;

    this._store.dispatch(addTender({ tndrObj: this._tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    if (tktObjData != null) {
      this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
    }
    this.route.navigate(['/savetktsuccess']);

  }

  btnDeclineClick(evt: Event) {
    this.route.navigate(['/checkout']);
  }

  btnCancelClick(evt: Event) {
    console.log("btnCancel clicked"); 
  }

  private IsTicketComplete(tktObj: TicketSplit): boolean {

    if (tktObj.tktList.length == 0)
      return false;

    if (tktObj.ticketTenderList.length == 0)
      return false;

    let ticketTotal = 0;

    for (const key in tktObj.tktList) {
      ticketTotal += tktObj.tktList[key].lineItemDollarDisplayAmount;
    }

    for (const key in tktObj.associateTips) {
      ticketTotal += tktObj.associateTips[key].tipAmount;
    }

    let allowPartPay = this._logonDataSvc.getAllowPartPay();

    let tenderTotals = 0;

    for (const key in tktObj.ticketTenderList) {
      tenderTotals += tktObj.ticketTenderList[key].tenderAmount;
    }

    if (allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals || Number(ticketTotal).toFixed(2) == Number(tenderTotals).toFixed(2)) {
      return true;
    }
    else {
      return false;
    }
  }
}
