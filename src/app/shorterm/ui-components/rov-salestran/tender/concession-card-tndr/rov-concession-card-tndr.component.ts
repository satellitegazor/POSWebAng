import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CPOSWebSvcService } from '../../../../../services-pinpad/cposweb-svc.service';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { RovLogonDataService } from "../../../../rov-logon-data.service"
import { ROV_POSTicketSplit } from '../../../../models/rticket.split';
import { filter, firstValueFrom, Subscription, take } from 'rxjs';
import { getRIsSplitPayR5, getRRemainingBal, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { TenderStatusType, TicketTender, TranStatusType } from '../../../../../models/ticket.tender';
import { TenderType } from '../../../../../longterm/models/tender.type';
import { addRovPinpadResp, addRovTender, deleteDeclinedRovTenderFromStore, markRovTendersComplete, markRovTicketComplete, saveCompleteRovTicketSplit, saveRovPinpadResponse, saveRovTenderObj, updateRovTenderRRN } from '../../../../store/ticketstore/rticket.action';
import { UtilService } from '../../../../../services-misc/util.service';
//import { VfoneCaptureTran } from '../../services/models/capture-tran.model';
import { forkJoin } from 'rxjs';
import { ExchCardTndr } from '../../../../../models/exch.card.tndr';
import { RovTenderUtil } from '../tender-util';
import { RovRedeemGiftCardTenders } from '../gc-redeem-services/rov-redeem-gift-card-tenders';
import { ToastService } from "../../../../../services-misc/toast.service";
import { CommonModule, DecimalPipe } from '@angular/common';
import { RovOConusRedeemGCWithPinPadService } from '../gc-redeem-services/rov-oconus-redeeem-gc-with-pin-pad';
import { ConusRedeemGCwithAurusAPI } from '../gc-redeem-services/conus-redeem-gc-with-aurus-api';
import { getTktObjSelector } from 'src/app/longterm/saletran/store/ticketstore/ticket.selector';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rov-concession-card-tndr',
  templateUrl: './rov-concession-card-tndr.component.html',
  styleUrls: ['./rov-concession-card-tndr.component.css'],
  imports: [DecimalPipe, CommonModule, FormsModule]  
})
export class RovConcessionCardTndrComponent implements AfterViewInit {

  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  isOConusLocation: boolean = false;
  private isSplitPay: boolean = false;

  constructor(
    private _store: Store<RovSaleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: RovLogonDataService,
    private _utilSvc: UtilService,
    private _cposWebSvc: CPOSWebSvcService,
    private _toastSvc: ToastService,
    private _oConusRedeemGCWithPinPad: RovOConusRedeemGCWithPinPadService,
    private _conusRedeemGCWithAurusAPI: ConusRedeemGCwithAurusAPI) {
    // Initialization logic can go here if needed
    this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
  }

