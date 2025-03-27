import { Component, OnInit } from '@angular/core';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { resetTktObj, saveTicketSplitSuccess } from '../store/ticketstore/ticket.action';
import { SaveTicketResultsModel } from 'src/app/models/ticket.split';
import { getSavedTicketResult } from '../store/ticketstore/ticket.selector';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PinValidateComponent } from '../pin-validate/pin-validate.component';

@Component({
    selector: 'app-save-ticket-success',
    templateUrl: './save-ticket-success.component.html',
    styleUrls: ['./save-ticket-success.component.css'],
    standalone: false
})
export class SaveTicketSuccessComponent implements OnInit {

  constructor(private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _modalService: NgbModal){

  }

  saveTktRsltMdl: SaveTicketResultsModel = {} as SaveTicketResultsModel;

  tktSaveResultMessage: string = '';

  ngOnInit(): void {
    this._store.select(getSavedTicketResult).subscribe(data => {
      this.saveTktRsltMdl = data;
      this.tktSaveResultMessage = this.saveTktRsltMdl.ticketNumber > 0 ? 'Ticket save Successful' : 'Ticket saving...'
    })
  }

  ReceiptOption(optn: string) {
    this._store.dispatch(resetTktObj({dummyNumber: 0}));

    if(this._logonDataSvc.getLocationConfig().pINReqdForSalesTran) {
      this._modalService.open(PinValidateComponent);
    }
    else {
      this.route.navigate(['/salestran'])
    }
  }

}
