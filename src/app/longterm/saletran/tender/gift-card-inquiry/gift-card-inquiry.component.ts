import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { ToastService } from 'src/app/services/toast.service';
import { CPOSWebSvcService } from '../../../services/cposweb-svc.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { UtilService } from 'src/app/services/util.service';
import { Actions, ofType } from '@ngrx/effects';
import { getIsSplitPayR5, getRemainingBal, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { combineLatest, filter, firstValueFrom, map, Subject, Subscription, take, takeUntil } from 'rxjs';
import { TicketSplit } from 'src/app/models/ticket.split';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { TenderStatusType, TicketTender, TranStatusType } from 'src/app/models/ticket.tender';
import { addTender, deleteDeclinedTenderFromStore, isSplitPayR5, markTendersComplete, markTicketComplete, saveCompleteTicketSplit, saveTenderObj, saveTenderObjFailed, saveTenderObjSuccess } from '../../store/ticketstore/ticket.action';
import { AurusGiftCardInquiryResp } from '../../services/models/gift-card-enquiry-response';
import { TenderUtil } from '../tender-util';
import { AurusGiftCardRedeemResp, GCRedeemInput } from '../../services/models/aurus-gift-card-redeem-resp';
import { OConusRedeemGCWithPinPadService } from '../gc-redeem-services/oconus-redeeem-gc-with-pin-pad';
import { ConusRedeemGCwithAurusAPI } from '../gc-redeem-services/conus-redeem-gc-with-aurus-api';
import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { PosApiService, Conus_GC_Balance_Model } from '../../../services/pos-api-service';
import { GlobalConstants } from 'src/app/global/global.constants';
@Component({
  selector: 'app-gift-card-inquiry',
  templateUrl: './gift-card-inquiry.component.html',
  styleUrl: './gift-card-inquiry.component.css',
  standalone: false,
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
  private _gcBalanceDetails: Conus_GC_Balance_Model | null = null;
  private _tndrObj: TicketTender = new TicketTender();
  public isWaitingForPinpad: boolean = false;
  private InvoiceId: string = '';
  private _ticketTenderId: number = -Date.now() % 10000; // Store the generated tender ID from DB
  isOConusLocation: boolean = false;


  constructor(private _store: Store,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _cposWebSvc: CPOSWebSvcService,
    private _utilSvc: UtilService,
    private actions$: Actions,
    private _toastSvc: ToastService,
    private _redeemGiftCardTndrsSvc: OConusRedeemGCWithPinPadService,
    private _conusRedeemGCWithAurusAPI: ConusRedeemGCwithAurusAPI,
    private _salesTranSvc: PosApiService) { 
      this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
    }

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
    ]).subscribe(([tenderBal, isSplitPay, params]) => {

      if (!isSplitPay && tenderBal) {
        this.tenderAmountDC = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this.tenderAmountNDC = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;
        this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? tenderBal.amountUSD : tenderBal.amountFC;
        this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? tenderBal.amountFC : tenderBal.amountUSD;
      } else {
        console.warn('Remaining balance not available yet');
        // fallback or retry
      }

      this._tenderTypeCode = params['code'];

      const hasQueryTenderAmount = params['tenderAmountDC'] !== undefined && params['tenderAmountDC'] !== null;
      if (isSplitPay && hasQueryTenderAmount) {
        this._tndrObj.tenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountDC']) : parseFloat(params['tenderAmountNDC']);
        this._tndrObj.fcTenderAmount = this.dcCurrSymbl == '$' ? parseFloat(params['tenderAmountNDC']) : parseFloat(params['tenderAmountDC']);
        this.tenderAmountDC = this.dcCurrSymbl == '$' ? this._tndrObj.tenderAmount : this._tndrObj.fcTenderAmount;
        this.tenderAmountNDC = this.dcCurrSymbl == '$' ? this._tndrObj.fcTenderAmount : this._tndrObj.tenderAmount;
      }
      const isRefund = params["IsRefund"] === "true";

      this._tndrObj.rrn = this.InvoiceId
      this._tndrObj.isAuthorized = false;
      this._tndrObj.tenderTypeDesc = "pinpad";
      this._tndrObj.traceId = "false";
      this._tndrObj.tenderStatus = TenderStatusType.InProgress;
      this._tndrObj.tndMaintTimestamp = new Date(Date.now());
      this._tndrObj.tndMaintUserId = this._logonDataSvc.getLTVendorLogonData().individualUID
      this._tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
      this._tndrObj.tenderTypeCode = this._tenderTypeCode;

      this.getTransactionId(isRefund);

    });
  }

  async getTransactionId(isRefund: boolean) {
    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
    if (tktObjData != null) {
      this._tndrObj.tenderTransactionId = tktObjData.transactionID;
      this._store.dispatch(addTender({ tndrObj: this._tndrObj }));
      this._store.dispatch(saveTenderObj({ tndrObj: this._tndrObj }));

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
        if (this.isOConusLocation) {
          this.getGiftCardBalance();
        }
        else {
          this.getMSRCardData();

        }
      });
      return tktObjData.transactionID;
    }
    return 0;
  }

  private async getMSRCardData() {
      if (this.authorizationInProgress) {
        console.warn('Authorization already in progress. Ignoring duplicate call.');
        return;
      }

      this.authorizationInProgress = true;
      this.isWaitingForPinpad = true;
      this._cposWebSvc.captureMsrSwipe('Please swipe card')
        .pipe(
          take(1), // Ensure only one response is processed
          takeUntil(this.destroy$) // Automatically unsubscribe when component is destroyed
        )
        .subscribe({
          next: async (data) => {
            this.isWaitingForPinpad = false;
            this.authorizationInProgress = false;
            // Fetch the updated tender from store state that has ticketTenderId from DB
            var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
            if (tktObjData == null) {
              console.error('Unable to fetch ticket object');
              this.route.navigate(['/splitpay']);
              return;
            }

            // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
            const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
            if (!savedTender) {
              console.error('Tender not found in state');
              this.authorizationInProgress = false;
              this.route.navigate(['/splitpay']);
              return;
            }

            const duplicateTndr = tktObjData.ticketTenderList.find(tndr => tndr.cardEndingNbr === data.CardEndingNbr);
            if (duplicateTndr) {
              // The in-progress tender created for this inquiry must be explicitly cancelled.
              // We persist the cancellation first so DB and client state remain consistent.
              const cancelledTender = TenderUtil.copyTenderObj(savedTender);
              cancelledTender.tenderStatus = TenderStatusType.Cancelled;
              cancelledTender.tndMaintTimestamp = new Date(Date.now());

              this._store.dispatch(saveTenderObj({ tndrObj: cancelledTender }));

              // Wait for save result before mutating local store entry.
              const saveResult = await firstValueFrom(
                this.actions$.pipe(
                  ofType(saveTenderObjSuccess, saveTenderObjFailed),
                  filter(action => !('data' in action) || !action.data?.data?.rrn || action.data.data.rrn === cancelledTender.rrn),
                  take(1)
                )
              );

              // Remove only after successful persistence so refresh/load does not resurrect it.
              if (saveResult.type === saveTenderObjSuccess.type) {
                this._store.dispatch(deleteDeclinedTenderFromStore({ rrn: cancelledTender.rrn }));
              }

              this._toastSvc.warning('This gift card "' + data.CardEndingNbr + '" has already been used for payment. Please use another gift card or tender method.');
              this.authorizationInProgress = false;
              this.route.navigate(['/splitpay']);
              return;
            }
            // Handle the MSR card data here
            if(data.rslt.IsSuccessful) {

              let gcTender = TenderUtil.copyTenderObj(savedTender);
              gcTender.cardEndingNbr = data.CardEndingNbr;
              gcTender.inStoreCardNbrTmp = data.AcctNumFIPS;
              gcTender.tracking = data.AcctNumFIPS;
              gcTender.gcExpiryMonth = data.CardExpiryMonth;
              gcTender.gcExpiryYear = data.CardExpiryYear;

              this._store.dispatch(addTender({ tndrObj: gcTender }))
              this._store.dispatch(saveTenderObj({ tndrObj: gcTender }));

              this.getGiftCardBalanceForConus(gcTender);
            }
          },
          error: (err) => {
            this.isWaitingForPinpad = false;
            this.authorizationInProgress = false;
            console.error('Error capturing MSR swipe:', err);
          }
        });

  }
  
  private async getGiftCardBalance() {

    if (this.authorizationInProgress) {
      console.warn('Authorization already in progress. Ignoring duplicate call.');
      return;
    }

    this.authorizationInProgress = true;
    this.isWaitingForPinpad = true;

    this._cposWebSvc.giftCardInquiryPinpad(
      this._tndrObj.tenderTransactionId,
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
            this.route.navigate(['/splitpay']);
            return;
          }

          // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
          const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
          if (!savedTender) {
            console.error('Tender not found in state');
            this.authorizationInProgress = false;
            this.route.navigate(['/splitpay']);
            return;
          }

          const duplicateTndr = tktObjData.ticketTenderList.find(tndr => tndr.cardEndingNbr === data.CardNbrF6L4);
          if(duplicateTndr) {
            // The in-progress tender created for this inquiry must be explicitly cancelled.
            // We persist the cancellation first so DB and client state remain consistent.
            const cancelledTender = TenderUtil.copyTenderObj(savedTender);
            cancelledTender.tenderStatus = TenderStatusType.Cancelled;
            cancelledTender.tndMaintTimestamp = new Date(Date.now());

            this._store.dispatch(saveTenderObj({ tndrObj: cancelledTender }));

            // Wait for save result before mutating local store entry.
            const saveResult = await firstValueFrom(
              this.actions$.pipe(
                ofType(saveTenderObjSuccess, saveTenderObjFailed),
                filter(action => !('data' in action) || !action.data?.data?.rrn || action.data.data.rrn === cancelledTender.rrn),
                take(1)
              )
            );

            // Remove only after successful persistence so refresh/load does not resurrect it.
            if (saveResult.type === saveTenderObjSuccess.type) {
              this._store.dispatch(deleteDeclinedTenderFromStore({ rrn: cancelledTender.rrn }));
            }

            this._toastSvc.warning('This gift card "' + data.CardNbrF6L4 + '" has already been used for payment. Please use another gift card or tender method.');
            this.authorizationInProgress = false;
            this.route.navigate(['/splitpay']);
            return;
          }

          // Transaction was approved
          this._toastSvc.success('Gift Card Inquiry Successful. Balance Amount: ' + data.BalanceAmount.toCPOSFixed(2));
          var tndrCopy = TenderUtil.copyTenderObj(savedTender);

          tndrCopy.rrn = this.InvoiceId;
          tndrCopy.isAuthorized = false;
          tndrCopy.authNbr = '';
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

          //this._toastSvc.success('Gift Card Tender Added Successfully.');
          var tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

          if (TenderUtil.IsTicketComplete(tktObjData1, this._logonDataSvc.getAllowPartPay())) {
            if (tktObjData1.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false).length > 0) {
              // Redeem Gift Card Tenders
              this._redeemGiftCardTndrsSvc.redeem(tktObjData1.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false)).subscribe({
                next: () => {
                  this.markTicketComplete();
                  return true;
                },
                error: (error) => {
                  console.error('Error during gift card redemption: ', error);
                  this._toastSvc.error('Gift Card Redemption Failed: ' + error.message + '.<br/>Please complete the transaction using another tender method.');
                  this.route.navigate(['/splitpay']);
                  return false;
                }
              });
            }
            else {
              this.markTicketComplete();
            }
          }
          else {
            this._store.dispatch(isSplitPayR5({ isSplitPayR5: true }));
            this.route.navigate(['/splitpay']);
          }
        }
        else {
          this._toastSvc.error('Gift Card Inquiry Failed: ' + data.rslt.ReturnMsg + '.<br/>Please use another tender method.');
          this.route.navigate(['/splitpay']);
          this.btnCancelClick(new PointerEvent('auto-decline'));
        }
      }
    });
  }

  regionCodeMap = new Map<string, number>([
    ['CON', 0],
    ['OCONE', 1],
    ['OCONP', 2],
  ]);

  getGiftCardBalanceForConus(gcTender: TicketTender): void {
    if (this.authorizationInProgress) {
      console.warn('Authorization already in progress. Ignoring duplicate call.');
      return;
    }

    this.authorizationInProgress = true;
    this.isWaitingForPinpad = true;

    const guid = GlobalConstants.POST_GUID;
    const uid = this._logonDataSvc.getLTVendorLogonData().individualUID;
    const facilityNumber = this._logonDataSvc.getLTVendorLogonData().facilityNumber;

    this._salesTranSvc.aurusGiftCardInquiryForConus(
      guid,
      uid,
      facilityNumber,
      this.tenderAmountDC,
      gcTender.inStoreCardNbrTmp,
      gcTender.gcExpiryYear,
      gcTender.gcExpiryMonth,
      gcTender.ticketTenderId,
      gcTender.tenderTransactionId,
      this.regionCodeMap.get(sessionStorage.getItem('rgnCode') || 'CON') || 0,
      2)
      .pipe(
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: async (data: Conus_GC_Balance_Model) => {
          this.isWaitingForPinpad = false;
          this.authorizationInProgress = false;
          this._gcBalanceDetails = data;

          if(data.results.success) {

          var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
          if (tktObjData == null) {
            console.error('Unable to fetch ticket object');
            this.route.navigate(['/splitpay']);
            return;
          }

          // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
          const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
          if (!savedTender) {
            console.error('Tender not found in state');
            this.authorizationInProgress = false;
            this.route.navigate(['/splitpay']);
            return;
          }
          // Transaction was approved
          this._toastSvc.success('Gift Card Inquiry Successful. Balance Amount: ' + data.balance.toCPOSFixed(2));
          var tndrCopy = TenderUtil.copyTenderObj(savedTender);

          tndrCopy.rrn = this.InvoiceId;
          if(data.balance < tndrCopy.tenderAmount) {
            tndrCopy.tenderAmount = data.balance;
          }
          tndrCopy.fcTenderAmount = tndrCopy.tenderAmount * this._logonDataSvc.getExchangeRate();
          tndrCopy.tndMaintTimestamp = new Date(Date.now());
          tndrCopy.tndrTimeStamp = new Date(Date.now());
          tndrCopy.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
          tndrCopy.gcExpiryYear = gcTender.gcExpiryYear;
          tndrCopy.gcExpiryMonth = gcTender.gcExpiryMonth;

          this._store.dispatch(addTender({ tndrObj: tndrCopy }));
          this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));

          //this._toastSvc.success('Gift Card Tender Added Successfully.');
          var tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

          if (TenderUtil.IsTicketComplete(tktObjData1, this._logonDataSvc.getAllowPartPay())) {
            const yetToRedeemGCTenders = tktObjData1.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false);
            if (yetToRedeemGCTenders.length > 0) {
              this._conusRedeemGCWithAurusAPI.redeem(yetToRedeemGCTenders).subscribe({
                next: () => {
                this.markTicketComplete();
                  return true;
                },
                error: (error) => {
                  console.error('Error during gift card redemption: ', error);
                  this._toastSvc.error('Gift Card Inquiry Failed: ' + error.message + '.<br/>Please complete the transaction using another tender method.');
                  this.route.navigate(['/splitpay']);
                  return false;
                }
              });
            }
            else {
              this.markTicketComplete();
            }
          }
          else {
            this._store.dispatch(isSplitPayR5({ isSplitPayR5: true }));
            this.route.navigate(['/splitpay']);
          }
          }
          else {
            this._toastSvc.error('Gift Card Inquiry Failed: ' + data.results.returnMsg + '.<br/>Please complete the transaction using another tender method.');
            this.route.navigate(['/splitpay']);
          }
        },
        error: (error) => {
          this.isWaitingForPinpad = false;
          this.authorizationInProgress = false;
          console.error('Gift Card Inquiry API failed:', error);
          this._toastSvc.error('Gift Card Inquiry API call failed. Please try again.');
        }
      });
  }

  private async markTicketComplete() {
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

  private async giftCardRedeem(gcTndr: TicketTender) {

    this._cposWebSvc.GiftCardRedeem(new GCRedeemInput(gcTndr.tenderTransactionId,
          gcTndr.ticketTenderId,
          Number(gcTndr.tndMaintUserId),
          gcTndr.inStoreCardNbrTmp,
          gcTndr.tenderAmount))
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
              this._store.dispatch(deleteDeclinedTenderFromStore({ rrn: this.InvoiceId }));

              this.route.navigate(['/splitpay']);
              this.btnCancelClick(new PointerEvent('auto-decline'));
            }
          }
        }
      });
  }

  async btnCancelClick($event: PointerEvent) {

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
    this._store.dispatch(deleteDeclinedTenderFromStore({ rrn: this.InvoiceId }));

    this.route.navigate(this.isSplitPay ? ['/splitpay'] : ['/checkout']);
  }
}
