import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TenderStatusType, TicketTender, TranStatusType } from 'src/app/models/ticket.tender';
import { getBalanceDue, getTktObjSelector, getTicketTendersSelector, getBalanceDueFC, getTicketTotalToPayDC, getTicketTotalToPayNDC } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { SalesTranService } from '../../services/sales-tran.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { TenderType, TenderTypeModel } from '../../../models/tender.type';
import { firstValueFrom, forkJoin, Subscription, take } from 'rxjs';
import { TipsModalDlgComponent } from '../../checkout/tips-modal-dlg/tips-modal-dlg.component';
import { updateCheckoutTotals, addTender, saveTicketForGuestCheck, removeTndrWithSaveCode, saveTenderObj, saveCompleteTicketSplit, markTendersComplete, markTicketComplete } from '../../store/ticketstore/ticket.action';
import { AlertModalComponent } from 'src/app/alert-modal/alert-modal.component';
import { UtilService } from 'src/app/services/util.service';
import { CPOSWebSvcService } from '../../services/cposweb-svc.service';
import { TenderUtil } from '../tender-util';
import { RedeemGiftCardTenders } from '../redeem-gift-card-tenders';
import { ToastService } from 'src/app/services/toast.service';
import { TicketSplit } from 'src/app/models/ticket.split';

