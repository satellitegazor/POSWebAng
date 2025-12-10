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
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cash-tndr',
  imports: [CommonModule],
  templateUrl: './cash-tndr.component.html',
  styleUrl: './cash-tndr.component.css'
})
export class CashTndrComponent {

  @ViewChild('btnApprove') btnApprove!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnDecline') btnDecline!: ElementRef<HTMLButtonElement>;
  @ViewChild('btnCancel') btnCancel!: ElementRef<HTMLButtonElement>;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;
  dcCurrencyCode: string = '';
  ndcCurrencyCode: string = '';
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

  _tndrObj: TicketTender = {
    tenderTypeCode: '',
    tenderAmount: 0,
    fcTenderAmount: 0,
    tenderStatus: TenderStatusType.InProgress,
    isAuthorized: false,
    tndMaintTimestamp: new Date(),
  } as TicketTender;

  usdFastCashButtons: number[] = [];
  foreignFastCashButtons: number[] = [];

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe(params => {
      this._tndrObj.tenderTypeCode = params['code'] || 'CA';
    })

    this.dcCurrencyCode = this._logonDataSvc.getDfltCurrCode();
    this.ndcCurrencyCode = this._logonDataSvc.getNonDfltCurrCode();

    this.dcCurrSymbl =  this._utilSvc.currencySymbols.get(this.dcCurrencyCode);
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this.ndcCurrencyCode);

    this._store.select(getRemainingBal).subscribe(data => {
      this.tenderAmount = data.amountDC || 0.0;
      this.tenderAmountFC = data.amountNDC || 0.0;

      this._tndrObj = {
        ...this._tndrObj,
        tenderAmount: this.tenderAmount,
        fcTenderAmount: this.tenderAmountFC
      };
    })

    this.loadFastCashButtons();

    this._store.select(getTktObjSelector).subscribe(data => {
      if (data == null)
        return;
      //console.log("getTktObjSelector data: ", data);
      this._tktObj = data;
    })


  }

  private loadFastCashButtons(): void {
    // USD Fast Cash
    let usdFastCash = this._logonDataSvc.getLocationConfig().usdFastcash;
    
    let frgnFastCash = this._logonDataSvc.getLocationConfig().frgnFastcash;

    if (usdFastCash) {
      this.usdFastCashButtons = usdFastCash
        .split(',')
        .map((val:string) => parseFloat(val.trim()))
        .filter((val: number) => (!isNaN(val) && val >= this._tndrObj.tenderAmount!)) 
        .sort((a: number, b: number) => a - b);
    }

    // Foreign Fast Cash
    if (frgnFastCash) {
      this.foreignFastCashButtons = frgnFastCash
        .split(',')
        .map((val: string) => parseFloat(val.trim()))
        .filter((val: number) => (!isNaN(val) && val >= this._tndrObj.fcTenderAmount!))
        .sort((a: number, b: number) => a - b);
    }
  }
  // Handler for USD fast cash button click
  onUsdFastCashClick(amount: number): void {
    this._tndrObj.changeDue = amount - (this.tenderAmount || 0);
    this.btnApproveClick(new Event('click'));
  }

  // Handler for Foreign fast cash button click
  onForeignFastCashClick(amount: number): void {
    this._tndrObj.fcChangeDue = amount - (this.tenderAmountFC || 0);
    this.btnApproveClick(new Event('click'));
  }

  // Optional: Exact cash button
  onExactCash(): void {
    this.btnApproveClick(new Event('click'));
  }

  async btnApproveClick(evt: Event) {

    //this._tndrObj = JSON.parse(JSON.stringify(this._tktObj.ticketTenderList.filter(tndr => tndr.rrn == this._tndrObj.rrn)[0]))
    //console.log("btnApproveClick Tender Object before update: ", this._tndrObj);

    this._tndrObj.tenderStatus = TenderStatusType.InProgress;
    this._tndrObj.isAuthorized = true;
    this._tndrObj.tenderTypeCode = "CA";
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

  btnCancelClick($event: PointerEvent) {
    this.route.navigate(['/checkout']);
  }
  btnDeclineClick($event: PointerEvent) {
    this.route.navigate(['/checkout']);
  }
}
