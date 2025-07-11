import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TicketTender } from 'src/app/models/ticket.tender';
import { getBalanceDue, getTktObjSelector, getTicketTendersSelector, getBalanceDueFC, getRemainingBalance, getRemainingBalanceFC, getTicketTotalToPayDC, getTicketTotalToPayNDC } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { SalesTranService } from '../../services/sales-tran.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { TenderType, TenderTypeModel } from '../../models/tender.type';
import { firstValueFrom, Subscription, take } from 'rxjs';
import { TipsModalDlgComponent } from '../../checkout/tips-modal-dlg/tips-modal-dlg.component';
import { updateCheckoutTotals, addTender, saveTicketForGuestCheck, removeTndrWithSaveCode } from '../../store/ticketstore/ticket.action';


@Component({
  selector: 'app-split-pay',
  templateUrl: './split-pay.component.html',
  styleUrls: ['./split-pay.component.css'],
  standalone: false
})
export class SplitPayComponent implements OnInit {
  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;
  tenderAmountDC: any;
  tenderAmountNDC: any;

  constructor(private _saleTranSvc: SalesTranService,
    private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService,
    private modalService: NgbModal,
    private _store: Store<saleTranDataInterface>,
    private router: Router,
    private activRoute: ActivatedRoute) { }

  tndrs: TicketTender[] = [];
  ticketTotalDC: number = 0;
  ticketTotalNDC: number = 0;
  defaultCurrCode: string = 'USD';
  nonDefaultCurrCode: string = 'EUR';
  private routeSubscription: Subscription = {} as Subscription;

  ngOnInit(): void {

    console.log('SplitPay component ngOnInit called');
    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();

    this.tenderButtonUIDisplay();

    this.routeSubscription = this.activRoute.paramMap.subscribe(params => {
      const id = params.get('id');
      //console.log('SplitPay component activatedRoute param id:', id);
      // Perform actions based on the new ID
    });

    //await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));

    // this._store.select(getTktObjSelector).subscribe(data => {
    //   console.log('SplitPay component getTktObjSelector data:', data);
    //   if (data) {
    //     this.tndrs = data?.ticketTenderList;
    //   }
    // })

    this._store.select(getTicketTotalToPayDC).subscribe(data => {
      console.log('SplitPay component getRemainingBalance data:', data);
      if (data) {
        this.ticketTotalDC = data;
      }
    })

    this._store.select(getTicketTotalToPayNDC).subscribe(data => {
      console.log('SplitPay component getRemainingBalanceFC data:', data);
      if (data) {
        this.ticketTotalNDC = data;
      }
    })

    this._store.select(getTicketTendersSelector).subscribe(data => {
      //console.log('SplitPay component getTicketTendersSelector data:', data);
      if (data) {
        this.tndrs = data;
      }
    });

    this.defaultCurrCode = this._logonDataSvc.getDfltCurrCode();
    this.nonDefaultCurrCode = this._logonDataSvc.getForeignCurrCode()

  }

  public tenderButtonUIDisplay(): void {

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr) => tndr.isRefundType == false);
    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length); // +1 for split pay button
  }
  TipAmountChanged(evt: any) {
    console.log('SplitPay component TipAmountChanged called with event:', evt);
    this.tenderAmountDC = evt.target.value;
    this.tenderAmountNDC = this.tenderAmountDC * this._logonDataSvc.getExchangeRate();
    //console.log('SplitPay component TipAmountChanged tenderAmountDC:', this.tenderAmountDC);
    //console.log('SplitPay component TipAmountChanged tenderAmountNDC:', this.tenderAmountNDC);
  }

  async btnTndrClick(evt: Event) {

    console.log('SplitPay component btnTndrClick called with event:', evt);
    this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    let tndrCode = (evt.target as Element).id
    let busMdl = this._logonDataSvc.getBusinessModel()

    this.router.navigate(['splittender'], { queryParams: { code: tndrCode, tenderAmount: this.tenderAmountDC, tenderAmountFC: this.tenderAmountNDC } })

  }

}
