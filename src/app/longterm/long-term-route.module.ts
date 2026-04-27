import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { LongTermModule } from './long-term.module';
import { LongTermRouteRoutingModule } from './long-term-route-routing.module';
import { ItemSelectionBasePageComponent } from './saletran/itemselectionpage/item-selection-base-page/item-selection-base-page.component';
import { SaveTicketSuccessComponent } from './saletran/save-ticket-success/save-ticket-success.component';
import { ConcessionCardTndrComponent } from './saletran/tender/concession-card-tndr/concession-card-tndr.component';
import { SplitPayComponent } from './saletran/tender/split-pay/split-pay.component';
import { DeviceTndrPageComponent } from './saletran/tender/device-tndr-page/device-tndr-page.component';
import { CheckoutPageComponent } from './saletran/checkout/checkout-page/checkout-page.component';
import { EgConcTndrComponent } from './saletran/tender/eg-conc-tndr/eg-conc-tndr.component';
import { CashTndrComponent } from './saletran/tender/cash-tndr/cash-tndr.component';
//import { CanDeactivateGuard } from 'src/app/shared/can-component-deactivate';
import { CanDeactivateGuard } from '../shared/can-component-deactivate'
import { ItemButtonPageComponent } from './itembuttonmenu/item-button-page/item-button-page.component';
import { AdminMenuComponent } from './menu/admin-menu/admin-menu.component';
import { GiftCardInquiryComponent } from './saletran/tender/gift-card-inquiry/gift-card-inquiry.component';
import { MainMenuComponent } from './menu/main-menu/main-menu.component';
import { SalesTranRptPageComponent } from './reports/salestranrpt/sales-tran-rpt-page/sales-tran-rpt-page.component';
import { SettlementReportPageComponent } from './reports/settlement/settlement-report-page/settlement-report-page.component';
import { NoSaleReportPageComponent } from './reports/nosalerpt/no-sale-report-page/no-sale-report-page.component';
import { ReportsMenuComponent } from './menu/reports-menu/reports-menu.component';
import { TktReceiptComponent} from './receipt/tkt-receipt/tkt-receipt.component';
import { BalanceDueTicketsPageComponent } from './reports/balduetkts/balance-due-tickets-page/balance-due-tickets-page.component';
import { CanceledTicketsPageComponent } from './reports/cncledtkts/canceled-tickets-page/canceled-tickets-page.component';
import { CashDrawerReportPageComponent } from './reports/cashdrawrpt/cash-drawer-report-page.component'
import { PriceListRptComponent } from './reports/pricelist/price-list-rpt.component'
import { TicketStatusComponent } from './ticket-status/ticket-status.component';
import { TranDetailsComponent } from '../misc-module/tran-details/tran-details.component';
import { TicketLookupComponent } from './ticket-lookup/ticket-lookup.component';

const routes: Routes = [
  { path: 'salestran', component: ItemSelectionBasePageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'cctender', component: ConcessionCardTndrComponent },
  { path: 'savetktsuccess', component: SaveTicketSuccessComponent },
  { path: 'splitpay', component: SplitPayComponent },
  { path: 'pinpadtran', component: DeviceTndrPageComponent },
  { path: 'eaglecash', component: EgConcTndrComponent },
  { path: 'cashcheck', component: CashTndrComponent },
  { path: 'itembtnmenu', component: ItemButtonPageComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'adminmenu', component: AdminMenuComponent },
  { path: 'gcinquiry', component: GiftCardInquiryComponent },
  { path: 'mainmenu', component: MainMenuComponent },
  { path: 'rptmenu', component: ReportsMenuComponent },
  { path: 'rptsalestran', component: SalesTranRptPageComponent },
  { path: 'rptsettlement', component: SettlementReportPageComponent },
  { path: 'rptnosale', component: NoSaleReportPageComponent },
  { path: 'ltktrcpt', component: TktReceiptComponent },
  { path: 'rptbaldue', component: BalanceDueTicketsPageComponent },
  { path: 'rptcncld', component: CanceledTicketsPageComponent },
  { path: 'rptpricelist', component: PriceListRptComponent },
  { path: 'rptcashdrw', component: CashDrawerReportPageComponent },
  { path: 'ticketstatus', component: TicketStatusComponent },
  { path: 'trandtls', component: TranDetailsComponent},
  { path: 'ticketlookup', component: TicketLookupComponent}



];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LongTermRouteModule { }
