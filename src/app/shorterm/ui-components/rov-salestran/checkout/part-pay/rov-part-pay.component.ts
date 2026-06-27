import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from '../../../../../global/logon-data-service.service';
import { TicketTotals } from '../../../../../models/ticket.split';
import { Round2DecimalService } from "../../../../../services-misc/round2-decimal.service"
import { updateRovPartPayData } from '../../../../store/ticketstore/rticket.action';
import { getRIsCustomerAddedToTicket, getRTicketTotals } from '../../../../store/ticketstore/rticket.selector';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { UtilService } from '../../../../../services-misc/util.service';
import { DailyExchRate } from "../../../../../models/exchange.rate"
import { RovLogonDataService } from 'src/app/shorterm/rov-logon-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rov-part-pay',
  templateUrl: './rov-part-pay.component.html',
  styleUrls: ['./rov-part-pay.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RovPartPayComponent implements OnInit {

  constructor(private _store: Store<RovSaleTranDataInterface>,
    private logonSvc: RovLogonDataService,
    private utilSvc: UtilService) { }

  partPayAmount: number = 0;
  partPayPercent: number = 0;
  partPayAmountNDC: number = 0;

  showPartPay: boolean = false;
  disablePartPay: boolean = true;
  grandTotalDC: number = 0;
  grandTotalNDC: number = 0;
  amtPaidDC: number = 0;
  amtPaidNDC: number = 0;
  defaultCurr: string = '$';
  dailyExchRateObj: DailyExchRate = {} as DailyExchRate;

  ngOnInit(): void {

    this.showPartPay = this.logonSvc.getAllowPartPay();

    this._store.select(getRTicketTotals).subscribe(tktTotals => {


      this.grandTotalDC = tktTotals.grandTotalDC;
      this.grandTotalNDC = tktTotals.grandTotalNDC;

      this.amtPaidDC = tktTotals.amtPaidDC;
      this.amtPaidNDC = tktTotals.amtPaidNDC;

      this.partPayAmount = tktTotals.partPayDC;

      if (tktTotals.grandTotalDC > 0 && tktTotals.partPayNDC > 0) {
        this.partPayPercent = Number(((tktTotals.partPayNDC / tktTotals.grandTotalDC) * 100).toCPOSFixed(2));
      }
    })

    this._store.select(getRIsCustomerAddedToTicket).subscribe(val => {
      this.disablePartPay = !val;
    })

    this.defaultCurr = this.utilSvc.currencySymbols.get(this.logonSvc.getRovEventConfig().defaultCurrency) ?? '$';
    this.dailyExchRateObj = this.logonSvc.getDailyExchRate();
  }

  onPartPayPercent(event: any) {

    this.partPayPercent = Round2DecimalService.round(event.target.value);

    if (this.partPayPercent > 0) {
      this.partPayAmount = Number(((this.grandTotalDC - this.amtPaidDC) * this.partPayPercent / 100).toCPOSFixed(2));
      this.partPayAmountNDC = Number((this.partPayAmount * (this.dailyExchRateObj.isOneUSD ? this.dailyExchRateObj.oneUSDRate : (1 / this.dailyExchRateObj.oneUSDRate))).toCPOSFixed(2));
      this._store.dispatch(updateRovPartPayData({ partPayFlag: true, partPayAmountDC: this.partPayAmount, partPayAmountNDC: this.partPayAmountNDC }));
    }
    else {
      this._store.dispatch(updateRovPartPayData({ partPayFlag: false, partPayAmountDC: 0, partPayAmountNDC: 0 }));
    }

  }

  onPartPayAmount(event: any) {
    this.partPayAmount = Round2DecimalService.round(event.target.value);
    if (this.partPayAmount > 0) {
      this.partPayPercent = Number((this.partPayAmount / (this.grandTotalDC - this.amtPaidDC) * 100).toCPOSFixed(2));
      this._store.dispatch(updateRovPartPayData({ partPayFlag: true, partPayAmountDC: this.partPayAmount, partPayAmountNDC: this.partPayAmount }));
    }
    else {
      this._store.dispatch(updateRovPartPayData({ partPayFlag: false, partPayAmountDC: 0, partPayAmountNDC: 0 }));
    }

  }

  keyValidate(event: any) {
    var t = event.target.value;
    var result = t.indexOf('.') >= 0 ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 2) : t;
    if (event.keyCode === 8) {
      return true;
    }
    else if (event.keyCode !== 190 && (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105))
      return false;
    else {
      if (result !== event.target.value)
        return false;
      else
        return true;
    }
  }

}
