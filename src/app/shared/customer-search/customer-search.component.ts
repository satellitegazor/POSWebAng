import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { LTC_Customer } from 'src/app/models/customer';
import { SalesTranService } from '../../longterm/saletran/services/sales-tran.service'; 
import { addCustomerId } from '../../longterm/saletran/store/ticketstore/ticket.action';
import { saleTranDataInterface } from '../../longterm/saletran/store/ticketstore/ticket.state';
import { LogonDataService } from 'src/app/global/logon-data-service.service';

@Component({
    selector: 'app-customer-search',
    templateUrl: './customer-search.component.html',
    styleUrls: ['./customer-search.component.css'],
    standalone: false
})

export class CustomerSearchComponent implements OnInit {

  data: string = '';
  constructor(private modal: NgbModal, private _saleSvc: SalesTranService, 
    private _store: Store<saleTranDataInterface>,
    private _logonSvc: LogonDataService) { }
  CustomerList: LTC_Customer[] = [];

  firstName: string = '';
  lastName: string = '';
  telephone: string = '';

  public strongErrMessage: string = '';
  public errMessage: string = '';
  public showErrMsg: boolean = false;
  ngOnInit(): void {
  }

  search() {

    if(this.firstName == '' && this.lastName == '' && this.telephone == '') {
      this.strongErrMessage = 'Validation Error';
      this.errMessage = 'Either one of the First Name, Last Name or Telephone shall be entered for Search. Please verify.';
      this.showErrMsg = true;
      return;
    }
    this._saleSvc.getCustomerLookup(this.firstName, this.lastName, this.telephone, 10).subscribe(data => {

      this._hideErrMsg();

      if(data.customers.length == 0) {
        this._showErrMsg('No Customer data found', 'No Customer found with the given data. Please try again!!');
      }

      this.CustomerList = data.customers;
    });
  }

  private _hideErrMsg() {
    this.showErrMsg = false;
    this.strongErrMessage = '';
    this.errMessage = '';  
  }

  private _showErrMsg(titleErrMsg: string, errMsg: string) {
    this.showErrMsg = true;
    this.strongErrMessage = titleErrMsg;
    this.errMessage = errMsg;  
  }

  cancel() {
    this.modal.dismissAll('');
  }

  newcust() {}

  customerSelected(custId: number) {
    
    this._store.dispatch(addCustomerId({custId}));    
    this.cancel();
  }
}
