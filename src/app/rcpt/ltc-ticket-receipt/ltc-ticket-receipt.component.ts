import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LTC_Ticket } from 'src/app/saletran/models/ticket.list';
import { SalesTranService } from 'src/app/saletran/services/sales-tran.service';
import { TicketLookupComponent } from 'src/app/shared/ticket-lookup/ticket-lookup.component';

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private _logonDataSvc: LogonDataService,
    private _saleTranSvc: SalesTranService,
    private _tktLookup: TicketLookupComponent,
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
