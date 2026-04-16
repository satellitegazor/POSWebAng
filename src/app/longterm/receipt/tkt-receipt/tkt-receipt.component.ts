import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import {
  LTC_SingleTransactionResultsModel,
  LTC_Ticket
} from '../../models/ticket.list';
import { PosApiService } from '../../saletran/services/pos-api-service';

@Component({
  selector: 'app-tkt-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tkt-receipt.component.html',
  styleUrl: './tkt-receipt.component.css'
})
export class TktReceiptComponent implements OnInit {
  transactionId = 0;
  frmSalesTrnRpt = false;
  src = '';
  ticket: LTC_Ticket = {} as LTC_Ticket;
  signature: LTC_SingleTransactionResultsModel['SignatureData'] =
    {} as LTC_SingleTransactionResultsModel['SignatureData'];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly posApiService: PosApiService,
    private readonly logonDataService: LogonDataService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.transactionId = Number(params['TxnId'] ?? 0);
      this.frmSalesTrnRpt =
        String(params['frmSalesTrnRpt'] ?? '').toLowerCase() === 'true';
      this.src = String(params['src'] ?? '').toUpperCase();

      if (!this.transactionId) {
        return;
      }

      this.posApiService
        .getSingleTransaction(
          this.logonDataService.getLocationConfig().individualUID,
          this.transactionId,
          false,
          0,
          '',
          0,
          0
        )
        .subscribe((data: LTC_SingleTransactionResultsModel) => {
          this.ticket = data.ticket;
          this.signature = data.SignatureData;
        });
    });
  }

}
