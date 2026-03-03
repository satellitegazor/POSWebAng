import { AfterContentInit, Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getBalanceDue, getBalanceDueFC, getTktObjSelector, getRemainingBal, AmountUSDFC, getIsSplitPayR5 } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TenderStatusType, TicketTender, TranStatusType } from 'src/app/models/ticket.tender';
import { addPinpadResp, addTender, deleteDeclinedTender, markTendersComplete, markTicketComplete, saveCompleteTicketSplit, savePinpadResponse, saveTenderObj, saveTenderObjSuccess, saveTicketForGuestCheck, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { LocalStorageService } from 'src/app/global/local-storage.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TenderType, TenderTypeModel } from '../../../models/tender.type';
import { SalesTransactionCheckoutItem } from '../../../models/salesTransactionCheckoutItem';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { getLocCnfgIsAllowTipsSelector } from '../../store/locationconfigstore/locationconfig.selector';
import { combineLatest, filter, firstValueFrom, forkJoin, map, Observable, Subscription, take, Subject, takeUntil } from 'rxjs';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { UtilService } from 'src/app/services/util.service';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { Actions, ofType } from '@ngrx/effects';
import { Round2DecimalService } from 'src/app/services/round2-decimal.service';
import { RootObject } from 'src/app/app.state';
import { ToastService } from 'src/app/services/toast.service';
import { TenderUtil } from '../tender-util';
import { RedeemGiftCardTenders } from '../redeem-gift-card-tenders';
import { RedeeemGiftCardTndrsService } from '../redeeem-gift-card-tndrs.service';

@Component({
  selector: 'app-tender-page',
  templateUrl: './device-tndr-page.component.html',
  styleUrls: ['./device-tndr-page.component.css'],
  standalone: false
})
export class DeviceTndrPageComponent implements OnInit, AfterContentInit, OnDestroy {

  constructor(private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _cposWebSvc: CPOSWebSvcService,
    private _utilSvc: UtilService,
    private actions$: Actions,
    private _toastSvc: ToastService,
    private _redeemGiftCardTndrsSvc: RedeeemGiftCardTndrsService) {
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  public tenderAmountDC: number = 0;
  public tenderAmountNDC: number = 0;
  public dcCurrSymbl: string = '';
  public ndcCurrSymbl: string = '';
  private _tenderTypeCode: string = '';
  private _captureTranResponse: ExchCardTndr = new ExchCardTndr();
  private _tndrObj: TicketTender = new TicketTender();
  public isWaitingForPinpad: boolean = false;
  private InvoiceId: string = '';
  private _ticketTenderId: number = 0; // Store the generated tender ID from DB

  private subscription: Subscription = {} as Subscription;
  private destroy$ = new Subject<void>(); // Subject to manage subscription cleanup
  private authorizationInProgress: boolean = false; // Flag to prevent multiple authorization calls
  private isSplitPay: boolean = false;

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
        
        this.tenderAmountDC = parseFloat(parseFloat(params['tenderAmountDC']).toCPOSFixed(2))
        this.tenderAmountNDC = parseFloat(parseFloat(params['tenderAmountNDC']).toCPOSFixed(2));
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
      //this._tndrObj.tenderAmount = this.tenderAmountDC;
      //this._tndrObj.fcTenderAmount = this.tenderAmountNDC;

      this.getTransactionId(isRefund);

    });

  }

  private async getTransactionId(isRefund: boolean): Promise<number> {

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
        this.getAuthorization(isRefund);
      });
      return tktObjData.transactionID;
    }
    return 0;
  }

  private async getAuthorization(isRefund: boolean) {

    // Prevent multiple authorization calls
    if (this.authorizationInProgress) {
      console.warn('Authorization already in progress. Ignoring duplicate call.');
      return;
    }

    this.authorizationInProgress = true;
    this.isWaitingForPinpad = true;

    this._cposWebSvc.captureCardTran(this._tndrObj.rrn, this._tndrObj.rrn, (this.dcCurrSymbl == '$' ? this.tenderAmountDC : this.tenderAmountNDC), isRefund)
      .pipe(
        take(1), // Ensure only one response is processed
        takeUntil(this.destroy$) // Automatically unsubscribe when component is destroyed
      )
      .subscribe({
        next: async (data) => {
          this.isWaitingForPinpad = false;
          //console.log("Capture Card Transaction Response: ", data);
          if (data.rslt.IsSuccessful) {

            // Fetch the updated tender from store state that has ticketTenderId from DB
            var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
            if (tktObjData == null) {
              console.error('Unable to fetch ticket object');
              this.authorizationInProgress = false;
              return;
            }

            // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
            const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
            if (!savedTender) {
              console.error('Tender not found in state');
              this.authorizationInProgress = false;
              return;
            }

            // Copy the saved tender which already has ticketTenderId
            var tndrCopy = TenderUtil.copyTenderObj(savedTender);

            tndrCopy.rrn = this.InvoiceId;
            tndrCopy.isAuthorized = true;
            tndrCopy.authNbr = data.AUTH_CODE;
            tndrCopy.cardEndingNbr = data.FIRST6_LAST4;
            tndrCopy.traceId = "false";
            tndrCopy.tenderTypeDesc = "pinpad";
            tndrCopy.inStoreCardNbrTmp = data.ACCT_NUM;
            
            tndrCopy.tenderTypeCode = this.isDiscoverMilstarCard(data.FIRST6_LAST4) ? (isRefund? 'MR' : 'MS') : (isRefund? 'XR': 'XC');
            tndrCopy.tenderAmount = data.APPROVED_AMOUNT;
            tndrCopy.fcTenderAmount = parseFloat((this._logonDataSvc.getExchangeRate() * data.APPROVED_AMOUNT).toCPOSFixed(2));
            tndrCopy.tndMaintTimestamp = new Date(Date.now());
            tndrCopy.tndrTimeStamp = new Date(Date.now());
            tndrCopy.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;

            // ticketTenderId is already set from the saved tender

            this._captureTranResponse.copyFrom(data);
            this._captureTranResponse.RRN = this.InvoiceId;
            this._captureTranResponse.ticketTenderId = tndrCopy.ticketTenderId; // Use the tender's ID from state
            this._captureTranResponse.transactionId = tktObjData.transactionID;

            let defCurrCode = this._logonDataSvc.getDfltCurrCode();
            let dailyExchRate = this._logonDataSvc.getDailyExchRate();
            let isPaymentApproved = false;

            if (this._captureTranResponse.ResponseText.toUpperCase().includes("APPROVED") || this._captureTranResponse.ResponseText.toUpperCase().includes("APPROVAL")
              && this._captureTranResponse.APPROVED_AMOUNT > 0 ) {
              isPaymentApproved = true;
              tndrCopy.tenderStatus = TenderStatusType.InProgress;  
              tndrCopy.tenderAmount = this._captureTranResponse.APPROVED_AMOUNT;
              tndrCopy.fcTenderAmount = Number(Number(tndrCopy.tenderAmount * dailyExchRate.exchangeRate).toCPOSFixed(2));
            }
            else {
              tndrCopy.tenderStatus = TenderStatusType.Declined;
            }

            this._store.dispatch(addTender({ tndrObj: tndrCopy }));
            this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));

            if(!isPaymentApproved) {
              this._toastSvc.error('Payment was declined. Please try again or use a different payment method.');
              this.btnDecline(new Event('auto-decline'));
              this.authorizationInProgress = false;
              return;
            }

            // Use the pre-stored tender ID for the pinpad response
            this._store.dispatch(addPinpadResp({ respObj: this._captureTranResponse }));
            var tktObjData1 = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

            if (TenderUtil.IsTicketComplete(tktObjData1, this._logonDataSvc.getAllowPartPay())) {

              if(tktObjData1.ticketTenderList.filter(t => t.tenderTypeCode == 'GC' && t.isAuthorized == false).length > 0){
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
              }
              else {
                this.markTicketComplete();
              }              

              

              // this._store.dispatch(markTendersComplete({ status: TenderStatusType.Complete }));
              // this._store.dispatch(markTicketComplete({ status: TranStatusType.Complete }));

              // // Fetch the updated ticket object after marking status as complete
              // var tktObjDataUpdated = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

              // this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjDataUpdated }));
              // this.route.navigate(['/savetktsuccess']);
            }
            else {
              this._toastSvc.success('Split pay of ' + this.dcCurrSymbl + this.tenderAmountDC + ' Card transaction approved. Please select next tender method.');
              this.route.navigate(['/splitpay']);
            }
          } else {
            // Transaction was declined
            this._toastSvc.error(data.rslt.ReturnMsg || 'Transaction was declined. Please try again or use a different payment method.');
            this.btnDecline(new Event('auto-decline'));
          }

          this.authorizationInProgress = false;

        },
        error: (error) => {
          this.isWaitingForPinpad = false;
          this.authorizationInProgress = false;
          // Error occurred during pinpad interaction
          const errorMessage = error?.message || 'An error occurred during pinpad interaction. Please try again.';
          this._toastSvc.error(errorMessage);
          this.btnDecline(new Event('auto-decline'));
        }
      });
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
  /**
     * Creates a deep copy of the TicketTender object
     * @returns A new TicketTender instance with all properties copied
     */
  async btnApprove(evt: Event) {
    //console.log("btnApprove clicked");

    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderTypeCode;
    tndrObj.tenderAmount = this.tenderAmountDC;
    tndrObj.fcTenderAmount = this.tenderAmountNDC;
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

  async btnDecline(evt: Event) {

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;
    if (tktObjData == null) {
      console.error('Unable to fetch ticket object');
      this.authorizationInProgress = false;
      return;
    }

    // Get the saved tender from the ticket's tender list (it has ticketTenderId from DB)
    const savedTender = tktObjData.ticketTenderList.find(tndr => tndr.rrn === this.InvoiceId);
    if (!savedTender) {
      console.error('Tender not found in state');
      this.authorizationInProgress = false;
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

  // async getRemainingBalance() {

  //   const state: RootObject = await firstValueFrom(this._store.pipe(take(1))).then(state => state as RootObject);
  //   const tktObj = state.TktObjState.tktObj;

  //   let tenderTotal: number = 0;
  //   let tipTotal: number = 0;
  //   let tenderTotalFC: number = 0;
  //   let ticketTotal: number = 0;
  //   let ticketTotalFC: number = 0;
  //   let tipTotalFC: number = 0;

  //   tktObj.ticketTenderList.forEach(tndr => tenderTotal += parseFloat((tndr.tenderAmount).toCPOSFixed(2)));
  //   tktObj.tktList.forEach(itm => ticketTotal += parseFloat((itm.lineItemDollarDisplayAmount).toCPOSFixed(2)));
  //   tktObj.associateTips.forEach(tip => tipTotal += parseFloat((tip.tipAmount).toCPOSFixed(2)));

  //   tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += parseFloat((tndr.fcTenderAmount).toCPOSFixed(2)));
  //   tktObj.tktList.forEach(itm => ticketTotalFC += parseFloat((itm.dCLineItemDollarDisplayAmount).toCPOSFixed(2)));
  //   tktObj.associateTips.forEach(tip => tipTotalFC += parseFloat((tip.tipAmtLocCurr).toCPOSFixed(2)));

  //   if (tktObj.isPartialPay) {
  //     ticketTotal = tktObj.partialAmount;
  //     ticketTotalFC = tktObj.partialAmountFC;
  //   }

  //   this.tenderAmount = Round2DecimalService.round(ticketTotal + tipTotal - tenderTotal);
  //   this.tenderAmountFC = Round2DecimalService.round(ticketTotalFC + tipTotalFC - tenderTotalFC);
  //   return;
  // }

  private isDiscoverMilstarCard(FIRST6_LAST4: string): boolean {
    if (!FIRST6_LAST4 || FIRST6_LAST4.length < 6) {
      return false;
    }
    const firstSixDigits = FIRST6_LAST4.substring(0, 6);
    const discMilstarBinRange = this._logonDataSvc.getLocationConfig().discMilstarBinRange
    if(firstSixDigits.includes(discMilstarBinRange)) {
      return true;
    }
    return false;
  }

}
