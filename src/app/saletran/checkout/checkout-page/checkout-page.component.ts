import { Component, OnInit } from '@angular/core';
import { ModalService } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { CustomerSearchComponent } from '../../customer-search/customer-search.component';
import { SalesTranService } from '../../services/sales-tran.service';
import { TicketObjService } from '../../ticket-obj.service';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  constructor(private _tktObjSvc: TicketObjService, private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService, private modalService: ModalService, private _store: Store ) { }

  displayCustSearchDlg: string = '';
  showErrMsg: boolean = false;
  strongErrMessage: string = "";
  errMessage: string = ""; 

  ngOnInit(): void {
  }

  btnCustDetailsClick(evt: Event) {
    this.displayCustSearchDlg = "display";
    const modalRef = this.modalService.open(CustomerSearchComponent, m => {
        m.data = "search customer";
    });
}    

closeCustSearchDlg() {
    this.displayCustSearchDlg = "none";
}
}
