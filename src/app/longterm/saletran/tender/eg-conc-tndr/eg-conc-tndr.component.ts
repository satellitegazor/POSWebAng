import { Component, ElementRef, ViewChild } from '@angular/core';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { UtilService } from 'src/app/services/util.service';
import { TicketSplit } from 'src/app/models/ticket.split';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { firstValueFrom, forkJoin, Subscription, take } from 'rxjs';
import { getIsSplitPayR5, getRemainingBal, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { TenderUtil } from '../tender-util';
import { addTender, markTendersComplete, markTicketComplete, saveCompleteTicketSplit, saveTenderObj } from '../../store/ticketstore/ticket.action';
import { RedeemGiftCardTenders } from '../redeem-gift-card-tenders';
import { ToastService } from 'src/app/services/toast.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-eg-conc-tndr',
  imports: [DecimalPipe],
  templateUrl: './eg-conc-tndr.component.html',
  styleUrl: './eg-conc-tndr.component.css'
})
export class EgConcTndrComponent {

  private isSplitPay: boolean = false;


  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  tenderAmountNDC: number | undefined;
  tenderAmountDC: number | undefined;

  constructor(private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService,
    private _toastSvc: ToastService) {
    // Initialization logic can go here if needed
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  private _captureTranResponse: ExchCardTndr = {} as ExchCardTndr;
  private subscription: Subscription = {} as Subscription;

  private _tndrObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {

    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode());
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode());

    forkJoin([
      this._store.select(getRemainingBal).pipe(take(1)),
      this._store.select(getIsSplitPayR5).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, isSplitPay, params]) => {

      this.isSplitPay = isSplitPay;
      if (!isSplitPay) {
        this._tndrObj.tenderAmount = tenderBal.amountDC
        this._tndrObj.fcTenderAmount = tenderBal.amountNDC;

        this.tenderAmountDC = tenderBal.amountDC;
        this.tenderAmountNDC = tenderBal.amountNDC;
      }
      else {
        
        const hasQueryTenderAmount = params['tenderAmount'] !== undefined && params['tenderAmount'] !== null;

        if (hasQueryTenderAmount) {
          this._tndrObj.tenderAmount = parseFloat(params['tenderAmount']);
          this.tenderAmountDC = this._tndrObj.tenderAmount;
        }
        if (params['tenderAmountFC']) {
          this._tndrObj.fcTenderAmount = parseFloat(params['tenderAmountFC']);
          this.tenderAmountNDC = this._tndrObj.fcTenderAmount;
        }
      }
      this._tndrObj.tenderTypeCode = params['code'] || 'EG';
      this._tndrObj.rrn = this._utilSvc.getUniqueRRN();

    }).unsubscribe();

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      
      this._tktObj = data;
    }).unsubscribe()
  }

  async btnApproveClick(evt: Event) {

    this._tndrObj.tenderStatus = TenderStatusType.InProgress;
    this._tndrObj.isAuthorized = true;
    //this._tndrObj.tenderTypeCode = "EG";
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._tndrObj.tenderTypeDesc = this._utilSvc.tenderCodeDescMap.get(this._tndrObj.tenderTypeCode) || 'Eagle Cash';
    this._store.dispatch(addTender({ tndrObj: this._tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;;

    if (tktObjData != null && TenderUtil.IsTicketComplete(tktObjData, this._logonDataSvc.getAllowPartPay())) {

      if(tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false).length > 0){
        // Redeem Gift Card Tenders
        RedeemGiftCardTenders.redeem(this._store, this._cposWebSvc, this._logonDataSvc, this._toastSvc);
      }              

      this._store.dispatch(markTendersComplete({ status: 4 }));
      this._store.dispatch(markTicketComplete({ status: 2 }));
      // Fetch the updated ticket object after marking complete
      const tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
      if (tktObjData1 != null) {
        this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData1 }));
        this.route.navigate(['/savetktsuccess']);
      }
      else {
        this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
      }
    }
    else {
      this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
    }

  }

  async btnDeclineClick(evt: Event) {
    this.route.navigate([this.isSplitPay ? '/splitpay' : '/checkout']);
  }

  async btnCancelClick(evt: Event) {
    this.route.navigate([this.isSplitPay ? '/splitpay' : '/checkout']);
  }

}
