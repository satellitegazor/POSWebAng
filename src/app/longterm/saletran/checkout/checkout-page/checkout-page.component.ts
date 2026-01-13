import { keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap'
import { select, Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TenderStatusType, TicketTender } from 'src/app/models/ticket.tender';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { CustomerSearchComponent } from '../../../../shared/customer-search/customer-search.component';
import { LocationConfig } from '../../../models/location-config';
import { TenderType, TenderTypeModel } from '../../../models/tender.type';
import { SalesTranService } from '../../services/sales-tran.service';
import { addTender, removeTndrWithSaveCode, saveTicketForGuestCheck, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { TipsModalDlgComponent } from '../tips-modal-dlg/tips-modal-dlg.component';
import { firstValueFrom, Observable, Subscription, take } from 'rxjs';
import { TicketSplit } from 'src/app/models/ticket.split';
import { DailyExchRate } from 'src/app/models/exchange.rate';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css'],
  standalone: false
})
export class CheckoutPageComponent implements OnInit {


     modalOptions: NgbModalOptions = {
          backdrop: 'static',
          keyboard: false,
          centered: true
      };

  constructor(private _saleTranSvc: SalesTranService, 
    private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService, 
    private modalService: NgbModal, 
    private _store: Store<saleTranDataInterface>,
    private router: Router,
    private _utilSvc: UtilService) { }

  displayCustSearchDlg: string = '';
  showErrMsg: boolean = false;
  strongErrMessage: string = "";
  errMessage: string = "";

  locationConfig: LocationConfig = {} as LocationConfig;
  isOConus: boolean = false;
  tenderAmount: number = 0;

  _tenderTypesModel: TenderTypeModel = {} as TenderTypeModel;
  _displayTenders: TenderType[] = [];
  tenderButtonWidthPercent: number = 0;
  isRefund: boolean = false;

  public ngOnInit(): void {

    //console.log('CheckoutPage component ngOnInit called');
    this.locationConfig = this._logonDataSvc.getLocationConfig();
    this.isOConus = this.locationConfig.rgnCode != "CON";

    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();
    this.isRefund = this._logonDataSvc.getTranMode();
    this.tenderButtonUIDisplay();

    this._store.select(getCheckoutItemsSelector).subscribe(items => {
      if (items == null)
        return;
      this.tenderAmount = 0;
      items.forEach(itm => {
        this.tenderAmount += itm.lineItemDollarDisplayAmount;
      })
    })
  }

  btnCustDetailsClick(evt: Event) {
    this.displayCustSearchDlg = "display";
    const modalRef = this.modalService.open(CustomerSearchComponent, this.modalOptions);
  }

  async btnTndrClick(evt: Event) {

    this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    let tndrCode = (evt.target as Element).id
    if (this._logonDataSvc.getBusinessModel() != 5 || tndrCode == "CA") {
      this.router.navigate([this._utilSvc.tenderCodePageMap.get(tndrCode)], { queryParams: { code: tndrCode } })
    }
    else {

      this.displayCustSearchDlg = "display";

      let tndrObj: TicketTender = new TicketTender();
      tndrObj.tenderTypeCode = "SV";
      tndrObj.tenderAmount = this.tenderAmount;
      tndrObj.fcTenderAmount = this.tenderAmount * this._logonDataSvc.getExchangeRate();
      tndrObj.tndMaintTimestamp = new Date(Date.now())
      tndrObj.rrn = this._utilSvc.getUniqueRRN();
      tndrObj.tenderStatus = TenderStatusType.Complete;
      tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;

      this._store.dispatch(addTender({ tndrObj }));

      var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
      if (tktObjData) {
        this._store.dispatch(saveTicketForGuestCheck({ tktObj: tktObjData }));        
      }

      if (tktObjData?.tipAmountDC == 0) {
        const modalRef = this.modalService.open(TipsModalDlgComponent, this.modalOptions);
        modalRef.componentInstance.tndrCode = tndrCode;
      }
      else {
        this.router.navigate([this._utilSvc.tenderCodePageMap.get(tndrCode)], { queryParams: { code: tndrCode } })
      }
    }
  }

  async btnSplitPayClick(evt: Event) {
    this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));

    let tndrCode = (evt.target as Element).id
    if (this._logonDataSvc.getBusinessModel() != 5) {
      this.router.navigate(['splitpay'], { queryParams: { code: tndrCode } })
    }
    else {
      //this.displayCustSearchDlg = "display";

      let tndrObj: TicketTender = new TicketTender();
      tndrObj.tenderTypeCode = "SV";
      tndrObj.tenderAmount = this.tenderAmount;
      tndrObj.fcTenderAmount = this.tenderAmount * this._logonDataSvc.getExchangeRate();
      tndrObj.tndMaintTimestamp = new Date(Date.now())
      //tndrObj.currCode = this._logonDataSvc.getLocationConfig().defaultCurrency;
      tndrObj.fcCurrCode = this._logonDataSvc.getLocationConfig().currCode;
      this._store.dispatch(addTender({ tndrObj }));

      var tktObjData = await firstValueFrom(this._store.pipe(select(getTktObjSelector), take(1)));
      if (tktObjData) {
        this._store.dispatch(saveTicketForGuestCheck({ tktObj: tktObjData }));
        this._store.dispatch(removeTndrWithSaveCode({ tndrCode: "SV" }))
      }      

      if (tktObjData?.tipAmountDC == 0) {
        const modalRef = this.modalService.open(TipsModalDlgComponent, this.modalOptions);
        modalRef.componentInstance.tndrCode = tndrCode;
      }
      else {
        this.router.navigate(['splitpay'], { queryParams: { code: tndrCode } })
      }
    }
  }

  public tenderButtonUIDisplay(): void {

    this._displayTenders = this._tenderTypesModel.types?.filter((tndr) => tndr.isRefundType == this.isRefund);
    this.tenderButtonWidthPercent = 99 / (this._displayTenders?.length + (this.isRefund ? 1 : 2)); // +1 for split pay button
  }

  closeCustSearchDlg() {
    this.displayCustSearchDlg = "none";
  }
}
