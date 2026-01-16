import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { getBalanceDue, getRemainingBal } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { currSymbls } from 'src/app/models/CurrencySymbols';

@Component({
    selector: 'app-balance-due',
    templateUrl: './balance-due.component.html',
    styleUrls: ['./balance-due.component.css'],
    standalone: false
})
export class BalanceDueComponent implements OnInit {

  
  public dfltCurrSymbl: string = '$'
  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'

  constructor(private _store: Store<saleTranDataInterface>, private _logonDataSvc: LogonDataService) { 

    this.allowPartPay = _logonDataSvc.getAllowPartPay();
  }

  allowPartPay: boolean = false;
  balDue: number = 0;
  ngOnInit(): void {
    this._store.select(getRemainingBal).subscribe(data => {
      this.balDue = data.amountDC;
    })

    this.dfltCurrSymbl = currSymbls.find(x => x.key == this._logonDataSvc.getDfltCurrCode())?.value ?? '$'; 
    this.exchRate = this._logonDataSvc.getExchangeRate();
    this.dfltCurrCode = this._logonDataSvc.getDfltCurrCode();
  }

}
