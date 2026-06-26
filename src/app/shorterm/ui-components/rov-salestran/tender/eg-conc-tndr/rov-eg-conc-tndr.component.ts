import { Component, ElementRef, ViewChild } from '@angular/core';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { CPOSWebSvcService } from '../../../../../services-pinpad/cposweb-svc.service';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { UtilService } from 'src/app/services-misc/util.service';
import { TicketSplit } from 'src/app/models/ticket.split';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { firstValueFrom, forkJoin, Subscription, take } from 'rxjs';
import { getRIsSplitPayR5, getRRemainingBal, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { RovTenderUtil } from '../tender-util';
import { addRovTender, markRovTendersComplete, markRovTicketComplete, saveCompleteRovTicketSplit, saveRovTenderObj } from '../../../../store/ticketstore/rticket.action';
import { RovRedeemGiftCardTenders } from '../gc-redeem-services/rov-redeem-gift-card-tenders';
import { ToastService } from 'src/app/services-misc/toast.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RovOConusRedeemGCWithPinPadService } from '../gc-redeem-services/rov-oconus-redeeem-gc-with-pin-pad';
import { ConusRedeemGCwithAurusAPI } from '../gc-redeem-services/conus-redeem-gc-with-aurus-api';
import { ROV_POSTicketSplit } from 'src/app/shorterm/models/rticket.split';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-rov-eg-conc-tndr',
  templateUrl: './rov-eg-conc-tndr.component.html',
  styleUrls: ['./rov-eg-conc-tndr.component.css'],
  imports : [DecimalPipe, CommonModule, FormsModule]
})
export class RovEgConcTndrComponent {

  private isSplitPay: boolean = false;


  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  tenderAmountNDC: number | undefined;
  tenderAmountDC: number | undefined;
  isOConusLocation: boolean = false;

  constructor(private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<RovSaleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService,
    private _toastSvc: ToastService,
    private _oConusRedeemGCWithPinPad: RovOConusRedeemGCWithPinPadService,
    private _conusRedeemGCWithAurusAPI: ConusRedeemGCwithAurusAPI) {
    // Initialization logic can go here if needed
    this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
  }

  private _tktObj: ROV_POSTicketSplit = {} as ROV_POSTicketSplit;
  private _captureTranResponse: ExchCardTndr = {} as ExchCardTndr;
  private subscription: Subscription = {} as Subscription;

  private _tndrObj: TicketTender = new TicketTender();

  ngOnInit(): void {

    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode());
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode());

    forkJoin([
      this._store.select(getRRemainingBal).pipe(take(1)),
      this._store.select(getRIsSplitPayR5).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, isSplitPay, params]) => {

      this.isSplitPay = isSplitPay;
      if (!isSplitPay) {
        this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;

        this.tenderAmountDC = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this.tenderAmountNDC = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;
      }
      else {
        
        const hasQueryTenderAmount = params['tenderAmountDC'] !== undefined && params['tenderAmountDC'] !== null;

        if (isSplitPay && hasQueryTenderAmount) {
          this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountDC']) : parseFloat(params['tenderAmountNDC']);
          this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountNDC']) : parseFloat(params['tenderAmountDC']);
          this.tenderAmountDC = this.dcCurrSymbl == '$' ? this._tndrObj.tenderAmount : this._tndrObj.fcTenderAmount;
          this.tenderAmountNDC = this.dcCurrSymbl == '$' ? this._tndrObj.fcTenderAmount : this._tndrObj.tenderAmount;
        }
      }
      this._tndrObj.tenderTypeCode = params['code'] || 'EG';
      this._tndrObj.rrn = this._utilSvc.getUniqueRRN();

    }).unsubscribe();

    this._store.select(getRTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      
      this._tktObj = data;
    }).unsubscribe()
  }

  async btnApproveClick(evt: Event) {

    this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
    this._tndrObj.tenderStatus = TenderStatusType.InProgress;
    this._tndrObj.isAuthorized = true;
    //this._tndrObj.tenderTypeCode = "EG";
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._tndrObj.tenderTypeDesc = this._utilSvc.tenderCodeDescMap.get(this._tndrObj.tenderTypeCode) || 'Eagle Cash';
    this._tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
    this._tndrObj.ticketTenderId = -Date.now() % 10000;
    this._store.dispatch(addRovTender({ tndrObj: this._tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1))) || {} as ROV_POSTicketSplit;
    if (tktObjData != null && RovTenderUtil.IsTicketComplete(tktObjData, this._logonDataSvc.getAllowPartPay())) {

      if (tktObjData.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false).length > 0) {

        if (this.isOConusLocation) {
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
      }
      else {
        this.markTicketComplete();
      }   


    }
    else {
      this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
    }
  }

  async btnDeclineClick(evt: Event) {
    this.route.navigate([this.isSplitPay ? '/rov/rsplitpay' : '/rov/rchekout']);
  }

  async btnCancelClick(evt: Event) {
    this.route.navigate([this.isSplitPay ? '/rov/rsplitpay' : '/rov/rchekout']);
  }

  private async markTicketComplete() {
    this._store.dispatch(markRovTendersComplete({ status: 4 }));
    this._store.dispatch(markRovTicketComplete({ status: 2 }));
    // Fetch the updated ticket object after marking complete
    const tktObjData1 = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
    if (tktObjData1 != null) {
      this._store.dispatch(saveCompleteRovTicketSplit({ tktObj: tktObjData1 }));
      this.route.navigate(['/rov/savetktsuccess']);
    }
    else {
      this.route.navigate(this.isSplitPay ? ['/rov/rsplitpay'] : ['/rov/rchekout']);
    }
  }

}
