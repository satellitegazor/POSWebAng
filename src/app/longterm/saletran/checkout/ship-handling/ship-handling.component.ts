import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosCurrencyDirective } from '../../../../directives/pos-currency.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalesTranService } from '../../services/sales-tran.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { updateCheckoutTotals, updateShipHandling } from '../../store/ticketstore/ticket.action';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-ship-handling',
  imports: [CommonModule, FormsModule, PosCurrencyDirective],
  templateUrl: './ship-handling.component.html',
  styleUrl: './ship-handling.component.css'
})
export class ShipHandlingComponent {
  dfltCurrSymbl = '€';
  shipHandlingAmountUIVal: number | null = null;
  shipHandlingTaxPctUIVal: number | null = null;
  shipHandlingAmountErrorMsg: string = '';
  shipHandlingTaxPctErrorMsg: string = '';
  isOConusLocation: boolean = false;

  shipHandlingAmountDC: number = 0;
  shipHandlingTaxDC: number = 0;
  shipHandlingAmountNDC: number = 0;
  shipHandlingTaxNDC: number = 0;

  constructor(private modal: NgbModal, private _saleTranSvc: SalesTranService, 
    private _logonDataSvc: LogonDataService,
    private _store: Store<saleTranDataInterface>, 
    private router: Router, private utilSvc: UtilService,
    private toastSvc: ToastService) {
      this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
  }
  
  ngOnInit(): void {
    var locCnfg = this._logonDataSvc.getLocationConfig();
    this.dfltCurrSymbl = this.utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) ?? '';

    this._store.select(getTktObjSelector).subscribe(tktObj => {
      if(tktObj) {
        this.shipHandlingAmountUIVal =  this.dfltCurrSymbl == '$' ? tktObj.shipHandling : tktObj.shipHandlingFC ?? 0;
        this.shipHandlingTaxPctUIVal = this.dfltCurrSymbl == '$' ? parseFloat(((tktObj.shipHandlingTaxAmt / tktObj.shipHandling) * 100).toCPOSFixed(2)) : (tktObj.shipHandlingFC ? parseFloat(((tktObj.shipHandlingTaxAmtFC / tktObj.shipHandlingFC) * 100).toCPOSFixed(2)) : 0);
      }
    });
  }

  onShipHandlingAmountChange(value: number | null): void {
    this.shipHandlingAmountErrorMsg = '';

    if (value == null || value === undefined) {
      return;
    }

    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return;
    }

    if (amount < 0) {
      this.shipHandlingAmountErrorMsg = 'Shipping/Handling cannot be negative.';
      return;
    }

    if (amount > 999999) {
      this.shipHandlingAmountErrorMsg = 'Shipping/Handling cannot exceed 999,999.00.';
    }
  }

  onShipHandlingTaxPctChange(value: number | null): void {
    this.shipHandlingTaxPctErrorMsg = '';

    if (value == null || value === undefined) {
      return;
    }

    const taxPct = Number(value);
    if (!Number.isFinite(taxPct)) {
      return;
    }

    if (taxPct > 30) {
      this.shipHandlingTaxPctErrorMsg = 'Tax percent cannot exceed 30%.';
    }
  }

  Continue() {
    this.onShipHandlingAmountChange(this.shipHandlingAmountUIVal);
    this.onShipHandlingTaxPctChange(this.shipHandlingTaxPctUIVal);
    if (this.shipHandlingAmountErrorMsg || this.shipHandlingTaxPctErrorMsg) {
      return;
    }

    // TODO: wire into checkout flow
    if(this.dfltCurrSymbl == '$') {
      this.shipHandlingAmountDC = this.shipHandlingAmountUIVal ?? 0;
      this.shipHandlingTaxDC = parseFloat(((this.shipHandlingTaxPctUIVal ?? 0) > 0 ? (this.shipHandlingAmountDC * (this.shipHandlingTaxPctUIVal ?? 0) / 100) : 0).toCPOSFixed(2));
      this.shipHandlingAmountNDC = parseFloat((this._logonDataSvc.getDailyExchRate().exchangeRate * this.shipHandlingAmountDC).toCPOSFixed(2));
      this.shipHandlingTaxNDC = parseFloat((this._logonDataSvc.getDailyExchRate().exchangeRate * this.shipHandlingTaxDC).toCPOSFixed(2));

    } else {
      this.shipHandlingAmountDC = this.shipHandlingAmountUIVal ?? 0;
      this.shipHandlingTaxDC = parseFloat(((this.shipHandlingTaxPctUIVal ?? 0) > 0 ? (this.shipHandlingAmountDC * (this.shipHandlingTaxPctUIVal ?? 0) / 100) : 0).toCPOSFixed(2));
      this.shipHandlingAmountNDC = parseFloat((this._logonDataSvc.getDailyExchRate().exchangeRate > 0 ? parseFloat((this.shipHandlingAmountDC / this._logonDataSvc.getDailyExchRate().exchangeRate).toCPOSFixed(2)) : 0).toCPOSFixed(2));
      this.shipHandlingTaxNDC = parseFloat((this._logonDataSvc.getDailyExchRate().exchangeRate > 0 ? parseFloat((this.shipHandlingTaxDC / this._logonDataSvc.getDailyExchRate().exchangeRate).toCPOSFixed(2)) : 0).toCPOSFixed(2));
    }
      this._store.dispatch(updateShipHandling({ dfltCurrSymbl: this.dfltCurrSymbl, shipHandlingAmountDC: this.shipHandlingAmountDC, shipHandlingTaxDC: this.shipHandlingTaxDC, shipHandlingAmountNDC: this.shipHandlingAmountNDC, shipHandlingTaxNDC: this.shipHandlingTaxNDC }));
      this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    this.toastSvc.info('The shipping & handling charges have been updated successfully.');
    this.modal.dismissAll();
  }

  Cancel() {
    // TODO: close dialog
    this.modal.dismissAll();
  }

}
