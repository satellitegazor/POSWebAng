import { keyframes } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {  NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketTender } from 'src/app/models/ticket.tender';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { CustomerSearchComponent } from '../../customer-search/customer-search.component';
import { LocationConfig } from '../../models/location-config';
import { TenderType, TenderTypeModel } from '../../models/tender.type';
import { SalesTranService } from '../../services/sales-tran.service';
import { addTender, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { TipsModalDlgComponent } from '../tips-modal-dlg/tips-modal-dlg.component';

@Component({
    selector: 'app-checkout-page',
    templateUrl: './checkout-page.component.html',
    styleUrls: ['./checkout-page.component.css'],
    standalone: false
})
export class CheckoutPageComponent implements OnInit {

  constructor(private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService, private modalService: NgbModal, private _store: Store<saleTranDataInterface>,
    private router: Router) 
    { }

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

  ngOnInit(): void {


    console.log('CheckoutPage component ngOnInit called');
    this.locationConfig = this._logonDataSvc.getLocationConfig();
    this.isOConus = this.locationConfig.rgnCode != "CON";

    this._tenderTypesModel = this._logonDataSvc.getTenderTypes();
    this.isRefund = this._logonDataSvc.getTranMode();
    this.tenderButtonUIDisplay();

    this._store.select(getCheckoutItemsSelector).subscribe(items => {
      if(items == null)
        return;
      this.tenderAmount = 0;
      items.forEach(itm => {
        this.tenderAmount += itm.lineItemDollarDisplayAmount;
      })
    })
  }

  btnCustDetailsClick(evt: Event) {
    this.displayCustSearchDlg = "display";
    const modalRef = this.modalService.open(CustomerSearchComponent, {
      centered:true
    });
  }

  btnTndrClick(evt: Event) {

    this._store.dispatch(updateCheckoutTotals({logonDataSvc: this._logonDataSvc}));
    
    let tndrCode = (evt.target as Element).id
    if(this._logonDataSvc.getBusinessModel() != 5) {
      this.router.navigate(['tender'], {queryParams: {code: tndrCode}})
    }
    else {
      this.displayCustSearchDlg = "display";
      const modalRef = this.modalService.open(TipsModalDlgComponent, {

        
      });
    }
  }

  private tenderButtonUIDisplay(): void {
    
    this._displayTenders = this._tenderTypesModel.types.filter((tndr) => tndr.isRefundType == this.isRefund);
    this.tenderButtonWidthPercent = 99 / (this._displayTenders.length + 1);
  }

  closeCustSearchDlg() {
    this.displayCustSearchDlg = "none";
  }
}
