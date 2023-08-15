import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketTotals } from 'src/app/models/ticket.split';
import { updatePartPayData } from '../../store/ticketstore/ticket.action';
import { getTicketTotals } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-part-pay',
  templateUrl: './part-pay.component.html',
  styleUrls: ['./part-pay.component.css']
})
export class PartPayComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>, private logonSvc: LogonDataService) { }

  partPayAmount: number = 0;
  partPayPercent: number = 0;
  showPartPay: boolean = false;
  grandTotalDC: number = 0;
  grandTotalNDC: number = 0;
  amtPaidDC: number = 0;
  amtPaidNDC: number = 0;

  ngOnInit(): void {

    this.showPartPay = this.logonSvc.getAllowPartPay();

    this._store.select(getTicketTotals).subscribe(tktTotals => {


      this.grandTotalDC = tktTotals.grandTotalDC;
      this.grandTotalNDC = tktTotals.grandTotalNDC;

      this.amtPaidDC = tktTotals.amtPaidDC;
      this.amtPaidNDC = tktTotals.amtPaidNDC;

      this.partPayAmount = tktTotals.partPayDC;

      if(tktTotals.grandTotalDC > 0 && tktTotals.partPayNDC > 0) {
        this.partPayPercent = Number(((tktTotals.partPayNDC / tktTotals.grandTotalDC) * 100).toFixed(2));
      }
    })
  }

  onPartPayPercent(event: any) {
if(this.partPayPercent > 0) {
    this.partPayAmount = Number(((this.grandTotalDC - this.amtPaidDC) * this.partPayPercent / 100).toFixed(2));
    this._store.dispatch(updatePartPayData({partPayFlag: true, partPayAmountDC: this.partPayPercent, partPayAmountNDC: this.partPayAmount}));
}
else {
  this._store.dispatch(updatePartPayData({partPayFlag: false, partPayAmountDC: 0, partPayAmountNDC: 0}));
}

  }
  
  onPartPayAmount(event: any) {

    if(this.partPayAmount > 0) {
      this.partPayPercent = Number((this.partPayAmount / (this.grandTotalDC - this.amtPaidDC) * 100 ).toFixed(2));
      this._store.dispatch(updatePartPayData({partPayFlag: true, partPayAmountDC: this.partPayPercent, partPayAmountNDC: this.partPayAmount}));
    }
    else {
      this._store.dispatch(updatePartPayData({partPayFlag: false, partPayAmountDC: 0, partPayAmountNDC: 0}));
    }

  }

  keyValidate(event: any) {
    var t = event.target.value;
    var result = t.indexOf('.') >= 0 ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 2) : t;
    if(event.keyCode === 8) {
      return true;
    }
    else if (event.keyCode !== 190 && (event.keyCode < 48 || event.keyCode > 57))
      return false;
    else {
      if(result !== event.target.value)
        return false;
      else
        return true;
    }
  }

}
