import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SalesTranService } from '../services/sales-tran.service';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { LTC_Customer } from 'src/app/models/customer';
import { Router } from '@angular/router';

@Component({
    selector: 'app-ticket-lookup',
    templateUrl: './ticket-lookup.component.html',
    styleUrls: ['./ticket-lookup.component.css'],
    standalone: false
})
export class TicketLookupComponent implements OnInit {

  constructor(private modal: NgbModal, 
    private _saleSvc: SalesTranService, 
    private _logonDataSvc: LogonDataService,
    private _store: Store<saleTranDataInterface>,
    private _route: Router) { }

    displayMsg: string = '';

  locationName: string = '';
  ticketNum: number = 0; 
  firstName: string = '';
  lastName: string = '';
  telephone: string = '';

  customerList: LTC_Customer[] = [];

  public strongErrMessage: string = '';
  public errMessage: string = '';
  public showErrMsg: boolean = false;

  ngOnInit(): void {
    this.locationName = this._logonDataSvc.getLocationConfig().locationName;
  }

  customerSelected(customerId: number) {
    this.modal.dismissAll();
    this._route.navigateByUrl('/misc/trandtls?custid=' + customerId);
  }

  search() {

    if(this.ticketNum > 0) {
      
      this.modal.dismissAll();

      this._saleSvc.getTranIdForTicketNum(this._logonDataSvc.getLocationId(), this.ticketNum, this._logonDataSvc.getLocationConfig().individualUID).subscribe(data => {
        if(data.results.success) {
          this._route.navigateByUrl('/lrcpt?tranid=' + data.transactionID);
        }
      })      
    }
    

    if(this.firstName == '' && this.lastName == '' && this.telephone == '') {
      this.strongErrMessage = 'Validation Error';
      this.errMessage = 'Either one of the First Name, Last Name or Telephone shall be entered for Search. Please verify.';
      this.showErrMsg = true;
      return;
    }
    
    this._saleSvc.getCustomerLookup(this.firstName, this.lastName, this.telephone, this._logonDataSvc.getLocationConfig().individualUID).subscribe(data => {

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
