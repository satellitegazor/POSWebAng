import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RcptRoutingModule } from './rcpt-routing.module';
import { LtcTicketReceiptComponent } from './ltc-ticket-receipt/ltc-ticket-receipt.component';


@NgModule({
  declarations: [LtcTicketReceiptComponent],
  imports: [
    CommonModule,
    RcptRoutingModule
  ]
})
export class RcptModule { }
