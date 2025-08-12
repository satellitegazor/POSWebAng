import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getRemainingBalanceDC, getRemainingBalanceFC, getBalanceDue, getBalanceDueFC, getTktObjSelector, getRemainingBal } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TicketTender } from 'src/app/models/ticket.tender';
import { addTender, saveCompleteTicketSplit, saveTicketForGuestCheck, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { LocalStorageService } from 'src/app/global/local-storage.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TenderType, TenderTypeModel } from '../../models/tender.type';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { getLocCnfgIsAllowTipsSelector } from '../../store/locationconfigstore/locationconfig.selector';
import { combineLatest, filter, firstValueFrom, forkJoin, Observable, Subscription, take } from 'rxjs';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-tender-page',
  templateUrl: './tender-page.component.html',
  styleUrls: ['./tender-page.component.css'],
  standalone: false
})
export class TenderPageComponent implements OnInit {

  constructor(private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _cposWebSvc: CPOSWebSvcService,
    private _utilSvc: UtilService) {
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  public tenderAmount: number = 0;
  public tenderAmountFC: number = 0;
  private _defaultCurrency: string = '';
  private _tenderTypeCode: string = '';

  private subscription: Subscription = {} as Subscription;

  ngOnInit(): void {

    forkJoin([
      this._store.select(getRemainingBal).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, queryParams]) => {
      this.tenderAmount = tenderBal.amountDC;
      this.tenderAmountFC = tenderBal.amountNDC;
      this._tenderTypeCode = queryParams['code'];
      this.getAuthorization();

    });


  }

  private async getAuthorization() {

    let InvoiceId = this._utilSvc.getUniqueRRN();
    let exchNum = this._utilSvc.getUniqueRRN();
    let tranAmt = this.tenderAmount;
    let isRefund = false;

    this._cposWebSvc.captureCardTran(InvoiceId, exchNum, tranAmt, isRefund).subscribe({
      next: async (data) => {
        console.log("Capture Card Transaction Response: ", data);
        if (data.rslt.IsSuccessful) {
          console.log("Transaction Successful");
          let tndrObj: TicketTender = new TicketTender();
          tndrObj.tenderTypeCode = this._tenderTypeCode;
          tndrObj.tenderAmount = this.tenderAmount;
          tndrObj.fcTenderAmount = this.tenderAmountFC;
          tndrObj.tndMaintTimestamp = new Date(Date.now());
          //tndrObj. = this._logonDataSvc.getLocationConfig().defaultCurrency;
          tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
          tndrObj.tenderTypeCode = this._tenderTypeCode;
          this._store.dispatch(addTender({ tndrObj }));

          var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

          if (tktObjData != null) {
            this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
          }
          this.route.navigate(['/savetktsuccess']);
        }
      }
    });
  }


  async btnApprove(evt: Event) {
    console.log("btnApprove clicked");

    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderTypeCode;
    tndrObj.tenderAmount = this.tenderAmount;
    tndrObj.fcTenderAmount = this.tenderAmountFC;
    tndrObj.tndMaintTimestamp = new Date(Date.now())
    //tndrObj.currCode = this._logonDataSvc.getLocationConfig().defaultCurrency;
    tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
    console.log("TenderTypes length" + this._logonDataSvc.getTenderTypes().types.length);
    let tndrTypeObj = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tenderTypeCode);
    if (tndrTypeObj != null) {
      console.log("TenderTypeDesc: " + tndrTypeObj.tenderTypeDesc);
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

    if (allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals || Number(ticketTotal).toFixed(2) == Number(tenderTotals).toFixed(2)) {
      return true;
    }
    else {
      return false;
    }
  }
}
