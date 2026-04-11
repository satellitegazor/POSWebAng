import { keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap'
import { select, Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { CustomerSearchComponent } from '../../../../shared/customer-search/customer-search.component';
import { LocationConfig } from '../../../models/location-config';
import { TenderType, TenderTypeModel } from '../../../models/tender.type';
import { SalesTranService } from '../../services/sales-tran.service';
import { addTender, removeTndrWithSaveCode, saveTicketForGuestCheck, updateCheckoutTotals, saveTicketForGuestCheckSuccess, isSplitPayR5 } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { TipsModalDlgComponent } from '../tips-modal-dlg/tips-modal-dlg.component';
import { firstValueFrom, Observable, Subscription, take, map } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { TicketSplit } from 'src/app/models/ticket.split';
import { DailyExchRate } from 'src/app/models/exchange.rate';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css'],
  standalone: false
})
export class CheckoutPageComponent implements OnInit {

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  private _clickDebounceMs: number = 2000; // 2 second debounce window
  private _lastClickTime: number = 0;

  constructor(private _saleTranSvc: SalesTranService,
    private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService,
    private modalService: NgbModal,
    private _store: Store<saleTranDataInterface>,
    private router: Router,
    private _utilSvc: UtilService,
    private actions$: Actions) { }

  displayCustSearchDlg: string = '';
  showErrMsg: boolean = false;
  strongErrMessage: string = "";
  errMessage: string = "";
  dfltCurrSymbl: string = '';

  locationConfig: LocationConfig = {} as LocationConfig;
  isOConus: boolean = false;
  tenderAmount: number = 0;
  fcTenderAmount: number = 0;

  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;
  isRefund: boolean = false;
  isInCompleteTicket: boolean = false;
  private _transactionId: number = 0; // Store transaction ID from saveTicketForGuestCheck

  public ngOnInit(): void {

    //console.log('CheckoutPage component ngOnInit called');
    this.locationConfig = this._logonDataSvc.getLocationConfig();
    this.isInCompleteTicket = this.locationConfig.inProgTranId > 0;
    this.isOConus = this.locationConfig.rgnCode != "CON";
    this.dfltCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) ?? '';

    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();
    this.isRefund = this._logonDataSvc.getTranMode();
    this.tenderButtonUIDisplay();

    this._store.select(getCheckoutItemsSelector).subscribe(items => {

      if (items == null)
        return;

      this.tenderAmount = 0;
      this.fcTenderAmount = 0;

      items.forEach(itm => {
        this.tenderAmount += itm.lineItemDollarDisplayAmount ?? 0;
        this.fcTenderAmount += itm.fcLineItemDollarDisplayAmount ?? 0;
      })
    })

    this._store.select(getTktObjSelector).subscribe(tktObj => {
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

    this.router.navigate([route], { queryParams: { code: tndrCode } });
  }

  private async genericTenderClickProcessing(tndrCode: string): Promise<void> {

    this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    this._store.dispatch(isSplitPayR5({ isSplitPayR5: (tndrCode == 'btnSplitPay') }));

    if (tndrCode == 'btnSplitPay' && this.locationConfig.inProgTranId > 0) {
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
      tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
      this._store.dispatch(addTender({ tndrObj }));
      var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
      if (tktObjData) {
        this._store.dispatch(saveTicketForGuestCheck({ tktObj: tktObjData }));

        // Listen for saveTicketForGuestCheckSuccess to capture transaction ID
        this.actions$.pipe(
          ofType(saveTicketForGuestCheckSuccess),
          take(1),
          map(action => action.rslt.transactionId)
        ).subscribe((transactionId) => {
          this._transactionId = transactionId;
          console.log('Transaction ID saved:', this._transactionId);

          // Update tender with transaction ID
          this._store.dispatch(addTender({ tndrObj }));
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
      tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;

      var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
      if (tktObjData) {
        this._store.dispatch(saveTicketForGuestCheck({ tktObj: tktObjData }));

        // Listen for saveTicketForGuestCheckSuccess to capture transaction ID
        this.actions$.pipe(
          ofType(saveTicketForGuestCheckSuccess),
          take(1),
          map(action => action.rslt.transactionId)
        ).subscribe((transactionId) => {
          this._transactionId = transactionId;
          console.log('Transaction ID saved:', this._transactionId);

          // Update tender with transaction ID
          tndrObj.tenderTransactionId = this._transactionId;
          this._store.dispatch(addTender({ tndrObj }));

          if (tktObjData?.tipAmountDC == 0) {
            const modalRef = this.modalService.open(TipsModalDlgComponent, this.modalOptions);
            modalRef.componentInstance.tndrCode = tndrCode;
          }
          else {
            this._navigateToTenderPage(tndrCode);
          }
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

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr) => tndr.isRefundType == this.isRefund);

    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length + (this.isRefund ? 1 : 2)); // +1 for split pay button
  }

  closeCustSearchDlg() {
    this.displayCustSearchDlg = "none";
  }
}