import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ToastService } from 'src/app/services/toast.service';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { UtilService } from 'src/app/services/util.service';
import { Actions, ofType } from '@ngrx/effects';
import { getIsSplitPayR5, getRemainingBal, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { combineLatest, firstValueFrom, map, Subject, Subscription, take, takeUntil } from 'rxjs';
import { TicketSplit } from 'src/app/models/ticket.split';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { TenderStatusType, TicketTender, TranStatusType } from 'src/app/models/ticket.tender';
import { addTender, deleteDeclinedTender, isSplitPayR5, markTendersComplete, markTicketComplete, saveCompleteTicketSplit, saveTenderObj, saveTenderObjSuccess } from '../../store/ticketstore/ticket.action';
import { AurusGiftCardInquiryResp } from '../../services/models/gift-card-enquiry-response';
import { TenderUtil } from '../tender-util';
import { AurusGiftCardRedeemResp } from '../../services/models/aurus-gift-card-redeem-resp';
import { DecimalPipe } from '@angular/common';
import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
@Component({
  selector: 'app-gift-card-inquiry',
  imports: [DecimalPipe],
  templateUrl: './gift-card-inquiry.component.html',
  styleUrl: './gift-card-inquiry.component.css'
})
export class GiftCardInquiryComponent implements OnInit, AfterContentInit, OnDestroy {


  private isSplitPay: boolean = false;
  private subscription: Subscription = {} as Subscription;
  private destroy$ = new Subject<void>(); // Subject to manage subscription cleanup
  private authorizationInProgress: boolean = false; // Flag to prevent multiple authorization calls

  private _tktObj: TicketSplit = {} as TicketSplit;
  public tenderAmountDC: number = 0;
  public tenderAmountNDC: number = 0;
  public dcCurrSymbl: string = '';
  public ndcCurrSymbl: string = '';
  private _tenderTypeCode: string = '';
  private _gcInquiryResponse: AurusGiftCardInquiryResp = new AurusGiftCardInquiryResp();
  private tndrObj: TicketTender = new TicketTender();
  public isWaitingForPinpad: boolean = false;
  private InvoiceId: string = '';
  private _ticketTenderId: number = 0; // Store the generated tender ID from DB

  constructor(private _store: Store,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _cposWebSvc: CPOSWebSvcService,
    private _utilSvc: UtilService,
    private actions$: Actions,
    private _toastSvc: ToastService) { }

  ngOnInit(): void {
    this._store.select(getIsSplitPayR5).subscribe(flag => {
      this.isSplitPay = flag;
    }).unsubscribe();
  }
  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription && !this.subscription.closed) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterContentInit(): void {

    this._logonDataSvc.getLocationConfig().defaultCurrency;
    this.InvoiceId = this._utilSvc.getUniqueRRN();

    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) || '';
    if (this._logonDataSvc.getIsForeignCurr()) {
      this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode()) || '';
    }

    combineLatest([
      this._store.select(getRemainingBal).pipe(take(1)),
      this._store.select(getIsSplitPayR5).pipe(take(1)),
      this.activatedRoute.queryParams.pipe(take(1))
    ]).subscribe(([tenderBal, isSplitPay, queryParams]) => {

      if (!isSplitPay && tenderBal) {
        this.tenderAmountDC = tenderBal.amountDC;
        this.tenderAmountNDC = tenderBal.amountNDC;
        this.tndrObj.tenderAmount = tenderBal.amountDC;
        this.tndrObj.fcTenderAmount = tenderBal.amountNDC;
      } else {
        console.warn('Remaining balance not available yet');
        // fallback or retry
      }

      this._tenderTypeCode = queryParams['code'];

      const hasQueryTenderAmount = queryParams['tenderAmount'] !== undefined && queryParams['tenderAmount'] !== null;
      if (isSplitPay && hasQueryTenderAmount) {
        this.tndrObj.tenderAmount = parseFloat(queryParams['tenderAmount']);
        this.tndrObj.fcTenderAmount = parseFloat(queryParams['tenderAmountFC']);
        this.tenderAmountDC = parseFloat(queryParams['tenderAmount']);
        this.tenderAmountNDC = parseFloat(queryParams['tenderAmountFC']);

      }
      const isRefund = queryParams["IsRefund"] === "true";

      this.tndrObj.rrn = this.InvoiceId
      this.tndrObj.isAuthorized = false;
      this.tndrObj.tenderTypeDesc = "pinpad";
      this.tndrObj.traceId = "false";
      this.tndrObj.tenderStatus = TenderStatusType.InProgress;
      this.tndrObj.tndMaintTimestamp = new Date(Date.now());
      this.tndrObj.tndMaintUserId = this._logonDataSvc.getLTVendorLogonData().individualUID
      this.tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
      this.tndrObj.tenderTypeCode = this._tenderTypeCode;
      this.tndrObj.tenderAmount = this.tenderAmountDC;
      this.tndrObj.fcTenderAmount = this.tenderAmountNDC;

      this.getTransactionId(isRefund);

    });
  }

  async getTransactionId(isRefund: boolean) {
    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
    if (tktObjData != null) {
      this.tndrObj.tenderTransactionId = tktObjData.transactionID;
      this._store.dispatch(addTender({ tndrObj: this.tndrObj }));
      this._store.dispatch(saveTenderObj({ tndrObj: this.tndrObj }));

      // Subscribe to saveTenderObjSuccess to capture the generated ticketTenderId
      this.subscription = this.actions$.pipe(
        ofType(saveTenderObjSuccess),
        take(1),
        map(action => action.data.data.ticketTenderId)
      ).subscribe((tenderId) => {
        this._ticketTenderId = tenderId;
        // Update the original tender object with the ticketTenderId so it's available for all subsequent operations
        //this.tndrObj.ticketTenderId = tenderId;
        //console.log('Tender ID saved:', this._ticketTenderId);
        this.getGiftCardBalance();
      });
      return tktObjData.transactionID;
    }
    return 0;
  }
  
  private async getGiftCardBalance() {

    if (this.authorizationInProgress) {
      console.warn('Authorization already in progress. Ignoring duplicate call.');
      return;
    }

    this.authorizationInProgress = true;
    this.isWaitingForPinpad = true;

    this._cposWebSvc.giftCardInquiry(
      this.tndrObj.tenderTransactionId,
      this._ticketTenderId,
      Number(this._logonDataSvc.getLTVendorLogonData().individualUID),
      'Please swipe Gift Card',
      '')
      .pipe(
            take(1), // Ensure only one response is processed
            takeUntil(this.destroy$) // Automatically unsubscribe when component is destroyed
          )
    .subscribe({
      next: async (data: AurusGiftCardInquiryResp) => {
        this.isWaitingForPinpad = false;
        this.authorizationInProgress = false;
        if(data.rslt.IsSuccessful) {


          // Fetch the updated tender from store state that has ticketTenderId from DB
          var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
          if (tktObjData == null) {
            console.error('Unable to fetch ticket object');
            return;
          }

          // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
          const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
          if (!savedTender) {
            console.error('Tender not found in state');
            this.authorizationInProgress = false;
            return;
          }

          // Transaction was approved
          this._toastSvc.success('Gift Card Inquiry Successful. Balance Amount: ' + data.BalanceAmount.toFixed(2));
          var tndrCopy = TenderUtil.copyTenderObj(savedTender);

          tndrCopy.rrn = this.InvoiceId;
          tndrCopy.isAuthorized = false;
          tndrCopy.authNbr = data.ApprovalCode;
          tndrCopy.cardEndingNbr = data.CardNbrF6L4;
          tndrCopy.traceId = "false";
          tndrCopy.tenderTypeDesc = "pinpad";
          tndrCopy.inStoreCardNbrTmp = data.ACCT_NUM;
          tndrCopy.tracking = data.CardNbrF6L4;

          tndrCopy.tenderTypeCode = "GC";
          tndrCopy.tenderAmount = data.BalanceAmount >= this.tenderAmountDC ? this.tenderAmountDC : data.BalanceAmount;
          tndrCopy.fcTenderAmount = tndrCopy.tenderAmount * this._logonDataSvc.getExchangeRate();
          tndrCopy.tndMaintTimestamp = new Date(Date.now());
          tndrCopy.tndrTimeStamp = new Date(Date.now());
          tndrCopy.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;

          this._store.dispatch(addTender({ tndrObj: tndrCopy }));
          this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));

          this._toastSvc.success('Gift Card Tender Added Successfully.');
          var tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

          if (TenderUtil.IsTicketComplete(tktObjData1, this._logonDataSvc.getAllowPartPay())) {
            setTimeout(() => {
              this.giftCardRedeem(tndrCopy)
            }, 100);
          }
          else {
            this._store.dispatch(isSplitPayR5({ isSplitPayR5: true }));
            this.route.navigate(['/splitpay']);
          }
        }
        else {
          this._toastSvc.error('Gift Card Inquiry Failed: ' + data.rslt.ReturnMsg + '.<br/>Please use another tender method.');
          this.route.navigate(['/splitpay']);
          this.btnDeclineClick(new PointerEvent('auto-decline'));
        }
   
      }
    });
  }

  private async giftCardRedeem(gcTndr: TicketTender) {

    this._cposWebSvc.GiftCardRedeem(
      this.tndrObj.tenderTransactionId,
      this._ticketTenderId,
      Number(this._logonDataSvc.getLTVendorLogonData().individualUID),
      gcTndr.inStoreCardNbrTmp,
      gcTndr.tenderAmount)
      .pipe(
        take(1), // Ensure only one response is processed
        takeUntil(this.destroy$) // Automatically unsubscribe when component is destroyed
      )
      .subscribe({
        next: async (data: AurusGiftCardRedeemResp) => {
          if (data.rslt.IsSuccessful) {
            this._toastSvc.success('Gift Card Redeem Successful.');

            var tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
            if (data.ResponseText.toUpperCase().includes("APPROVED") || data.ResponseText.toUpperCase().includes("APPROVAL")
              && data.AuthorizedAmount > 0) {

                if(data.AuthorizedAmount < gcTndr.tenderAmount) {
                  this._toastSvc.warning('Gift Card Redeem Amount is less than Tender Amount. Please use another tender method for remaining balance.');
                  let tndrCopy = TenderUtil.copyTenderObj(gcTndr);
                  tndrCopy.isAuthorized = true;
                  tndrCopy.authNbr = data.ApprovalCode;
                  tndrCopy.cardEndingNbr = data.CardEndingNbr;
                  tndrCopy.traceId = "false";
                  tndrCopy.tenderAmount = data.AuthorizedAmount;
                  tndrCopy.fcTenderAmount = data.AuthorizedAmount * this._logonDataSvc.getExchangeRate();
                  this._store.dispatch(addTender({ tndrObj: tndrCopy }));
                  this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
                  this.route.navigate(['/splitpay']);
                  return;
                }
                else {
                  let tndrCopy = TenderUtil.copyTenderObj(gcTndr);
                  tndrCopy.isAuthorized = true;
                  tndrCopy.authNbr = data.ApprovalCode;
                  tndrCopy.cardEndingNbr = data.CardEndingNbr;
                  tndrCopy.traceId = "false";
                  tndrCopy.tenderTypeDesc = "pinpad";
                  tndrCopy.tenderStatus = TenderStatusType.Complete; 
                  tndrCopy.tndMaintTimestamp = new Date(Date.now());
                  tndrCopy.tndrTimeStamp = new Date(Date.now());
                  
                  this._store.dispatch(addTender({ tndrObj: tndrCopy }));
                  this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
                  this._store.dispatch(markTendersComplete({ status: TenderStatusType.Complete }));
                  this._store.dispatch(markTicketComplete({ status: TranStatusType.Complete }));
                  var tktObjDataUpdated = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

                  this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjDataUpdated }));
                  this.route.navigate(['/savetktsuccess']);
                  return;
                }            
              }
            else {
              this._toastSvc.error('Gift Card Redeem Failed: ' + data.rslt.ReturnMsg + '.<br/>Please use another tender method.');

              let tndrCopy = TenderUtil.copyTenderObj(gcTndr);
              tndrCopy.isAuthorized = false;
              tndrCopy.tenderStatus = TenderStatusType.Declined;
              this._store.dispatch(addTender({ tndrObj: tndrCopy }));
              this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
              this._store.dispatch(deleteDeclinedTender({ rrn: this.InvoiceId }));

              this.route.navigate(['/splitpay']);
              this.btnDeclineClick(new PointerEvent('auto-decline'));
            }
          }
        }
      });
  }

  async btnDeclineClick($event: PointerEvent) {

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
    if (tktObjData == null) {
      console.error('Unable to fetch ticket object');
      this.authorizationInProgress = false;
      this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
      return;
    }

    // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
    const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
    if (!savedTender) {
      console.error('Tender not found in state');
      this.authorizationInProgress = false; 
      this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
      return;
    }

    // Copy the saved tender which already has ticketTenderId
    var tndrCopy = TenderUtil.copyTenderObj(savedTender);

    tndrCopy.tenderStatus = TenderStatusType.Declined;
    this._store.dispatch(addTender({ tndrObj: tndrCopy }));
    this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
    this._store.dispatch(deleteDeclinedTender({ rrn: this.InvoiceId }));

    this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
  }


  btnApproveClick($event: PointerEvent) {
    throw new Error('Method not implemented.');
  }

}
