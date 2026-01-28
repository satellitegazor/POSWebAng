import { AfterContentInit, Component, OnInit, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getBalanceDue, getBalanceDueFC, getTktObjSelector, getRemainingBal, AmountDCNDC, getIsSplitPayR5 } from '../../store/ticketstore/ticket.selector';
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

@Component({
  selector: 'app-tender-page',
  templateUrl: './device-tndr-page.component.html',
  styleUrls: ['./device-tndr-page.component.css'],
  standalone: false
})
export class DeviceTndrPageComponent implements OnInit, AfterContentInit, OnDestroy {

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
    ]).subscribe(([tenderBal, isSplitPay, queryParams]) => {

      if (!isSplitPay && tenderBal) {
        this.tenderAmount = tenderBal.amountDC;
        this.tenderAmountFC = tenderBal.amountNDC;
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
        this.tenderAmount = parseFloat(queryParams['tenderAmount']);
        this.tenderAmountFC = parseFloat(queryParams['tenderAmountFC']);

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
      this.tndrObj.tenderAmount = this.tenderAmount;
      this.tndrObj.fcTenderAmount = this.tenderAmountFC;

      this.getTransactionId(isRefund);

    });

  }

  private async getTransactionId(isRefund: boolean): Promise<number> {

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

    this._cposWebSvc.captureCardTran(this.tndrObj.rrn, this.tndrObj.rrn, this.tenderAmount, isRefund)
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
            tndrCopy.tenderAmount = this.tenderAmount;
            tndrCopy.fcTenderAmount = this.tenderAmountFC;
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
              tndrCopy.fcTenderAmount = Number(Number(tndrCopy.tenderAmount * dailyExchRate.exchangeRate).toFixed(2));
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

              this._store.dispatch(markTendersComplete({ status: TenderStatusType.Complete }));
              this._store.dispatch(markTicketComplete({ status: TranStatusType.Complete }));

              // Fetch the updated ticket object after marking status as complete
              var tktObjDataUpdated = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1))) || {} as TicketSplit;

              this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjDataUpdated }));
              this.route.navigate(['/savetktsuccess']);
            }
            else {
              this._toastSvc.success('Split pay of ' + this.dcCurrSymbl + this.tenderAmount + ' Card transaction approved. Please select next tender method.');
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

  /**
     * Creates a deep copy of the TicketTender object
     * @returns A new TicketTender instance with all properties copied
     */
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

  private isDiscoverMilstarCard(FIRST6_LAST4: string): boolean {
    if (!FIRST6_LAST4 || FIRST6_LAST4.length < 6) {
      return false;
    }
    const firstSixDigits = FIRST6_LAST4.substring(0, 6);
    if(firstSixDigits == '650155') {
      return true;
    }
    return false;
  }

}
