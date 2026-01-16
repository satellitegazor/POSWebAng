import { AfterContentInit, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getBalanceDue, getBalanceDueFC, getTktObjSelector, getRemainingBal, AmountDCNDC } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { addPinpadResp, addTender, saveCompleteTicketSplit, savePinpadResponse, saveTenderObj, saveTenderObjSuccess, saveTicketForGuestCheck, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { LocalStorageService } from 'src/app/global/local-storage.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TenderType, TenderTypeModel } from '../../../models/tender.type';
import { SalesTransactionCheckoutItem } from '../../../models/salesTransactionCheckoutItem';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { getLocCnfgIsAllowTipsSelector } from '../../store/locationconfigstore/locationconfig.selector';
import { combineLatest, filter, firstValueFrom, forkJoin, map, Observable, Subscription, take } from 'rxjs';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { UtilService } from 'src/app/services/util.service';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { Actions, ofType } from '@ngrx/effects';
import { Round2DecimalService } from 'src/app/services/round2-decimal.service';
import { RootObject } from 'src/app/app.state';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-tender-page',
  templateUrl: './device-tndr-page.component.html',
  styleUrls: ['./device-tndr-page.component.css'],
  standalone: false
})
export class DeviceTndrPageComponent implements OnInit, AfterContentInit {

  constructor(private _store: Store,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _cposWebSvc: CPOSWebSvcService,
    private _utilSvc: UtilService,
    private actions$: Actions,
    private _toastSvc: ToastService) {
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  public tenderAmount: number = 0;
  public tenderAmountFC: number = 0;
  public dcCurrSymbl: string = '';
  public ndcCurrSymbl: string = '';
  private _tenderTypeCode: string = '';
  private _captureTranResponse: ExchCardTndr = new ExchCardTndr();
  private tndrObj: TicketTender = new TicketTender();
  public isWaitingForPinpad: boolean = false;

  private subscription: Subscription = {} as Subscription;

  ngOnInit(): void {}

  ngAfterContentInit(): void {

    this._logonDataSvc.getLocationConfig().defaultCurrency;
    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) || '';
    if (this._logonDataSvc.getIsForeignCurr()) {
      this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode()) || '';
    }

