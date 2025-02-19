import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { getBalanceDue } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';

@Component({
    selector: 'app-balance-due',
    templateUrl: './balance-due.component.html',
    styleUrls: ['./balance-due.component.css'],
    standalone: false
})
export class BalanceDueComponent implements OnInit {

  constructor(private _store: Store<saleTranDataInterface>, private logonSvc: LogonDataService) { 

    this.allowPartPay = logonSvc.getAllowPartPay();
  }

  allowPartPay: boolean = false;
  balDue: number = 0;
  ngOnInit(): void {
    this._store.select(getBalanceDue).subscribe(data => {
      this.balDue = data;
    })
  }

}