  private _tktObj: ROV_POSTicketSplit = {} as ROV_POSTicketSplit;
  private subscription: Subscription = {} as Subscription;
  tenderAmountDC: number = 0;
  tenderAmountNDC: number = 0;
  private _tndrObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {


    if (typeof this._tndrObj === 'undefined' || this._tndrObj == null) {
      this._tndrObj = {} as TicketTender;
    }

    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) || '';
    if (this._logonDataSvc.getIsForeignCurr()) {
      this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode()) || '';
    }


    forkJoin([
      this._store.select(getRRemainingBal).pipe(take(1)),
      this._store.select(getRIsSplitPayR5).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, isSplitPay, params]) => {

      this._tndrObj.tenderTypeDesc = this._utilSvc.tenderCodeDescMap.get(this._tndrObj.tenderTypeCode) || 'Concession Credit Card';
      const hasQueryTenderAmount = params['tenderAmountDC'] !== undefined && params['tenderAmountDC'] !== null;

      if (hasQueryTenderAmount) {
        this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountDC']) : parseFloat(params['tenderAmountNDC']);
        this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountNDC']) : parseFloat(params['tenderAmountDC']);
        this.tenderAmountDC = parseFloat(params['tenderAmountDC']);
        this.tenderAmountNDC = parseFloat(params['tenderAmountNDC']);
      }

      this.isSplitPay = isSplitPay;
      if (!isSplitPay) {
        this._tndrObj.tenderAmount = tenderBal.amountUSD
        this._tndrObj.fcTenderAmount = tenderBal.amountFC;
        this.tenderAmountDC = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this.tenderAmountNDC = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;
      }
    });
    this._tndrObj.rrn = this._utilSvc.getUniqueRRN();
    this._tndrObj.tenderTypeCode = this._logonDataSvc.getTranIsRefund() ? 'RC' : 'CC';

    this._store.select(getRTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      this._tktObj = data;
    }).unsubscribe();

    //console.log("filling tender object with data ");
    this._tndrObj.tndMaintUserId = this._logonDataSvc.getRovEventConfig().individualUID.toString();
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderStatus = TenderStatusType.InProgress; // Assuming 1 is the
    this._tndrObj.fcCurrCode = this._logonDataSvc.getRovEventConfig().currCode;
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._tndrObj.ticketTenderId = -Date.now() % 10000;
    this._tndrObj.authNbr = '';

    let tndrCopy = JSON.parse(JSON.stringify(this._tndrObj))
    this._store.dispatch(addRovTender({ tndrObj: tndrCopy }));
    //this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));

  }

  ngAfterViewInit(): void { }
  ngOnDestroy(): void { }

  async btnApproveClick(evt: Event) {

    var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1))) || {} as ROV_POSTicketSplit;
    if (tktObjData == null) {
      console.error('Unable to fetch ticket object');
      return;
    }

    this._tndrObj = JSON.parse(JSON.stringify(tktObjData.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))

    console.log("btnApproveClick Tender Object before update: ", this._tndrObj);

    this._tndrObj.tenderStatus = TenderStatusType.Complete;
    this._tndrObj.isAuthorized = true;
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;

    let tndrCopy = JSON.parse(JSON.stringify(this._tndrObj))
    this._store.dispatch(addRovTender({ tndrObj: tndrCopy }));
    //this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));

    var tktObjData1 = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));

    if (tktObjData1 != null &&
      RovTenderUtil.IsTicketComplete(tktObjData1, this._logonDataSvc.getAllowPartPay())) {

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
      this.route.navigate(['/rov/rsavetktsuccess']);
    }
    else {
      this.route.navigate(this.isSplitPay ? ['/rov/rsplitpay'] : ['/rov/rchekout']);
    }
  }

  btnDeclineClick(evt: Event) {
    this.markAndDeleteTender(TenderStatusType.Declined);
    this.route.navigate(this.isSplitPay ? ['/rov/rsplitpay'] : ['/rov/rchekout']);
  }

  btnCancelClick(evt: Event) {
    this.markAndDeleteTender();
    this.route.navigate(this.isSplitPay ? ['/rov/rsplitpay'] : ['/rov/rchekout']);
  }

  async markAndDeleteTender(tndrStatus: TenderStatusType = TenderStatusType.Cancelled) {
    var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1))) || {} as ROV_POSTicketSplit;
    if (tktObjData == null) {
      console.error('Unable to fetch ticket object');
      return;
    }

    this._tndrObj = JSON.parse(JSON.stringify(tktObjData.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))

    this._tndrObj.tenderStatus = Number(tndrStatus);
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._store.dispatch(addRovTender({ tndrObj: JSON.parse(JSON.stringify(this._tndrObj)) }));
    this._store.dispatch(saveRovTenderObj({ tndrObj: JSON.parse(JSON.stringify(this._tndrObj)) }));
    this._store.dispatch(deleteDeclinedRovTenderFromStore({ rrn: this._tndrObj.rrn }));

  }
}
