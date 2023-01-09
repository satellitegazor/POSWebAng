import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getBalanceDue, getBalanceDueFC, getTktObjSelector } from '../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../store/ticketstore/ticket.state';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TicketTender } from 'src/app/models/ticket.tender';
import { addTender, saveTicketSplit, updateCheckoutTotals } from '../store/ticketstore/ticket.action';
import { LocalStorageService } from 'src/app/global/local-storage.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';

@Component({
  selector: 'app-tender-page',
  templateUrl: './tender-page.component.html',
  styleUrls: ['./tender-page.component.css']
})
export class TenderPageComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>,
    private activatedRoute: ActivatedRoute,
    private _logonDataSvc: LogonDataService) {

  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  private _tenderObj: TicketTender = {} as TicketTender;
  public tenderAmount: number = 0;
  public tenderAmountFC: number = 0;
  private _defaultCurrency: string = '';

  ngOnInit(): void {

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;

      this._store.select(getBalanceDue).subscribe(data => {
        this.tenderAmount = data;
      })      
      this._store.select(getBalanceDueFC).subscribe(data => {
        this.tenderAmountFC = data;
      })      

      this._defaultCurrency = this._logonDataSvc.getLocationConfig().defaultCurrency;
    })

    this.activatedRoute.queryParams.subscribe(params => {
      this._tenderObj.tenderTypeCode = params['tcode'];
    })
  }

  btnApprove(evt: Event) {

    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderObj.tenderTypeCode;
    tndrObj.tenderAmount = this.tenderAmount;
    tndrObj.fCTenderAmount = this.tenderAmountFC;
    tndrObj.tndMaintTimestamp = new Date(Date.now())

    this._store.dispatch(addTender({ tndrObj }));

    this._store.select(getTktObjSelector).subscribe(data => {
      if(data != null)
        this._store.dispatch(saveTicketSplit({ tktObj: data }));  
    })    
  }

  btnDecline(evt: Event) {

  }
}
