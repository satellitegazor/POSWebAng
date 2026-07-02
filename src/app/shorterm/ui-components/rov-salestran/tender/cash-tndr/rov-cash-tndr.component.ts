import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TenderStatusType, TicketTender, TranStatusType } from '../../../../../models/ticket.tender';
import { CPOSWebSvcService } from '../../../../../services-pinpad/cposweb-svc.service';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { RovLogonDataService } from "../../../../rov-logon-data.service"
import { UtilService } from '../../../../../services-misc/util.service';
import { ROV_POSTicketSplit } from '../../../../models/rticket.split';
import { ExchCardTndr } from '../../../../../models/exch.card.tndr';
import { firstValueFrom, forkJoin, Subscription, take } from 'rxjs';
import { getRIsSplitPayR5, getRRemainingBal, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { RovTenderUtil } from '../tender-util';
import { addRovTender, markRovTendersComplete, markRovTicketComplete, saveCompleteRovTicketSplit, saveRovTenderObj } from '../../../../store/ticketstore/rticket.action';
import { RovRedeemGiftCardTenders } from '../gc-redeem-services/rov-redeem-gift-card-tenders';
import { ToastService } from "../../../../../services-misc/toast.service";
import { RovOConusRedeemGCWithPinPadService } from '../gc-redeem-services/rov-oconus-redeeem-gc-with-pin-pad';
import { RovConusRedeemGCwithAurusAPI } from '../gc-redeem-services/rov-conus-redeem-gc-with-aurus-api';
import { markTendersComplete } from '../../../../../longterm/saletran/store/ticketstore/ticket.action';
import { PosCurrencyDirective } from '../../../../../directives/pos-currency.directive';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-rov-cash-tndr',
  templateUrl: './rov-cash-tndr.component.html',
  styleUrls: ['./rov-cash-tndr.component.css'],
  imports: [PosCurrencyDirective, CommonModule, FormsModule, ReactiveFormsModule]
})
export class RovCashTndrComponent implements OnInit {

  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  dcCurrencyCode: string = '';
  ndcCurrencyCode: string = '';
  tenderAmountNDC: number | undefined;
  tenderAmountDC: number | undefined;
  isOConusLocation: boolean = false;

  constructor(private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<RovSaleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private rovLogonDataSvc: RovLogonDataService,
    private _utilSvc: UtilService,
    private _toastSvc: ToastService,
    private _oConusRedeemGCWithPinPad: RovOConusRedeemGCWithPinPadService,
    private _conusRedeemGCWithAurusAPI: RovConusRedeemGCwithAurusAPI) {
    // Initialization logic can go here if needed
    this.isOConusLocation = this.rovLogonDataSvc.getIsForeignCurr();
  }

  private _tktObj: ROV_POSTicketSplit = {} as ROV_POSTicketSplit;
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

    this.dcCurrencyCode = this.rovLogonDataSvc.getDfltCurrCode();
    this.ndcCurrencyCode = this.rovLogonDataSvc.getNonDfltCurrCode();

    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this.dcCurrencyCode);
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this.ndcCurrencyCode);

    // Only fetch remaining balance if tenderAmount was not provided in queryParams
    forkJoin([
      this._store.select(getRRemainingBal).pipe(take(1)),
      this._store.select(getRIsSplitPayR5).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, isSplitPay, params]) => {

      this._tndrObj.tenderTypeCode = this.rovLogonDataSvc.getTranIsRefund() ? 'RC' : 'CA';
      this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
      this._tndrObj.ticketTenderId = -Date.now() % 10000;
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


    this._store.select(getRTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      //console.log("getTktObjSelector data: ", data);
      this._tktObj = data;
    }).unsubscribe();

    

  }

  private loadFastCashButtons(): void {
    // USD Fast Cash
    let usdFastCash = this.rovLogonDataSvc.getRovEventConfig().usdFastcash;
    let frgnFastCash = this.rovLogonDataSvc.getRovEventConfig().frgnFastcash;

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
    this._tndrObj.tenderTypeCode = this.rovLogonDataSvc.getTranIsRefund() ? 'RC' : 'CA';
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._store.dispatch(addRovTender({ tndrObj: this._tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));

    if (tktObjData != null && RovTenderUtil.IsTicketComplete(tktObjData, this.rovLogonDataSvc.getAllowPartPay())) {

      if(tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false).length > 0){

        if(this.isOConusLocation) {
          // Redeem Gift Card Tenders
          this._oConusRedeemGCWithPinPad.redeem(tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false)).subscribe({
            next: () => {
              this.markTicketComplete();
              return true;
            },
            error: (error) => {
              console.error('Error during gift card redemption: ', error);
              return false;
            }
          });
        }
        else {
          this._conusRedeemGCWithAurusAPI.redeem(tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false)).subscribe({
            next: () => {
              this.markTicketComplete();
              return true;
            },
            error: (error) => {
              console.error('Error during gift card redemption: ', error);
              return false;
            }
          });

        }
            // After redeeming gift cards, mark tenders and ticket as complete
        //new RedeemGiftCardTenders().redeem(this._store, this._cposWebSvc, this._logonDataSvc, this._toastSvc);
      }
      else {
        this.markTicketComplete();
      }

    }
    else {
      this.route.navigate([this.isSplitPay ? '/rov/rsplitpay' : '/rov/rchekout']);
    }
  }

  private async markTicketComplete() {
    this._store.dispatch(markRovTendersComplete({ status: TenderStatusType.Complete }));
    this._store.dispatch(markRovTicketComplete({ status: TranStatusType.Complete }));

    // Fetch the updated ticket object after marking complete
    const tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
    if (tktObjData != null) {
      this._store.dispatch(saveCompleteRovTicketSplit({ tktObj: tktObjData }));
      this.route.navigate(['/rov/savetktsuccess']);
    }
    else {
      this.route.navigate(this.isSplitPay ? ['/rov/rsplitpay'] : ['/rov/rchekout']);
    }
  }

  btnCancelClick($event: PointerEvent) {
    this.route.navigate([this.isSplitPay ? '/rov/rsplitpay' : '/rov/rchekout']);
  }
  btnDeclineClick($event: PointerEvent) {
    this.route.navigate([this.isSplitPay ? '/rov/rsplitpay' : '/rov/rchekout']);
  }
}
