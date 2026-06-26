import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from '../../../../../global/logon-data-service.service';
import { getRBalanceDue, getRRemainingBal } from '../../../../store/ticketstore/rticket.selector';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { currSymbls } from '../../../../../models/CurrencySymbols';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-rov-balance-due',
    templateUrl: './rov-balance-due.component.html',
    styleUrls: ['./rov-balance-due.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]

})
export class RovBalanceDueComponent implements OnInit {

  
  public dfltCurrSymbl: string = '$'
  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'

  constructor(private _store: Store<RovSaleTranDataInterface>, private _logonDataSvc: LogonDataService) { 

    this.allowPartPay = _logonDataSvc.getAllowPartPay();
  }

  allowPartPay: boolean = false;
  balDue: number = 0;
  ngOnInit(): void {

    this.dfltCurrSymbl = currSymbls.find(x => x.key == this._logonDataSvc.getDfltCurrCode())?.value ?? '$'; 
    this.exchRate = this._logonDataSvc.getExchangeRate();
    this.dfltCurrCode = this._logonDataSvc.getDfltCurrCode();


    this._store.select(getRRemainingBal).subscribe(data => {
      this.balDue = this.dfltCurrCode == 'USD' ? data.amountUSD : data.amountFC;
    })

  }

}
