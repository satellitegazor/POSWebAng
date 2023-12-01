import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getBalanceDue, getBalanceDueFC, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { TicketTender } from 'src/app/models/ticket.tender';
import { addTender, saveTicketSplit, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { LocalStorageService } from 'src/app/global/local-storage.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TenderTypeModel } from '../../models/tender.type';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { AssociateSaleTips } from 'src/app/models/associate.sale.tips';
import { getLocCnfgIsAllowTipsSelector } from '../../store/locationconfigstore/locationconfig.selector';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-tender-page',
  templateUrl: './tender-page.component.html',
  styleUrls: ['./tender-page.component.css']
})
export class TenderPageComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService) {
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  public tenderAmount: number = 0;
  public tenderAmountFC: number = 0;
  private _defaultCurrency: string = '';
  private _tenderTypeCode: string = '';

  private subscription:Subscription = {} as Subscription;

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

      



    })

    this.activatedRoute.queryParams.subscribe(params => {
      this._tenderTypeCode = params['code'];
    })
  }

  btnApprove(evt: Event) {

    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderTypeCode;
    tndrObj.tenderAmount = this.tenderAmount;
    tndrObj.fCTenderAmount = this.tenderAmountFC;
    tndrObj.tndMaintTimestamp = new Date(Date.now())
    tndrObj.currCode = this._logonDataSvc.getLocationConfig().defaultCurrency;
    tndrObj.fCCurrCode = this._logonDataSvc.getLocationConfig().currCode;

    this._store.dispatch(addTender({ tndrObj }));
    
    this.subscription = this._store.select(getTktObjSelector).subscribe(data => {
      if (data != null && this.IsTicketComplete(data)) {

        this.route.navigate(['/savetktsuccess']);
        this._store.dispatch(saveTicketSplit({ tktObj:  data}));
       }
     });
    
  }

  btnDecline(evt: Event) {
    this.route.navigate(['/checkout']);
  }

  private IsTicketComplete(tktObj: TicketSplit): boolean {

    if(tktObj.tktList.length == 0)
      return false;

    if(tktObj.ticketTenderList.length == 0)
      return false;

    let ticketTotal = 0;
    
    for(const key in tktObj.tktList) {
      ticketTotal += tktObj.tktList[key].lineItemDollarDisplayAmount;
    }

    for(const key in tktObj.associateTips) {
      ticketTotal += tktObj.associateTips[key].tipAmount;
    }

    let allowPartPay = this._logonDataSvc.getAllowPartPay();

    let tenderTotals = 0;

    for(const key in tktObj.ticketTenderList) {
      tenderTotals += tktObj.ticketTenderList[key].tenderAmount;
    }

    if(allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals || Number(ticketTotal).toPrecision(2) == Number(tenderTotals).toPrecision(2)) {
      return true;
    }
    else {
      return false;
    }
  }
}