    combineLatest([
      this._store.select(getRemainingBal).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, queryParams]) => {
      if (tenderBal) {
        this.tenderAmount = tenderBal.amountDC;
        this.tenderAmountFC = tenderBal.amountNDC;
      } else {
        console.warn('Remaining balance not available yet');
        // fallback or retry
      }

      this._tenderTypeCode = queryParams['code'];
      this.getAuthorization();
    }).unsubscribe();    
  }

  async getRemainingBalance() {
    const state: RootObject = await firstValueFrom(this._store.pipe(take(1))).then(state => state as RootObject);
    const tktObj = state.TktObjState.tktObj;

    let tenderTotal: number = 0;
    let tipTotal: number = 0;
    let tenderTotalFC: number = 0;
    let ticketTotal: number = 0;
    let ticketTotalFC: number = 0;
    let tipTotalFC: number = 0;

    tktObj.ticketTenderList.forEach(tndr => tenderTotal += parseFloat((tndr.tenderAmount).toFixed(2)));
    tktObj.tktList.forEach(itm => ticketTotal += parseFloat((itm.lineItemDollarDisplayAmount).toFixed(2)));
    tktObj.associateTips.forEach(tip => tipTotal += parseFloat((tip.tipAmount).toFixed(2)));

    tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += parseFloat((tndr.fcTenderAmount).toFixed(2)));
    tktObj.tktList.forEach(itm => ticketTotalFC += parseFloat((itm.dCLineItemDollarDisplayAmount).toFixed(2)));
    tktObj.associateTips.forEach(tip => tipTotalFC += parseFloat((tip.tipAmtLocCurr).toFixed(2)));

    if (tktObj.isPartialPay) {
      ticketTotal = tktObj.partialAmount;
      ticketTotalFC = tktObj.partialAmountFC;
    }

    this.tenderAmount = Round2DecimalService.round(ticketTotal + tipTotal - tenderTotal);
    this.tenderAmountFC = Round2DecimalService.round(ticketTotalFC + tipTotalFC - tenderTotalFC);
    return;
  }

  private async getAuthorization() {

    let InvoiceId = this._utilSvc.getUniqueRRN();
    let exchNum = this._utilSvc.getUniqueRRN();
    let tranAmt = this.tenderAmount;
    let isRefund = false;

    this.isWaitingForPinpad = true;

    this._cposWebSvc.captureCardTran(InvoiceId, exchNum, tranAmt, isRefund).subscribe({
      next: async (data) => {
        this.isWaitingForPinpad = false;
        //console.log("Capture Card Transaction Response: ", data);
        if (data.rslt.IsSuccessful) {
          //console.log("Transaction Successful");
          this.tndrObj.rrn = InvoiceId;
          this.tndrObj.isAuthorized = true;
          this.tndrObj.authNbr = data.AUTH_CODE;
          this.tndrObj.cardEndingNbr = data.FIRST6_LAST4;
          this.tndrObj.traceId = "false";
          this.tndrObj.tenderTypeDesc = "pinpad";
          this.tndrObj.inStoreCardNbrTmp = data.ACCT_NUM;
          this.tndrObj.tenderStatus = TenderStatusType.Complete;
          this.tndrObj.tenderTypeCode = this._tenderTypeCode;
          this.tndrObj.tenderAmount = this.tenderAmount;
          this.tndrObj.fcTenderAmount = this.tenderAmountFC;
          this.tndrObj.tndMaintTimestamp = new Date(Date.now());
          //tndrObj. = this._logonDataSvc.getLocationConfig().defaultCurrency;
          this.tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
          this.tndrObj.tenderTypeCode = this._tenderTypeCode;

          this._captureTranResponse.copyFrom(data);

          var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
          if (tktObjData != null) {
            this.tndrObj.tenderTransactionId = tktObjData.transactionID;
            this._captureTranResponse.transactionId = tktObjData.transactionID;

            this._store.dispatch(addTender({ tndrObj: this.tndrObj }));
            this._store.dispatch(saveTenderObj({ tndrObj: this.tndrObj }));

            let ticketTenderId = 0;
            this.actions$.pipe(ofType(saveTenderObjSuccess), 
              take(1),
              map(action => action.data.data.ticketTenderId)).subscribe((tenderId) => {
                ticketTenderId = tenderId;
                //this.tndrObj.ticketTenderId = tenderId;

              });

            this._captureTranResponse.ticketTenderId = ticketTenderId;

            this._store.dispatch(addPinpadResp({ respObj: this._captureTranResponse }));
            
            var tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

            if (this.IsTicketComplete(tktObjData1)) {
              this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData1 }));
              this.route.navigate(['/savetktsuccess']);
            }
            else {
              this.route.navigate(['/splitpay']);
            }
          }
        } else {
          // Transaction was declined
          this._toastSvc.error('Card transaction was declined. Please try again or use another payment method.');
          this.btnDecline(new Event('auto-decline'));
        }

      },
      error: (error) => {
        this.isWaitingForPinpad = false;
        // Error occurred during pinpad interaction
        const errorMessage = error?.message || 'An error occurred during pinpad interaction. Please try again.';
        this._toastSvc.error(errorMessage);
        this.btnDecline(new Event('auto-decline'));
      }
    });
  }


  async btnApprove(evt: Event) {
    //console.log("btnApprove clicked");

    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderTypeCode;
    tndrObj.tenderAmount = this.tenderAmount;
    tndrObj.fcTenderAmount = this.tenderAmountFC;
    tndrObj.tndMaintTimestamp = new Date(Date.now())
    //tndrObj.currCode = this._logonDataSvc.getLocationConfig().defaultCurrency;
    tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
    //console.log("TenderTypes length" + this._logonDataSvc.getTenderTypes().types.length);
    let tndrTypeObj = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tenderTypeCode);
    if (tndrTypeObj != null) {
      //console.log("TenderTypeDesc: " + tndrTypeObj.tenderTypeDesc);
      tndrObj.tenderTypeDesc = tndrTypeObj.tenderTypeDesc.valueOf();
    }

    this._store.dispatch(addTender({ tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    if (tktObjData != null) {
      this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
    }
    this.route.navigate(['/savetktsuccess']);

  }

  btnDecline(evt: Event) {
    this.route.navigate(['/checkout']);
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

    if (allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals || Number(Number(ticketTotal).toFixed(2)) == Number(Number(tenderTotals).toFixed(2))) {
      return true;
    }
    else {
      return false;
    }
  }

}
