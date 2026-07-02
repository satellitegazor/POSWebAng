import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TenderStatusType, TicketTender, TranStatusType } from '../../../../../models/ticket.tender';
import { getRBalanceDue, getRTktObjSelector, getRTicketTendersSelector, getRBalanceDueFC, getRTicketTotalToPayUSD, getRTicketTotalToPayFC } from '../../../../store/ticketstore/rticket.selector';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { PosApiService } from '../../../../../longterm/services/pos-api-service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from '../../../../../global/logon-data-service.service';
import { SharedSubjectService } from '../../../../../shared-subject/shared-subject.service';
import { TenderType, TenderTypeModel } from '../../../../../longterm/models/tender.type';
import { filter, firstValueFrom, forkJoin, Subscription, take } from 'rxjs';
import { updateRovCheckoutTotals, addRovTender, saveRovTicketForGuestCheck, saveRovTicketForGuestCheckSuccess, saveRovTicketForGuestCheckFailed, removeRovTndrWithSaveCode, saveRovTenderObj, saveCompleteRovTicketSplit, markRovTendersComplete, markRovTicketComplete, saveRovTenderObjSuccess, saveRovTenderObjFailed, resetRovTktObj } from '../../../../store/ticketstore/rticket.action';
import { AlertModalComponent } from '../../../../../alert-modal/alert-modal.component';
import { UtilService } from '../../../../../services-misc/util.service';
import { CPOSWebSvcService } from '../../../../../services-pinpad/cposweb-svc.service';
import { RovTenderUtil } from '../tender-util';
import { RovRedeemGiftCardTenders } from '../gc-redeem-services/rov-redeem-gift-card-tenders';
import { ToastService } from '../../../../../services-misc/toast.service';
import { ROV_POSTicketSplit } from '../../../../models/rticket.split';
import { RovOConusRedeemGCWithPinPadService } from '../gc-redeem-services/rov-oconus-redeeem-gc-with-pin-pad';
import { MilstarRefundReqData } from '../../../../../services-pinpad/models/milstar-refund-req-data';
import { VoidTranInput } from '../../../../../services-pinpad/models/void-tran-input';
import { VfoneCaptureTran } from '../../../../../services-pinpad/models/capture-tran.model';
import { RovLogonDataService } from '../../../../rov-logon-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PosCurrencyDirective } from "../../../../../directives/pos-currency.directive"

@Component({
  selector: 'app-rov-split-pay',
  templateUrl: './rov-split-pay.component.html',
  styleUrls: ['./rov-split-pay.component.css'],
  imports: [AlertModalComponent, CommonModule, FormsModule, ReactiveFormsModule, PosCurrencyDirective]
})
export class RovSplitPayComponent implements OnInit, AfterViewInit {
  @ViewChild('dcTndrAmt') dcTndrAmtInput!: ElementRef;
  @ViewChild('voidPaymentsConfirmDialog') voidPaymentsConfirmDialog!: TemplateRef<unknown>;

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;
  yetToPayDC: any;
  yetToPayNDC: any;

  private _clickDebounceMs: number = 2000; // 2 second debounce window
  private _lastClickTime: number = 0;
  private _confirmModalRef: NgbModalRef | null = null;

  splitPayMsg: string = 'Enter the amount you want to pay in the input fields below. You can enter any amount less than or equal to the total payment amount. After entering the split amount, select the appropriate payment method button to proceed.';
  
  // ...existing code...

  isVoidingPayments: boolean = false;
  voidRefundProgressMessage: string = '';

  private _isClickAllowed(): boolean {
    const now = Date.now();
    if (now - this._lastClickTime >= this._clickDebounceMs) {
      this._lastClickTime = now;
      return true;
    }
    return false;
  }


  constructor(private _saleTranSvc: PosApiService,
    private _logonDataSvc: RovLogonDataService,
    private _sharedSubSvc: SharedSubjectService,
    private modalService: NgbModal,
    private _store: Store<RovSaleTranDataInterface>,
    private actions$: Actions,
    private router: Router,
    private activRoute: ActivatedRoute,
    private _utlSvc: UtilService,
    private _cposWebSvc: CPOSWebSvcService,
    private _toastSvc: ToastService,
    private _redeemGiftCardTndrsSvc: RovOConusRedeemGCWithPinPadService) { }

  tndrs: TicketTender[] = [];
  totalToPayDC: number = 0;
  totalToPayNDC: number = 0;
  defaultCurrCode: string = 'USD';
  nonDefaultCurrCode: string = 'EUR';
  private routeSubscription: Subscription = {} as Subscription;
  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  isOConusLocation: boolean = false;

