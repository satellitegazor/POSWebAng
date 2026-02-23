import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TenderStatusType, TicketTender, TranStatusType } from 'src/app/models/ticket.tender';
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
import { CommonModule } from '@angular/common';
import { RedeemGiftCardTenders } from '../redeem-gift-card-tenders';
import { ToastService } from 'src/app/services/toast.service';
import { RedeeemGiftCardTndrsService } from '../redeeem-gift-card-tndrs.service';

@Component({
  selector: 'app-cash-tndr',
  imports: [CommonModule],
  templateUrl: './cash-tndr.component.html',
  styleUrl: './cash-tndr.component.css'
})
export class CashTndrComponent implements OnInit {

  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  dcCurrencyCode: string = '';
  ndcCurrencyCode: string = '';
  tenderAmountNDC: number | undefined;
  tenderAmountDC: number | undefined;

  constructor(private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService,
    private _toastSvc: ToastService,
    private _redeemGiftCardTndrsSvc: RedeeemGiftCardTndrsService) {
    // Initialization logic can go here if needed

  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  private _captureTranResponse: ExchCardTndr = {} as ExchCardTndr;
  private subscription: Subscription = {} as Subscription;

  _tndrObj: TicketTender = {
    tenderTypeCode: '',
    tenderAmount: 0,
    fcTenderAmount: 0,
    tenderStatus: TenderStatusType.InProgress,
    isAuthorized: false,
    tndMaintTimestamp: new Date(),
  } as TicketTender;

  usdFastCashButtons: number[] = [];
  foreignFastCashButtons: number[] = [];
  isSplitPay: boolean = false;

  ngOnInit(): void {

    this.dcCurrencyCode = this._logonDataSvc.getDfltCurrCode();
    this.ndcCurrencyCode = this._logonDataSvc.getNonDfltCurrCode();

    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this.dcCurrencyCode);
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this.ndcCurrencyCode);

    // Only fetch remaining balance if tenderAmount was not provided in queryParams
    forkJoin([
      this._store.select(getRemainingBal).pipe(take(1)),
      this._store.select(getIsSplitPayR5).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, isSplitPay, params]) => {

      this._tndrObj.tenderTypeCode = params['code'] || 'CA';
      this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
      this._tndrObj.ticketTenderId = 0; // Will be set when added to store
      this._tndrObj.tenderTypeDesc = this._utilSvc.tenderCodeDescMap.get(this._tndrObj.tenderTypeCode) || 'Cash';

      const hasQueryTenderAmount = params['tenderAmountDC'] !== undefined && params['tenderAmountDC'] !== null;
      if (hasQueryTenderAmount) {
        this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountDC']) : parseFloat(params['tenderAmountNDC']);
        this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountNDC']) : parseFloat(params['tenderAmountDC']);
        this.tenderAmountDC = this.dcCurrSymbl == '$' ? this._tndrObj.tenderAmount : this._tndrObj.fcTenderAmount;
        this.tenderAmountNDC = this.dcCurrSymbl == '$' ? this._tndrObj.fcTenderAmount : this._tndrObj.tenderAmount;
      }

      this.isSplitPay = isSplitPay;
      if (!isSplitPay) {
        this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;
        this.tenderAmountDC = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this.tenderAmountNDC = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;
      }
      this.loadFastCashButtons();
    }).unsubscribe();


    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      //console.log("getTktObjSelector data: ", data);
      this._tktObj = data;
    }).unsubscribe();

    

  }

  private loadFastCashButtons(): void {
    // USD Fast Cash
    let usdFastCash = this._logonDataSvc.getLocationConfig().usdFastcash;
    let frgnFastCash = this._logonDataSvc.getLocationConfig().frgnFastcash;

    if (usdFastCash) {
      this.usdFastCashButtons = usdFastCash
        .split(',')
        .map((val: string) => parseFloat(val.trim()))
        .filter((val: number) => (!isNaN(val) && val >= this._tndrObj.tenderAmount!))
        .sort((a: number, b: number) => a - b);
    }

    // Foreign Fast Cash
    if (frgnFastCash) {
      this.foreignFastCashButtons = frgnFastCash
        .split(',')
        .map((val: string) => parseFloat(val.trim()))
        .filter((val: number) => (!isNaN(val) && val >= this._tndrObj.fcTenderAmount!))
        .sort((a: number, b: number) => a - b);
    }
  }
  // Handler for USD fast cash button click
  onUsdFastCashClick(amount: number): void {
    this._tndrObj.changeDue = amount - (this.tenderAmountDC || 0);
    this.btnApproveClick(new Event('click'));
  }

  // Handler for Foreign fast cash button click
  onForeignFastCashClick(amount: number): void {
    this._tndrObj.fcChangeDue = amount - (this.tenderAmountNDC || 0);
    this.btnApproveClick(new Event('click'));
  }

  // Optional: Exact cash button
  onExactCash(): void {
    this.btnApproveClick(new Event('click'));
  }

  async btnApproveClick(evt: Event) {

    this._tndrObj.tenderStatus = TenderStatusType.InProgress;
    this._tndrObj.isAuthorized = true;
    this._tndrObj.tenderTypeCode = "CA";
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._store.dispatch(addTender({ tndrObj: this._tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    if (tktObjData != null && TenderUtil.IsTicketComplete(tktObjData, this._logonDataSvc.getAllowPartPay())) {

      if(tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false).length > 0){
        // Redeem Gift Card Tenders
        this._redeemGiftCardTndrsSvc.redeem(tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false)).subscribe({
          next: () => {
            this.markTicketComplete();
            return true;
          },
          error: (error) => {
            console.error('Error during gift card redemption: ', error);
            return false;
          }
        });
            // After redeeming gift cards, mark tenders and ticket as complete
        //new RedeemGiftCardTenders().redeem(this._store, this._cposWebSvc, this._logonDataSvc, this._toastSvc);
      }
      else {
        this.markTicketComplete();
      }

    }
    else {
      this.route.navigate([this.isSplitPay ? '/splitpay' : '/checkout']);
    }
  }

  private async markTicketComplete() {
    this._store.dispatch(markTendersComplete({ status: TenderStatusType.Complete }));
    this._store.dispatch(markTicketComplete({ status: TranStatusType.Complete }));

    // Fetch the updated ticket object after marking complete
    const tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
    if (tktObjData != null) {
      this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
      this.route.navigate(['/savetktsuccess']);
    }
    else {
      this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
    }
  }

  btnCancelClick($event: PointerEvent) {
    this.route.navigate([this.isSplitPay ? '/splitpay' : '/checkout']);
  }
  btnDeclineClick($event: PointerEvent) {
    this.route.navigate([this.isSplitPay ? '/splitpay' : '/checkout']);
  }
}
