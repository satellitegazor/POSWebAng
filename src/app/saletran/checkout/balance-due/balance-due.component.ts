import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { getBalanceDue } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-balance-due',
  templateUrl: './balance-due.component.html',
  styleUrls: ['./balance-due.component.css']
})
export class BalanceDueComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>, private logonSvc: LogonDataService) { }

  balDue: number = 0;
  ngOnInit(): void {
    this._store.select(getBalanceDue).subscribe(data => {
      this.balDue = data;
    })
  }

}
