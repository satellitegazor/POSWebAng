import { Component, OnInit } from '@angular/core';
import { ModalRef } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { TicketList, TicketLookupModel } from '../models/ticket.list';
import { SalesTranService } from '../services/sales-tran.service';
import { tktObjInterface } from '../store/ticketstore/ticket.state';

@Component({
  selector: 'app-ticket-lookup',
  templateUrl: './ticket-lookup.component.html',
  styleUrls: ['./ticket-lookup.component.css']
})
export class TicketLookupComponent implements OnInit {

  constructor(private modal: ModalRef, private _saleSvc: SalesTranService, 
    private _logonDataSvc: LogonDataService,
    private _store: Store<tktObjInterface>) { }

    displayMsg: string = '';

  locationName: string = '';
  ticketNum: number = 0; 
  firstName: string = '';
  lastName: string = '';
  telephone: string = '';

  ticketList: TicketLookupModel[] = [];

  public strongErrMessage: string = '';
  public errMessage: string = '';
  public showErrMsg: boolean = false;

  ngOnInit(): void {
    this.locationName = this._logonDataSvc.getLocationConfig().locationName;
  }

  ticketSelected(transactionId: number) {
  }

  search() {

    

    if(this.firstName == '' && this.lastName == '' && this.telephone == '') {
      this.strongErrMessage = 'Validation Error';
      this.errMessage = 'Either one of the First Name, Last Name or Telephone shall be entered for Search. Please verify.';
      this.showErrMsg = true;
      return;
    }
    
    this._saleSvc.getTicketLookup(this._logonDataSvc.getLocationConfig().individualUID, this._logonDataSvc.getLocationId(), 
        this.ticketNum, this.telephone, this.firstName, this.lastName).subscribe(data => {

      this._hideErrMsg();

      if(data.tickets.length == 0) {
        this._showErrMsg('No Tickets  found', 'No Tickets found with the given data. Please try again!!');
      }

      this.ticketList = data.tickets;
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
    this.modal.close('');
  }
}
