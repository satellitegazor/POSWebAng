import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from '../../global/logon-data-service.service';
import { LTC_Ticket } from '../../longterm/models/ticket.list';
import { PosApiService } from '../../longterm/services/pos-api-service';
import { TicketLookupComponent } from '../../longterm/ticket-lookup/ticket-lookup.component';
import { TicketStatusComponent } from '../../longterm/ticket-status/ticket-status.component';

@Component({
    selector: 'app-ltc-ticket-receipt',
    templateUrl: './ltc-ticket-receipt.component.html',
    styleUrls: ['./ltc-ticket-receipt.component.css'],
    standalone: false
})
export class LtcTicketReceiptComponent implements OnInit {
   modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false
    };
  ticket: LTC_Ticket = {} as LTC_Ticket;
  ticketTotal: number = 0;
  tranId: number = 0;

  bDisplayAddlTagsBtn: boolean = false;
  bDisplayCheckoutBtn: boolean = false;
  bDisplayTicketStatusBtn: boolean = false;
  bDisplayCancelTicketBtn: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _logonDataSvc: LogonDataService,
    private _saleTranSvc: PosApiService,
    private _tktLookup: TicketLookupComponent,
    private _tktStatusDlg: TicketStatusComponent,
    private _router: Router,
    private _modalService: NgbModal) { 

  }

  ngOnInit(): void {
    
    this.activatedRoute.queryParams.subscribe(params => {
      this.tranId = params['tranid'];

      this._saleTranSvc.getSingleTransaction(this._logonDataSvc.getLocationConfig().individualUID,
        this.tranId, false, 0, '', 0, 0 ).subscribe(data => {

          this.ticket = data.ticket;

          for (let i = 0; i < data.ticket.items.length; i++) {
            this.ticketTotal += data.ticket.items[i].lineItemDollarDisplayAmount;
          }

          data.ticket.tenders.length == 0 ? this.bDisplayCheckoutBtn = true : this.bDisplayCheckoutBtn = false;
          let busFuncCode = this._logonDataSvc.getLocationConfig().busFuncCode;
          (busFuncCode == 'BUSFNC_LNDRYCLN' || busFuncCode == 'BUSFNC_LNDRYCLN_WALT') ? this.bDisplayAddlTagsBtn = true : this.bDisplayAddlTagsBtn = false;
          (busFuncCode == 'BUSFNC_LNDRYCLN' || busFuncCode == 'BUSFNC_LNDRYCLN_WALT') ? this.bDisplayCancelTicketBtn = true : this.bDisplayCancelTicketBtn = false;
          (busFuncCode == 'BUSFNC_LNDRYCLN' || busFuncCode == 'BUSFNC_LNDRYCLN_WALT') ? this.bDisplayTicketStatusBtn = true : this.bDisplayTicketStatusBtn = false;

        });
    })
  }

  btnPrintReceipt(evt: any) {}
  btnEReceipt(evt: any) {}
  btnTranDetails(evt: any) {}
  btnTktLookup(evt: any) {
    this._modalService.open(this._tktLookup, this.modalOptions);
  }
  btnSalesTran(evt: any) {
    this._router.navigateByUrl("/salestran")

  }

}
