import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { firstValueFrom, Subscription, take } from 'rxjs';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketTender } from 'src/app/models/ticket.tender';
import { addTender, saveCompleteTicketSplit } from '../../store/ticketstore/ticket.action';
import { getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { TicketSplit } from 'src/app/models/ticket.split';
import { TenderType } from '../../../models/tender.type';

@Component({
  selector: 'app-split-tender-page',
  imports: [],
  templateUrl: './split-tender-page.component.html',
  styleUrl: './split-tender-page.component.css'
})
export class SplitTenderPageComponent {

  

private _tenderTypeCode: string = '';
tenderAmount: number = 0;
tenderAmountFC: number = 0;
    constructor(private _store: Store<saleTranDataInterface>,
      private activatedRoute: ActivatedRoute,
      private route: Router,
      private _logonDataSvc: LogonDataService) {
    }
  
  private defaultCurrCode: string = '';
  private nonDefaultCurrCode: string = '';
  private subscription:Subscription = {} as Subscription;

  ngOnInit(): void {

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;

      // this._store.select(getRemainingBalance).subscribe(data => {
      //   this.tenderAmount = data;
      // })      
      // this._store.select(getRemainingBalanceFC).subscribe(data => {
      //   this.tenderAmountFC = data;
      // })
    })

    this.activatedRoute.queryParams.subscribe(params => {
      this._tenderTypeCode = params['code'];
      this.tenderAmount = Number(Number(params['tenderAmount']).toFixed(2));
      this.tenderAmountFC = Number(Number(params['tenderAmountFC']).toFixed(2));
    })

    this.defaultCurrCode = this._logonDataSvc.getDfltCurrCode();
    this.nonDefaultCurrCode = this._logonDataSvc.getNonDfltCurrCode();
  }
  
btnDecline($event: MouseEvent) {
  this.route.navigate(['/checkout']);
}
  async btnApprove($event: MouseEvent) {
    //console.log('SplitTenderPage component btnApprove called');
    let tndrObj: TicketTender = new TicketTender();
    tndrObj.tenderTypeCode = this._tenderTypeCode;
    tndrObj.tenderAmount = this.tenderAmount;
    tndrObj.fcTenderAmount = this.tenderAmountFC;
    tndrObj.tndMaintTimestamp = new Date(Date.now())
    //tndrObj.currCode = this._logonDataSvc.getLocationConfig().defaultCurrency;
    tndrObj.fcCurrCode   = this._logonDataSvc.getLocationConfig().currCode;
    //console.log("TenderTypes length" + this._logonDataSvc.getTenderTypes().types.length);
    let tndrTypeObj = this._logonDataSvc.getTenderTypes().types.find((t: TenderType) => t.tenderTypeCode == this._tenderTypeCode);
    if(tndrTypeObj != null) {
      //console.log("TenderTypeDesc: " + tndrTypeObj.tenderTypeDesc);
      tndrObj.tenderTypeDesc = tndrTypeObj.tenderTypeDesc.valueOf();
    }

    this._store.dispatch(addTender({ tndrObj }));

    var tktObjData  = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
    if(tktObjData == null) {
      this.route.navigate(['/checkout']);
      return;
    }

    if(this.IsTicketComplete(tktObjData) == false) {
      this.route.navigate(['/splitpay']);
      return;
    }
    
    if(tktObjData != null) {
      this._store.dispatch(saveCompleteTicketSplit({ tktObj:  tktObjData}));
    }
    this.route.navigate(['/savetktsuccess']);
}

  private IsTicketComplete(tktObj: TicketSplit): boolean {

    if(tktObj.tktList.length == 0)
      return false;

    if(tktObj.ticketTenderList.length == 0)
      return false;

    let ticketTotal = 0;
    
    for(const key in tktObj.tktList) {
      ticketTotal += Number(Number(tktObj.tktList[key].lineItemDollarDisplayAmount).toFixed(2));
    }

    //console.log('line item ticketTotal: ' + ticketTotal);

    for(const key in tktObj.associateTips) {
      ticketTotal += Number(Number(tktObj.associateTips[key].tipAmount).toFixed(2));
    }

    //console.log('line item + tips ticketTotal: ' + ticketTotal);

    let allowPartPay = this._logonDataSvc.getAllowPartPay();

    let tenderTotals = 0;

    for(const key in tktObj.ticketTenderList) {
      tenderTotals += Number(Number(tktObj.ticketTenderList[key].tenderAmount).toFixed(2));
    }

    ticketTotal = Number(Number(ticketTotal).toFixed(2));
    tenderTotals = Number(Number(tenderTotals).toFixed(2));

    //console.log('ticketTotal: ' + ticketTotal);
    //console.log('tenderTotals: ' + tenderTotals);

    if(allowPartPay && tktObj.partialAmount > 0 && tktObj.partialAmount == tenderTotals || Number(ticketTotal).toFixed(2) == Number(tenderTotals).toFixed(2)) {
      return true;
    }
    else {
      return false;
    }
  }

}
