import { Component, OnInit } from '@angular/core';
import { ModalRef } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { TicketList } from '../models/ticket.list';
import { SalesTranService } from '../services/sales-tran.service';
import { tktObjInterface } from '../store/ticketstore/ticket.state';

@Component({
  selector: 'app-ticket-lookup',
  templateUrl: './ticket-lookup.component.html',
  styleUrls: ['./ticket-lookup.component.css']
})
export class TicketLookupComponent implements OnInit {

  constructor(private modal: ModalRef, private _saleSvc: SalesTranService, private _store: Store<tktObjInterface>) { }

  locationName: string = '';
  ticketNum: string = ''; 
  firstName: string = '';
  lastName: string = '';
  telephone: string = '';

  ticketList: TicketList[] = [];

  public strongErrMessage: string = '';
  public errMessage: string = '';
  public showErrMsg: boolean = false;

  ngOnInit(): void {
  }

  ticketSelected(transactionId: string) {


  }

  search() {
    if(this.firstName == '' && this.lastName == '' && this.telephone == '') {
      this.strongErrMessage = 'Validation Error';
      this.errMessage = 'Either one of the First Name, Last Name or Telephone shall be entered for Search. Please verify.';
      this.showErrMsg = true;
      return;
    }
    this._saleSvc(this.firstName, this.lastName, this.telephone, 10).subscribe(data => {

      this._hideErrMsg();

      if(data.customers.length == 0) {
        this._showErrMsg('No Customer data found', 'No Customer found with the given data. Please try again!!');
      }

      this.CustomerList = data.customers;
    });
  }

}
