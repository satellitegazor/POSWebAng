import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosCurrencyDirective } from '../../../../../directives/pos-currency.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RovApiService} from "../../../../short-term.service"
import { RovLogonDataService } from "../../../../rov-logon-data.service"
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { Store } from '@ngrx/store';
import { UtilService } from '../../../../../services-misc/util.service';
import { Router } from '@angular/router';
import { getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { updateRovCheckoutTotals, updateRovShipHandling } from '../../../../store/ticketstore/rticket.action';
import { ToastService } from '../../../../../services-misc/toast.service';

@Component({
  selector: 'app-rov-ship-handling',
  imports: [CommonModule, FormsModule, PosCurrencyDirective],
  templateUrl: './rov-ship-handling.component.html',
  styleUrls: ['./rov-ship-handling.component.css']
})
export class RovShipHandlingComponent {
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

  constructor(private modal: NgbModal, private rovApiSvc: RovApiService, 
    private _logonDataSvc: RovLogonDataService,
    private _store: Store<RovSaleTranDataInterface>, 
    private router: Router, private utilSvc: UtilService,
    private toastSvc: ToastService) {
      this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
  }
  
  ngOnInit(): void {
    
    this.dfltCurrSymbl = this.utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) ?? '';

    this._store.select(getRTktObjSelector).subscribe(tktObj => {
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
      this._store.dispatch(updateRovShipHandling({ dfltCurrSymbl: this.dfltCurrSymbl, shipHandlingAmountDC: this.shipHandlingAmountDC, shipHandlingTaxDC: this.shipHandlingTaxDC, shipHandlingAmountNDC: this.shipHandlingAmountNDC, shipHandlingTaxNDC: this.shipHandlingTaxNDC }));
      this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    this.toastSvc.info('The shipping & handling charges have been updated successfully.');
    this.modal.dismissAll();
  }

  Cancel() {
    // TODO: close dialog
    this.modal.dismissAll();
  }

}
