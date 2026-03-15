import { Component, OnInit } from '@angular/core';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { resetTktObj, saveTicketForGuestCheckSuccess } from '../store/ticketstore/ticket.action';
import { SaveTicketResultsModel } from 'src/app/models/ticket.split';
import { getSavedTicketResult } from '../store/ticketstore/ticket.selector';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PinValidateComponent } from '../pin-validate/pin-validate.component';
import { TicketStatusDlgComponent } from '../ticket-status-dlg/ticket-status-dlg.component';
import { TicketStatusLocationData } from '../../models/ticket.status.location.models';

@Component({
    selector: 'app-save-ticket-success',
    templateUrl: './save-ticket-success.component.html',
    styleUrls: ['./save-ticket-success.component.css'],
    standalone: false
})
export class SaveTicketSuccessComponent implements OnInit {

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true,
    size: 'lg'
  };

  ticketStatusData: TicketStatusLocationData = new TicketStatusLocationData();
  private _hasOpenedTicketStatusDialog = false;


  constructor(private _store: Store<saleTranDataInterface>,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _logonDataSvc: LogonDataService,
    private _modalService: NgbModal){

  }

  saveTktRsltMdl: SaveTicketResultsModel = {} as SaveTicketResultsModel;

  tktSaveResultMessage: string = '';
  businessFunctionCode: string = '';

  laundryBusFuncCodes: string[] = ['BUSFNC_ALT', 'BUSFNC_LNDRYCLN', 'BUSFNC_LNDRYCLN_WALT'];

  ngOnInit(): void {
    this._store.select(getSavedTicketResult).subscribe(data => {
      this.saveTktRsltMdl = data;
      this.tktSaveResultMessage = this.saveTktRsltMdl.ticketNumber > 0 ? ('Ticket save Successful')  : 'Ticket saving...';
      this._syncTicketStatusData();
      this._openTicketStatusDialogIfNeeded();
    })

    let locConfig = this._logonDataSvc.getLocationConfig();
    this.businessFunctionCode = locConfig.busFuncCode;

    if(this.laundryBusFuncCodes.includes(this.businessFunctionCode)) {
      this._openTicketStatusDialogIfNeeded();
    }

  }

  ReceiptOption(optn: string) {

    sessionStorage.setItem('inProgTranId', '0');
    sessionStorage.setItem('inProgTranTabSerialNum', '');

    let locConfig = this._logonDataSvc.getLocationConfig();
    
    this._store.dispatch(resetTktObj({ locConfig: locConfig }));

    if(locConfig.pinReqdForSalesTran) {
      this._modalService.open(PinValidateComponent);
    }
    else {
      this.route.navigate(['/salestran'])
    }
  }

  private _syncTicketStatusData(): void {
    this.ticketStatusData = Object.assign(new TicketStatusLocationData(), this.ticketStatusData, {
      balanceDue: this.saveTktRsltMdl.balanceDue ?? this.ticketStatusData.balanceDue,
      ticketNumber: this.saveTktRsltMdl.ticketNumber ?? this.ticketStatusData.ticketNumber,
      transactionID: this.saveTktRsltMdl.transactionId ?? this.ticketStatusData.transactionID,
      readyByDate: this.ticketStatusData.readyByDate ?? new Date(),
      tktStatusId: this.ticketStatusData.tktStatusId || 1,
    });
  }

  private _openTicketStatusDialogIfNeeded(): void {
    if (this._hasOpenedTicketStatusDialog) {
      return;
    }

    if (!this.laundryBusFuncCodes.includes(this.businessFunctionCode)) {
      return;
    }

    if ((this.saveTktRsltMdl.ticketNumber ?? 0) <= 0) {
      return;
    }

    this._hasOpenedTicketStatusDialog = true;

    const modalRef = this._modalService.open(TicketStatusDlgComponent, this.modalOptions);
    modalRef.componentInstance.title = 'Ticket Status';
    modalRef.componentInstance.ticketStatus = Object.assign(new TicketStatusLocationData(), this.ticketStatusData);
    modalRef.componentInstance.showBalanceFields = (this.ticketStatusData.balanceDue ?? 0) > 0;

    modalRef.result.then((ticketStatus?: TicketStatusLocationData) => {
      if (ticketStatus) {
        this.ticketStatusData = Object.assign(new TicketStatusLocationData(), ticketStatus);
      }
    }).catch(() => undefined);
  }

}
