import { keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap'
import { select, Store } from '@ngrx/store';
import { RovLogonDataService } from '../../../../rov-logon-data.service';
import { TenderStatusType, TicketTender, TranStatusType } from '../../../../../models/ticket.tender';
import { SharedSubjectService } from '../../../../../shared-subject/shared-subject.service';
import { CustomerSearchComponent } from '../../../../../longterm/customer-search/customer-search.component';
import { EventConfig } from '../../../../models/event.config';
import { TenderType, TenderTypeModel } from '../../../../../longterm/models/tender.type';

import { addRovTender, removeRovTndrWithSaveCode, saveRovTicketForGuestCheck, updateRovCheckoutTotals, saveRovTicketForGuestCheckSuccess, isSplitPayRovR5, markRovTendersComplete, markRovTicketComplete, saveCompleteRovTicketSplit } from '../../../../store/ticketstore/rticket.action';
import { getRCheckoutItemsSelector, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';

import { firstValueFrom, Observable, Subscription, take, map } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { ROV_POSTicketSplit } from '../../../../models/rticket.split';
import { DailyExchRate } from '../../../../../models/exchange.rate';
import { UtilService } from '../../../../../services-misc/util.service';
import { Rov_SalesTranCheckoutItem } from '../../../../models/r-salestran-checkout-item';
import { RovApiService } from '../../../../short-term.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RovCheckoutItemsComponent } from '../checkout-items/rov-checkout-items.component';
import { RovPartPayComponent } from '../part-pay/rov-part-pay.component';
import { RovBalanceDueComponent } from '../balance-due/rov-balance-due.component';

@Component({
  selector: 'app-rov-checkout-page',
  templateUrl: './rov-checkout-page.component.html',
  styleUrls: ['./rov-checkout-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RovCheckoutItemsComponent, RovPartPayComponent, RovBalanceDueComponent],
})
export class RovCheckoutPageComponent implements OnInit {

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  private _clickDebounceMs: number = 2000; // 2 second debounce window
  private _lastClickTime: number = 0;

  constructor(private _saleTranSvc: RovApiService,
    private _logonDataSvc: RovLogonDataService,
    private _sharedSubSvc: SharedSubjectService,
    private modalService: NgbModal,
    private _store: Store<RovSaleTranDataInterface>,
    private router: Router,
    private _utilSvc: UtilService,
    private actions$: Actions) { }

  displayCustSearchDlg: string = '';
  showErrMsg: boolean = false;
  strongErrMessage: string = "";
  errMessage: string = "";
  dfltCurrSymbl: string = '';

  evtConfig: EventConfig = {} as EventConfig;
  isOConus: boolean = false;
  tenderAmount: number = 0;
  fcTenderAmount: number = 0;

  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;
  isRefund: boolean = false;
  isInCompleteTicket: boolean = false;
  busModel: string = '';
  
  private _transactionId: number = 0; // Store transaction ID from saveTicketForGuestCheck


  public ngOnInit(): void {

    //console.log('CheckoutPage component ngOnInit called');
    this.evtConfig = this._logonDataSvc.getRovEventConfig();
    this.busModel = this.evtConfig.busFuncCode;

    this.isInCompleteTicket = this.evtConfig.inProgTranId > 0;
    this.isOConus = this.evtConfig.rgnCode != "CON";
    this.dfltCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) ?? '';

    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();
    this.isRefund = this._logonDataSvc.getTranIsRefund();
    this.tenderButtonUIDisplay();

    this._store.select(getRCheckoutItemsSelector).subscribe(items => {

      if (items == null)
        return;

      this.tenderAmount = 0;
      this.fcTenderAmount = 0;

      items.forEach((itm: Rov_SalesTranCheckoutItem) => {
        this.tenderAmount += itm.lineItemDollarDisplayAmount ?? 0;
        this.fcTenderAmount += itm.dCLineItemDollarDisplayAmount ?? 0;
      })
    })

    this._store.select(getRTktObjSelector).subscribe(tktObj => {
      if (tktObj) {
        this.tenderAmount += (tktObj.shipHandling + tktObj.shipHandlingTaxAmt);
        this.fcTenderAmount += (tktObj.shipHandlingFC + tktObj.shipHandlingTaxAmtFC);
        this.tenderAmount += this.dfltCurrSymbl == '$' ? tktObj.tipAmountDC : tktObj.tipAmountNDC;
        this.fcTenderAmount += this.dfltCurrSymbl == '$' ? tktObj.tipAmountNDC : tktObj.tipAmountDC;
      }
    });
  }

  btnCustDetailsClick(evt: Event) {
    this.displayCustSearchDlg = "display";
    const modalRef = this.modalService.open(CustomerSearchComponent, this.modalOptions);
  }

  private _isClickAllowed(): boolean {
    const now = Date.now();
    if (now - this._lastClickTime >= this._clickDebounceMs) {
      this._lastClickTime = now;
      return true;
    }
    return false;
  }

  private _resolveTenderCode(evt: Event): string {
    const directTarget = evt.target as HTMLElement | null;
    const currentTarget = evt.currentTarget as HTMLElement | null;

    if (currentTarget?.id) {
      return currentTarget.id;
    }

    if (directTarget?.id) {
      return directTarget.id;
    }

    return directTarget?.closest('button')?.id || '';
  }

  private _navigateToTenderPage(tndrCode: string): void {
    const route = this._utilSvc.tenderCodePageMap.get(tndrCode);
    if (!route) {
      this.showErrMsg = true;
      this.strongErrMessage = 'Navigation Error';
      this.errMessage = 'Unable to determine tender page for tender code: ' + tndrCode;
      return;
    }

    this.router.navigate(["/rov/" + route], { queryParams: { code: tndrCode } });
  }

  private async genericTenderClickProcessing(tndrCode: string): Promise<void> {

    this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    this._store.dispatch(isSplitPayRovR5({ isSplitPayR5: (tndrCode == 'btnSplitPay') }));

    if ((tndrCode == 'btnSplitPay' && this.evtConfig.inProgTranId > 0) || this._logonDataSvc.getTranIsRefund()) {
      this._navigateToTenderPage(tndrCode);
      return
    }

    //let tndrCode = (evt.target as Element).id
    if (this._logonDataSvc.getBusinessModel() != 5 || tndrCode == "CA") {

      let tndrObj: TicketTender = new TicketTender();
      tndrObj.tenderTypeCode = "SV";
      tndrObj.tenderAmount = this.tenderAmount;
      tndrObj.fcTenderAmount = this.tenderAmount * this._logonDataSvc.getExchangeRate();
      tndrObj.tndMaintTimestamp = new Date(Date.now())
      tndrObj.rrn = this._utilSvc.getUniqueRRN();
      tndrObj.tenderStatus = TenderStatusType.Complete;
      tndrObj.fcCurrCode = this._logonDataSvc.getRovEventConfig().currCode;
      this._store.dispatch(addRovTender({ tndrObj }));
      var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
      if (tktObjData) {
        this._store.dispatch(saveRovTicketForGuestCheck({ tktObj: tktObjData }));

        // Listen for saveTicketForGuestCheckSuccess to capture transaction ID
        this.actions$.pipe(
          ofType(saveRovTicketForGuestCheckSuccess),
          take(1),
          map(action => action.rslt.transactionId)
        ).subscribe((transactionId) => {
          this._transactionId = transactionId;
          console.log('Transaction ID saved:', this._transactionId);

          // Update tender with transaction ID
          this._store.dispatch(addRovTender({ tndrObj }));
          this._navigateToTenderPage(tndrCode);
        });
      }
    }
    else {

      this.displayCustSearchDlg = "display";

      let tndrObj: TicketTender = new TicketTender();
      tndrObj.tenderTypeCode = "SV";
      tndrObj.tenderAmount = this.tenderAmount;
      tndrObj.fcTenderAmount = this.tenderAmount * this._logonDataSvc.getExchangeRate();
      tndrObj.tndMaintTimestamp = new Date(Date.now())
      tndrObj.rrn = this._utilSvc.getUniqueRRN();
      tndrObj.tenderStatus = TenderStatusType.Complete;
      tndrObj.fcCurrCode = this._logonDataSvc.getRovEventConfig().currCode;
      this._store.dispatch(addRovTender({ tndrObj }));

      var tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
      if (tktObjData) {
        this._store.dispatch(saveRovTicketForGuestCheck({ tktObj: tktObjData }));

        // Listen for saveTicketForGuestCheckSuccess to capture transaction ID
        this.actions$.pipe(
          ofType(saveRovTicketForGuestCheckSuccess),
          take(1),
          map(action => action.rslt.transactionId)
        ).subscribe((transactionId) => {
          this._transactionId = transactionId;
          console.log('Transaction ID saved:', this._transactionId);

          // Update tender with transaction ID
          // tndrObj.tenderTransactionId = this._transactionId;
          // this._store.dispatch(addTender({ tndrObj }));

          // if (tktObjData?.tipAmountDC == 0) {
          //   const modalRef = this.modalService.open(RovTipsModalDlgComponent, this.modalOptions);
          //   modalRef.componentInstance.tndrCode = tndrCode;
          // }
          // else {
            this._navigateToTenderPage(tndrCode);
          // }
        });
      }
    }
  }

  async btnTndrClick(evt: Event) {
    if (!this._isClickAllowed()) {
      return; // Ignore the click if within debounce window
    }

    let tndrCode = this._resolveTenderCode(evt);
    if (!tndrCode) {
      return;
    }
    await this.genericTenderClickProcessing(tndrCode);
  }

  async btnSplitPayClick(evt: Event) {
    if (!this._isClickAllowed()) {
      return; // Ignore the click if within debounce window
    }

    let tndrCode = this._resolveTenderCode(evt);
    if (!tndrCode) {
      return;
    }
    await this.genericTenderClickProcessing(tndrCode);
  }

  public tenderButtonUIDisplay(): void {

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr: TenderType) => tndr.isRefundType == this.isRefund && tndr.tenderTypeCode);

    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length + (this.isRefund ? 1 : 2) + (this.busModel === 'BUSFNC_LTR_OTHER_CASH_CARRY' ? 1 : 0)); // +1 for split pay button
  }

  closeCustSearchDlg() {
    this.displayCustSearchDlg = "none";
  }

  btnDeferPayment(evt: Event) {
    if (!this._isClickAllowed()) {
      return; // Ignore the click if within debounce window
    }

    let deferTndr: TicketTender = new TicketTender();
    deferTndr.tenderTypeCode = "DP";
    deferTndr.tenderAmount = this.tenderAmount;
    deferTndr.fcTenderAmount = this.tenderAmount * this._logonDataSvc.getExchangeRate();
    deferTndr.tndMaintTimestamp = new Date(Date.now())
    deferTndr.rrn = this._utilSvc.getUniqueRRN();
    deferTndr.tenderStatus = TenderStatusType.Complete;
    deferTndr.fcCurrCode = this._logonDataSvc.getRovEventConfig().currCode;
    this._store.dispatch(addRovTender({ tndrObj: deferTndr }));
    this._navigateToTenderPage("btnDeferPayment");
    this.markTicketCompleteAndSave();
  }

  private async markTicketCompleteAndSave() {
    this._store.dispatch(markRovTendersComplete({ status: TenderStatusType.Complete }));
    this._store.dispatch(markRovTicketComplete({ status: TranStatusType.Complete }));

    // Fetch the updated ticket object after marking complete
    const tktObjData = await firstValueFrom(this._store.pipe(select(getRTktObjSelector), take(1)));
    if (tktObjData != null) {
      this._store.dispatch(saveCompleteRovTicketSplit({ tktObj: tktObjData }));
      this.router.navigate(['/rov/rsavetktsuccess']);
    }
    else {
      this.router.navigate(['/rov/rchekout']);
    }
  }
}