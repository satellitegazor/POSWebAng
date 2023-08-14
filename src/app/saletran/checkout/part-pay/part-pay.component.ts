import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TicketTotals } from 'src/app/models/ticket.split';
import { getTicketTotals } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-part-pay',
  templateUrl: './part-pay.component.html',
  styleUrls: ['./part-pay.component.css']
})
export class PartPayComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>, ) { }

  dcPartPayAmt: number = 0;
  ndcPartPayAmt: number = 0;

  ngOnInit(): void {
    this._store.select(getTicketTotals).subscribe(tktTotals => {
      this.dcPartPayAmt = tktTotals.partPayDC;
      this.ndcPartPayAmt = tktTotals.partPayNDC;      
    })
  }

  onDcPartPayAmt(event: any) {

  }
  
  onNdcPartPayAmt(event: any) {

  }

}
