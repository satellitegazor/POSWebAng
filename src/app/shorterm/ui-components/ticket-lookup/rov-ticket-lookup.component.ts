import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { PosApiService } from '../../../longterm/services/pos-api-service';
import { saleTranDataInterface } from '../../../longterm/saletran/store/ticketstore/ticket.state';
import { LTC_Customer } from '../../../models/customer';
import { Router } from '@angular/router';
import { RovLogonDataService } from "../../rov-logon-data.service";
import { RovApiService } from '../../short-term.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-rov-ticket-lookup',
  templateUrl: './rov-ticket-lookup.component.html',
    styleUrls: ['./rov-ticket-lookup.component.css'],
    imports: [CommonModule, FormsModule]
})
export class RovTicketLookupComponent implements OnInit {

  constructor(private modal: NgbModal, 
    private _rovApiSvc: RovApiService, 
    private _posApiSvc: PosApiService,
    private _logonDataSvc: RovLogonDataService,
    private _store: Store<saleTranDataInterface>,
    private _route: Router) { }

    displayMsg: string = '';

  eventName: string = '';
  public ticketNum: number = 0; 
  firstName: string = '';
  lastName: string = '';
  telephone: string = '';

  customerList: LTC_Customer[] = [];

  public strongErrMessage: string = '';
  public errMessage: string = '';
  public showErrMsg: boolean = false;

  ngOnInit(): void {
    this.eventName = this._logonDataSvc.getRovEventConfig().eventName
  }

  customerSelected(customerId: number) {
    this.modal.dismissAll();
    this._route.navigateByUrl('/rtrandtls?custid=' + customerId);
  }

  search() {

    if(this.ticketNum > 0) {
      
      this.modal.dismissAll();
      let evtConfig = this._logonDataSvc.getRovEventConfig();
      this._rovApiSvc.getTranIdForTicketNum(evtConfig.eventID, this.ticketNum, evtConfig.individualUID).subscribe(data => {
        if(data.results.success) {
          this._route.navigateByUrl('/rovtktrcpt?txnid=' + data.transactionID);
        }
      })    
    }
    
    if(this.firstName == '' && this.lastName == '' && this.telephone == '') {
      this.strongErrMessage = 'Validation Error';
      this.errMessage = 'Either one of the First Name, Last Name or Telephone shall be entered for Search. Please verify.';
      this.showErrMsg = true;
      return;
    }
    
    this._posApiSvc.getCustomerLookup(this.firstName, this.lastName, this.telephone, this._logonDataSvc.getRovEventConfig().individualUID).subscribe(data => {

      this._hideErrMsg();
      if(data.customers.length == 0) {
        this._showErrMsg('No Tickets  found', 'No Tickets found with the given data. Please try again!!');
      }
      this.customerList = data.customers;
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
}