  tenderDescrition (tndrCode: string): string {
    return this._utlSvc.tenderCodeDescMap.get(tndrCode) || '';
  }

  async ngOnInit(): Promise<void> {

    //console.log('SplitPay component ngOnInit called');
    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();
    this.dcCurrSymbl = this._utlSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode());
    this.ndcCurrSymbl = this._utlSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode());
    this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();

    this.tenderButtonUIDisplay();

    this.routeSubscription = this.activRoute.paramMap.subscribe(params => {
      const id = params.get('id');
    });

    let paidSoFarDC: number = 0;
    let paidSoFarNDC: number = 0;

    forkJoin([
      this._store.select(getRTicketTotalToPayUSD).pipe(take(1)),
      this._store.select(getRTicketTotalToPayFC).pipe(take(1)),
      this._store.select(getRTicketTendersSelector).pipe(take(1))
    ]).subscribe(([totalUSD, totalFC, tndrs]) => {

      this.totalToPayDC = this.dcCurrSymbl == '$' ? totalUSD : totalFC;
      this.totalToPayNDC = this.dcCurrSymbl == '$' ? totalFC : totalUSD;
      this.tndrs = tndrs?.filter(t => t.tenderTypeCode != 'SV') || [] as TicketTender[];

      this.tndrs.forEach(t => {
        paidSoFarDC += Number(Number(this.dcCurrSymbl == '$' ? t.tenderAmount : t.fcTenderAmount).toCPOSFixed(2));
        paidSoFarNDC += Number(Number(this.dcCurrSymbl != '$' ? t.tenderAmount : t.fcTenderAmount).toCPOSFixed(2));
      });

      this.yetToPayDC = Number(Number(this.totalToPayDC - paidSoFarDC).toCPOSFixed(2));
      this.yetToPayNDC = Number(Number(this.totalToPayNDC - paidSoFarNDC).toCPOSFixed(2));

      if (this.yetToPayDC < 0) {
        this.yetToPayDC = 0;        
        this.checkIfTendersComplete();        
        
      }
    });

    this.defaultCurrCode = this._logonDataSvc.getDfltCurrCode();
    this.nonDefaultCurrCode = this._logonDataSvc.getNonDfltCurrCode();
  }

  async saveCompleteTicketSplit() {
    this._store.dispatch(markRovTendersComplete({ status: TenderStatusType.Complete }));
    this._store.dispatch(markRovTicketComplete({ status: TranStatusType.Complete }));
    var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
    if (tktObjData != null) {
      this._store.dispatch(saveCompleteRovTicketSplit({ tktObj: tktObjData }));
      this.router.navigate(['/rov/savetktsuccess']);
    }
  }

  checkIfTendersComplete(): boolean {

    if (this.yetToPayDC <= 0) {
      if (this.tndrs.filter(t => t.tenderTypeCode == "GC" && t.isAuthorized == false).length > 0) {

        let unRedemedGCTndrs = this.tndrs.filter(t => t.tenderTypeCode == "GC" && t.isAuthorized == false);
        // Redeem Gift Card Tenders
        this._redeemGiftCardTndrsSvc.redeem(unRedemedGCTndrs).subscribe({
 
          next: () => {
            this.saveCompleteTicketSplit();
            return true;
          },
          error: (error) => {
            console.error('Error during gift card redemption: ', error);
            return false;
          }
        });
        return true;
      }
      else {
        return true;
      }

    }
    else {
      return true;
    }
  }

  ngAfterViewInit(): void {
    // Focus on dcTndrAmt input after component rendering is complete
    if (this.dcTndrAmtInput) {
      this.dcTndrAmtInput.nativeElement.focus();
    }
  }

  private blurActiveElement(): void {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
  }

  public tenderButtonUIDisplay(): void {

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr) => tndr.isRefundType == false);
    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length); // +1 for split pay button
  }

  PaymentAmountChanged(evt: any) {

    ////console.log('SplitPay component TipAmountChanged called with event:', evt);
    if (Number(Number(evt.target.value).toCPOSFixed(2)) > this.totalToPayDC) {
      evt.target.value = Number(Number(this.totalToPayDC).toCPOSFixed(2));
      this.blurActiveElement();
      const modalRef = this.modalService.open(AlertModalComponent, this.modalOptions);
      modalRef.componentInstance.title = 'Tender Amount Exceeds Total';
      modalRef.componentInstance.message = 'The tender amount cannot exceed the total amount due.';
      //modalRef.componentInstance.options = this.modalOptions;
      modalRef.result.then(() => {
        //console.log('Alert modal closed');
      }, () => {
        //console.log('Alert modal dismissed');
      });
      return;
    }
    this.yetToPayDC = evt.target.value;
    this.dcCurrSymbl = this._utlSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode());
    this.yetToPayNDC = this.dcCurrSymbl == '$' ? Number(Number(this.yetToPayDC * this._logonDataSvc.getExchangeRate()).toCPOSFixed(2)) : 
      Number(Number(this.yetToPayDC / this._logonDataSvc.getExchangeRate()).toCPOSFixed(2));
  }

  onCancelClick(): void {
    if (this.tndrs.length === 0) {
      this.router.navigate(['/rov/chekout']);
      return;
    }

    this.blurActiveElement();
    this._confirmModalRef = this.modalService.open(this.voidPaymentsConfirmDialog, {
      ...this.modalOptions,
      centered: true
    });
  }

  dismissVoidPaymentsDialog(): void {
    if (this.isVoidingPayments) {
      return;
    }

    this._confirmModalRef?.dismiss('No click');
    this._confirmModalRef = null;
  }

  async confirmVoidPayments(): Promise<void> {
    if (this.isVoidingPayments) {
      return;
    }

    this._confirmModalRef?.close('Yes click');
    this._confirmModalRef = null;

    this.isVoidingPayments = true;

    try 
    {
      const tenderList = TicketTender.deepCopyTenderList(this.tndrs);
      const individualId = this._logonDataSvc.getRovEventConfig().individualUID;

      for (const tender of tenderList) 
      {
        await this.processCancelledTender(tender, individualId);
      }

      await this.finalizeVoidedSaleTransaction();
    }
    catch (error) 
    {
      const message = error instanceof Error ? error.message : 'Unable to void one or more payments.';
      this._toastSvc.error(message);
    } 
    finally 
    {
      this.isVoidingPayments = false;
      this.voidRefundProgressMessage = '';
    }
  }

  private async processCancelledTender(tender: TicketTender, individualId: number): Promise<void> {
    const tndrCopy = RovTenderUtil.copyTenderObj(tender);
    const cardEnding = tndrCopy.cardEndingNbr || 'N/A';
    const tenderAmount = Number(tndrCopy.tenderAmount || 0).toCPOSFixed(2);

    if (tndrCopy.tenderTypeCode === 'MS') 
    {
      this.voidRefundProgressMessage = `Refunding ${tenderAmount} for card ending ${cardEnding}.`;
      const response = await firstValueFrom(this._cposWebSvc.milstarRefund(this.buildMilstarRefundRequest(tndrCopy, individualId)).pipe(take(1)));
      this.throwIfPinpadResponseFailed(response, tndrCopy);
      tndrCopy.refundAuthNbr = response.AUTH_CODE;
    } 
    else if (tndrCopy.tenderTypeCode === 'XC') 
    {
      this.voidRefundProgressMessage = `Voiding ${tenderAmount} for card ending ${cardEnding}.`;
      const response = await firstValueFrom(this._cposWebSvc.voidThisTran(this.buildVoidTranRequest(tndrCopy, individualId)).pipe(take(1)));
      this.throwIfPinpadResponseFailed(response, tndrCopy);
      tndrCopy.refundAuthNbr = response.AUTH_CODE;
    } else {
      this.voidRefundProgressMessage = `Voiding ${tenderAmount} for card ending ${cardEnding}.`;
    }

    tndrCopy.tenderStatus = TenderStatusType.Voided;
    tndrCopy.tndMaintTimestamp = new Date();
    tndrCopy.tndrTimeStamp = new Date();

    await this.persistTenderUpdate(tndrCopy);
  }

  private buildMilstarRefundRequest(tender: TicketTender, individualId: number): MilstarRefundReqData {
    const request = new MilstarRefundReqData();
    request.EncCardNbr = tender.inStoreCardNbrTmp;
    request.TranAmt = tender.tenderAmount;
    request.ClerkId = individualId;
    request.PlanNum = tender.milstarPlanNum;
    return request;
  }

  private buildVoidTranRequest(tender: TicketTender, individualId: number): VoidTranInput {
    const request = new VoidTranInput();
    const rrnDateTime = this.extractTranDateTime(tender.rrn);

    request.RefNum = tender.rrn;
    request.OrigAurusPayTktNum = String(tender.ticketTenderId ?? '');
    request.OrigTranId = String(tender.tenderTransactionId ?? '');
    request.TranDate = rrnDateTime.tranDate;
    request.TranTime = rrnDateTime.tranTime;
    request.TenderAmt = tender.tenderAmount;
    request.AuthCode = '';
    request.ClerkId = String(individualId);
    request.MsgDisplay = 'refunding payment ' + tender.tenderAmount.toCPOSFixed(2);
    request.PlanNum = tender.milstarPlanNum;

    return request;
  }

  private extractTranDateTime(rrn: string): { tranDate: string; tranTime: string } {
    const digitsOnly = (rrn || '').replace(/\D/g, '');

    if (digitsOnly.length < 14) {
      return { tranDate: '', tranTime: '' };
    }

    return {
      tranDate: digitsOnly.substring(0, 8),
      tranTime: digitsOnly.substring(8, 14)
    };
  }

  private throwIfPinpadResponseFailed(response: VfoneCaptureTran, tender: TicketTender): void {
    if (response?.rslt?.IsSuccessful === false) {
      throw new Error(response.rslt.ReturnMsg || 'Unable to void payment for tender ' + tender.tenderTypeCode + '.');
    }
  }

  private async persistTenderUpdate(tndrObj: TicketTender): Promise<void> {
    const tndrCopy = TicketTender.deepCopy(tndrObj);

    this._store.dispatch(addRovTender({ tndrObj: tndrCopy }));
    this._store.dispatch(saveRovTenderObj({ tndrObj: tndrCopy }));

    const saveResult = await firstValueFrom(
      this.actions$.pipe(
        ofType(saveRovTenderObjSuccess, saveRovTenderObjFailed),
        filter(action => action.type === saveRovTenderObjFailed.type || !action.data?.data?.rrn || action.data.data.rrn === tndrCopy.rrn),
        take(1)
      )
    );

    if (saveResult.type === saveRovTenderObjFailed.type) {
      throw new Error('Unable to save voided tender ' + tndrCopy.rrn + '.');
    }
  }

  private async finalizeVoidedSaleTransaction(): Promise<void> {
    this.voidRefundProgressMessage = 'Finalizing voided sale transaction...';

    this._store.dispatch(markRovTicketComplete({ status: TranStatusType.Void }));

    const tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
    if (tktObjData) {
      this._toastSvc.info('Ticket ' + tktObjData.ticketNumber + ' voided successfully.');
      tktObjData.ticketNumber

      this._store.dispatch(saveRovTicketForGuestCheck({ tktObj: tktObjData }));

      const saveTicketResult = await firstValueFrom(
        this.actions$.pipe(
          ofType(saveRovTicketForGuestCheckSuccess, saveRovTicketForGuestCheckFailed),
          take(1)
        )
      );

      if (saveTicketResult.type === saveRovTicketForGuestCheckFailed.type) {
        throw new Error('Unable to save the voided transaction.');
      }
    }

    const evtConfig = this._logonDataSvc.getRovEventConfig();
    sessionStorage.setItem('inProgTranId', '0');
    sessionStorage.setItem('inProgTranTabSerialNum', '');
    this._store.dispatch(resetRovTktObj({ eventConfig: evtConfig }));
    this.router.navigate(['/salestran']);
  }

  async btnTndrClick(evt: Event) {
    
    if (!this._isClickAllowed()) {
      return; // Ignore the click if within debounce window
    }
    //console.log('SplitPay component btnTndrClick called with event:', evt);
    this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    let tndrCode = (evt.target as Element).id
    let busMdl = this._logonDataSvc.getBusinessModel()

    let tndrCompRoute = '';
    switch (tndrCode) {
      case 'CC':
        tndrCompRoute = 'cctender';
        break;
      case 'EG':
      case 'RC':
        tndrCompRoute = 'eaglecash';
        break;
      case 'CA':
      case 'CR':
        tndrCompRoute = 'cashcheck';
        break;
      case 'XC':
      case 'XR':
      case 'MS':
      case 'MR':
        tndrCompRoute = 'pinpadtran';
        break;
      case 'GC':
        tndrCompRoute = 'gcinquiry';
        break;
    }

    this.router.navigate(["/rov/" +tndrCompRoute], { queryParams: { code: tndrCode, tenderAmountDC: this.yetToPayDC, tenderAmountNDC: this.yetToPayNDC } })
  }

}