@Component({
  selector: 'app-split-pay',
  templateUrl: './split-pay.component.html',
  styleUrls: ['./split-pay.component.css'],
  standalone: false
})
export class SplitPayComponent implements OnInit, AfterViewInit {
  @ViewChild('dcTndrAmt') dcTndrAmtInput!: ElementRef;

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false
  };

  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;
  yetToPayDC: any;
  yetToPayNDC: any;

  constructor(private _saleTranSvc: SalesTranService,
    private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService,
    private modalService: NgbModal,
    private _store: Store<saleTranDataInterface>,
    private router: Router,
    private activRoute: ActivatedRoute,
    private _utlSvc: UtilService,
    private _cposWebSvc: CPOSWebSvcService,
    private _toastSvc: ToastService) { }

  tndrs: TicketTender[] = [];
  totalToPayDC: number = 0;
  totalToPayNDC: number = 0;
  defaultCurrCode: string = 'USD';
  nonDefaultCurrCode: string = 'EUR';
  private routeSubscription: Subscription = {} as Subscription;
  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;

  tenderDescrition (tndrCode: string): string {
    return this._utlSvc.tenderCodeDescMap.get(tndrCode) || '';
  }

  async ngOnInit(): Promise<void> {

    //console.log('SplitPay component ngOnInit called');
    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();
    this.dcCurrSymbl = this._utlSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode());
    this.ndcCurrSymbl = this._utlSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode());

    this.tenderButtonUIDisplay();

    this.routeSubscription = this.activRoute.paramMap.subscribe(params => {
      const id = params.get('id');
    });

    let paidSoFarDC: number = 0;
    let paidSoFarNDC: number = 0;

    forkJoin([
      this._store.select(getTicketTotalToPayDC).pipe(take(1)),
      this._store.select(getTicketTotalToPayNDC).pipe(take(1)),
      this._store.select(getTicketTendersSelector).pipe(take(1))
    ]).subscribe(([totalDC, totalNDC, tndrs]) => {

      this.totalToPayDC = totalDC;
      this.totalToPayNDC = totalNDC;
      this.tndrs = tndrs?.filter(t => t.tenderTypeCode != 'SV') || [] as TicketTender[];

      this.tndrs.forEach(t => {
        paidSoFarDC += t.tenderAmount;
        paidSoFarNDC += t.fcTenderAmount;
      });

      this.yetToPayDC = Number(Number(this.totalToPayDC - paidSoFarDC).toFixed(2));
      this.yetToPayNDC = Number(Number(this.totalToPayNDC - paidSoFarNDC).toFixed(2));

      if (this.yetToPayDC < 0) {
        this.yetToPayDC = 0;        
        if(this.checkIfTendersComplete()) {
          this.saveCompleteTicketSplit();
        }
      }
    });

    this.defaultCurrCode = this._logonDataSvc.getDfltCurrCode();
    this.nonDefaultCurrCode = this._logonDataSvc.getNonDfltCurrCode();
  }

  async saveCompleteTicketSplit() {
    this._store.dispatch(markTendersComplete({ status: TenderStatusType.Complete }));
    this._store.dispatch(markTicketComplete({ status: TranStatusType.Complete }));
    var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
    if (tktObjData != null) {
      this._store.dispatch(saveCompleteTicketSplit({ tktObj: tktObjData }));
      this.router.navigate(['/savetktsuccess']);
    }
  }

  checkIfTendersComplete(): boolean {

    if (this.yetToPayDC <= 0) {
      if (this.tndrs.filter(t => t.tenderTypeCode == "GC" && t.isAuthorized == false).length > 0) {
        // Redeem Gift Card Tenders
        return new RedeemGiftCardTenders().redeem(this._store, this._cposWebSvc, this._logonDataSvc, this._toastSvc);
      }
      else {
        return true;
      }

      //   this.tndrs.filter(t => t.tenderTypeCode == "GC").forEach(t => {
      //     this._cposWebSvc.GiftCardRedeem(t.tenderTransactionId, t.ticketTenderId, 0, t.inStoreCardNbrTmp, t.tenderAmount).subscribe({
      //       next: (data) => {
      //         // Handle successful response
      //         if (data.rslt.IsSuccessful) {
      //           if(data.AuthorizedAmount < t.tenderAmount) {
      //             // Handle insufficient authorized amount
      //             //console.error('Gift Card Redemption Failed: Authorized amount is less than tender amount.');
      //             let tndrCopy = TenderUtil.copyTenderObj(t);
      //             tndrCopy.tenderAmount = data.AuthorizedAmount;
      //             tndrCopy.fcTenderAmount = data.AuthorizedAmount * this._logonDataSvc.getExchangeRate();
      //             tndrCopy.isAuthorized = true;
      //             tndrCopy.authNbr = data.ApprovalCode;
      //             tndrCopy.cardEndingNbr = data.CardEndingNbr;
      //             tndrCopy.traceId = "false";
      //             tndrCopy.tenderAmount = data.AuthorizedAmount;
      //             tndrCopy.fcTenderAmount = data.AuthorizedAmount * this._logonDataSvc.getExchangeRate();
      //             this._store.dispatch(addTender({ tndrObj: tndrCopy })); 
      //             this._store.dispatch(saveTenderObj({ tndrObj: tndrCopy }));
      //             this.router.navigate(['/splitpay']);
      //             return;
      //           }
      //           // Successful redemption logic here
      //           //console.log('Gift Card Redeemed Successfully');
      //         } else {
      //           // Handle error response
      //           //console.error('Gift Card Redemption Failed: ' + data.rslt.ReturnMsg);
      //         }
      //       },
      //       error: (error) => {
      //         // Handle HTTP or network errors
      //         //console.error('Error occurred during Gift Card Redemption: ', error);
      //       }
      //   });
      //   return true;
      // });
    }
    else {
      return true;
    }
  }

  ngAfterViewInit(): void {
    // Focus on dcTndrAmt input after component rendering is complete
    if (this.dcTndrAmtInput) {
      this.dcTndrAmtInput.nativeElement.focus();
    }
  }

  public tenderButtonUIDisplay(): void {

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr) => tndr.isRefundType == false);
    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length); // +1 for split pay button
  }

  PaymentAmountChanged(evt: any) {

    ////console.log('SplitPay component TipAmountChanged called with event:', evt);
    if (Number(Number(evt.target.value).toFixed(2)) > this.totalToPayDC) {
      evt.target.value = Number(Number(this.totalToPayDC).toFixed(2));
      const modalRef = this.modalService.open(AlertModalComponent, this.modalOptions);
      modalRef.componentInstance.title = 'Tender Amount Exceeds Total';
      modalRef.componentInstance.message = 'The tender amount cannot exceed the total amount due.';
      //modalRef.componentInstance.options = this.modalOptions;
      modalRef.result.then(() => {
        //console.log('Alert modal closed');
      }, () => {
        //console.log('Alert modal dismissed');
      });
      return;
    }
    this.yetToPayDC = evt.target.value;
    this.yetToPayNDC = Number(Number(this.yetToPayDC * this._logonDataSvc.getExchangeRate()).toFixed(2));
  }

  async btnTndrClick(evt: Event) {

    //console.log('SplitPay component btnTndrClick called with event:', evt);
    this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    let tndrCode = (evt.target as Element).id
    let busMdl = this._logonDataSvc.getBusinessModel()

    let tndrCompRoute = '';
    switch (tndrCode) {
      case 'CC':
        tndrCompRoute = 'cctender';
        break;
      case 'EG':
      case 'RC':
        tndrCompRoute = 'eaglecash';
        break;
      case 'CA':
      case 'CR':
        tndrCompRoute = 'cashcheck';
        break;
      case 'XC':
      case 'XR':
      case 'MS':
      case 'MR':
        tndrCompRoute = 'pinpadtran';
        break;
      case 'GC':
        tndrCompRoute = 'gcinquiry';
        break;
    }


    this.router.navigate([tndrCompRoute], { queryParams: { code: tndrCode, tenderAmount: this.yetToPayDC, tenderAmountFC: this.yetToPayNDC } })

  }

}
