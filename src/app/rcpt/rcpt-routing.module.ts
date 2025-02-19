import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LtcTicketReceiptComponent } from './ltc-ticket-receipt/ltc-ticket-receipt.component';

const routes: Routes = [
  { path: '', component: LtcTicketReceiptComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RcptRoutingModule { }
