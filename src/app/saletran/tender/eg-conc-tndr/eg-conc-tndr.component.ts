import { Component, ElementRef, ViewChild } from '@angular/core';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { UtilService } from 'src/app/services/util.service';
import { TicketSplit } from 'src/app/models/ticket.split';
import { ExchCardTndr } from 'src/app/models/exch.card.tndr';
import { firstValueFrom, Subscription, take } from 'rxjs';
import { getRemainingBal, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { TenderUtil } from '../tender-util';
import { addTender, markTendersComplete, markTicketComplete, saveCompleteTicketSplit, saveTenderObj } from '../../store/ticketstore/ticket.action';

@Component({
  selector: 'app-eg-conc-tndr',
  imports: [],
  templateUrl: './eg-conc-tndr.component.html',
  styleUrl: './eg-conc-tndr.component.css'
})
export class EgConcTndrComponent {
  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  tenderAmountFC: number | undefined;
  tenderAmount: number | undefined;

  constructor(private _cposWebSvc: CPOSWebSvcService,
    private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _utilSvc: UtilService) {
    // Initialization logic can go here if needed
  }

  private _tktObj: TicketSplit = {} as TicketSplit;
  private _captureTranResponse: ExchCardTndr = {} as ExchCardTndr;
  private subscription: Subscription = {} as Subscription;

  private _tndrObj: TicketTender = {} as TicketTender;

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe(params => {
      this._tndrObj.tenderTypeCode = params['code'];
    })

    this.dcCurrSymbl = this._logonDataSvc.getDfltCurrCode();
    this.ndcCurrSymbl = this._logonDataSvc.getNonDfltCurrCode();

    this._store.select(getRemainingBal).subscribe(data => {
      this._tndrObj.tenderAmount = data.amountDC
      this._tndrObj.fcTenderAmount = data.amountNDC;
      this.tenderAmount = data.amountDC;
      this.tenderAmountFC = data.amountNDC;
      //console.log("selector getRemainingBal Tender Amount: ", this._tndrObj.tenderAmount);
    })

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      //console.log("getTktObjSelector data: ", data);
      this._tktObj = data;
    })

  }

  async btnApproveClick(evt: Event) {

    //this._tndrObj = JSON.parse(JSON.stringify(this._tktObj.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))
    //console.log("btnApproveClick Tender Object before update: ", this._tndrObj);

    this._tndrObj.tenderStatus = TenderStatusType.InProgress;
    this._tndrObj.isAuthorized = true;
    this._tndrObj.tenderTypeCode = "EG";
    this._tndrObj.tndMaintTimestamp = new Date(Date.now());
    this._tndrObj.tenderTransactionId = this._tktObj.transactionID;
    this._store.dispatch(addTender({ tndrObj: this._tndrObj }));

    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    if (tktObjData != null && TenderUtil.IsTicketComplete(tktObjData, this._logonDataSvc.getAllowPartPay())) {
      this._store.dispatch(markTendersComplete({ status: 4 }));
      this._store.dispatch(markTicketComplete({ status: 2 }));
      this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
      this.route.navigate(['/savetktsuccess']);
    }
    else {
      this.route.navigate(['/checkout']);
    }

  }

}
