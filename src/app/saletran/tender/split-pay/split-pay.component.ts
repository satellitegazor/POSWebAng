import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TicketTender } from 'src/app/models/ticket.tender';
import { getBalanceDue, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';

@Component({
    selector: 'app-split-pay',
    templateUrl: './split-pay.component.html',
    styleUrls: ['./split-pay.component.css'],
    standalone: false
})
export class SplitPayComponent implements OnInit {

  constructor(private _store: Store<saleTranDataInterface>) { }

  tndrs: TicketTender[] = [];
  balDue: number = 0;


  ngOnInit(): void {

    this._store.select(getTktObjSelector).subscribe(data => {

      if(data) {
        this.tndrs = data?.ticketTenderList;
      }
      
    })

    this._store.select(getBalanceDue).subscribe(data => {
      if(data) {
          this.balDue = data;
      }
    })

  }

}
