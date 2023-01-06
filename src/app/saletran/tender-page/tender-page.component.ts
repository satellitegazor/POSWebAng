import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getTktObjSelector } from '../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../store/ticketstore/ticket.state';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { TicketTender } from 'src/app/models/ticket.tender';
import { addTender, saveTicketSplit, updateCheckoutTotals } from '../store/ticketstore/ticket.action';

@Component({
  selector: 'app-tender-page',
  templateUrl: './tender-page.component.html',
  styleUrls: ['./tender-page.component.css']
})
export class TenderPageComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>, private activatedRoute: ActivatedRoute) { 

  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  private _tenderObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {

    this._store.select(getTktObjSelector).subscribe(data => {
      if(data == null)
        return;
      this._tktObj = data;
    })

    this.activatedRoute.queryParams.subscribe(params => {
      this._tenderObj.tenderTypeCode = params['tcode'];
    })

    
  }

  btnApprove(evt: Event) {

    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderObj.tenderTypeCode;

    this._store.dispatch(addTender({tndrObj}));

    this._tenderObj.tenderAmount = this._tktObj.tktList.reduce<number>((acc, obj) => {
      return acc + obj.lineItemDollarDisplayAmount;
    }, 0);

    this._store.dispatch(updateCheckoutTotals());
  
    this._store.dispatch(addTender({tndrObj: this._tenderObj}));
    
    this._store.dispatch(saveTicketSplit({tktObj: this._tktObj}));
  }

  btnDecline(evt: Event) {

  }

}
