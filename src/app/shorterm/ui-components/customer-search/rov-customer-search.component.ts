import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { LTC_Customer } from '../../../models/customer';
import { RovApiService } from '../../short-term.service';
import { PosApiService } from '../../../longterm/services/pos-api-service';
import { addCustomerId } from '../../store/ticketstore/rticket.action';
import { RovSaleTranDataInterface } from '../../store/ticketstore/rticket.state';
import { RovLogonDataService } from "../../rov-logon-data.service";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-rov-customer-search',
    templateUrl: './rov-customer-search.component.html',
    styleUrls: ['./rov-customer-search.component.css'],
    imports: [CommonModule, FormsModule]
})

export class RovCustomerSearchComponent implements OnInit {

  public data: string = '';
  constructor(private modal: NgbModal, 
    private _posLtcSvc: PosApiService, 
    private _store: Store<RovSaleTranDataInterface>,
    private _logonSvc: RovLogonDataService) 
    { }
    
  public CustomerList: LTC_Customer[] = [];

  public firstName: string = '';
  public lastName: string = '';
  public telephone: string = '';

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
    this._posLtcSvc.getCustomerLookup(this.firstName, this.lastName, this.telephone, 10).subscribe(data => {

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

  maskPhone(phone: string): string {
    if (!phone) return '';

    // Remove non-digits just in case
    const digits = phone.replace(/\D/g, '');

    if (digits.length < 7) return phone; // not enough digits to mask properly

    const firstThree = digits.substring(0, 3);
    const lastFour = digits.substring(digits.length - 4);

    return `${firstThree}-***-${lastFour}`;
  }
}
