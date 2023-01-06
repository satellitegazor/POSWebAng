import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketTender } from 'src/app/models/ticket.tender';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { CustomerSearchComponent } from '../../customer-search/customer-search.component';
import { LocationConfig } from '../../models/location-config';
import { SalesTranService } from '../../services/sales-tran.service';
import { addTender } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService, private modalService: ModalService, private _store: Store<tktObjInterface>,
    private router: Router) { }

  displayCustSearchDlg: string = '';
  showErrMsg: boolean = false;
  strongErrMessage: string = "";
  errMessage: string = "";

  locationConfig: LocationConfig = {} as LocationConfig;
  isOConus: boolean = false;
  tenderAmount: number = 0;

  ngOnInit(): void {
    console.log('CheckoutPage component ngOnInit called');
    this.locationConfig = this._logonDataSvc.getLocationConfig();
    this.isOConus = this.locationConfig.rgnCode != "CON";

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
    const modalRef = this.modalService.open(CustomerSearchComponent, m => {
      m.data = "search customer";
    });
  }

  btnTndrClick(evt: Event, tndrCode: string) {

    this.router.navigate(['tender'], {queryParams: {code: tndrCode}})
  }

  closeCustSearchDlg() {
    this.displayCustSearchDlg = "none";
  }
}
