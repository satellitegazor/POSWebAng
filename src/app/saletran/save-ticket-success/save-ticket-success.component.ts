import { Component, OnInit } from '@angular/core';
import { tktObjInterface } from '../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { saveTicketSplitSuccess } from '../store/ticketstore/ticket.action';
import { SaveTicketResultsModel } from 'src/app/models/ticket.split';
import { getSavedTicketResult } from '../store/ticketstore/ticket.selector';

@Component({
  selector: 'app-save-ticket-success',
  templateUrl: './save-ticket-success.component.html',
  styleUrls: ['./save-ticket-success.component.css']
})
export class SaveTicketSuccessComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService) {

  }

  saveTktRsltMdl: SaveTicketResultsModel = {} as SaveTicketResultsModel;

  tktSaveResultMessage: string = '';

  ngOnInit(): void {
    this._store.select(getSavedTicketResult).subscribe(data => {
      this.saveTktRsltMdl = data;
      this.tktSaveResultMessage = this.saveTktRsltMdl.ticketNumber > 0 ? 'Ticket save Successful' : 'Ticket Save Failed'
    })
  }

}
