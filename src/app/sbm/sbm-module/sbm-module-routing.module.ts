import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SbmLoginComponent } from '../sbm-login/sbm-login.component';
import { ContractListingComponent } from '../contract-listing/contract-listing.component';
import { ContractLtcPageComponent } from '../contract-ltc-page/contract-ltc-page.component';
import { ContractRovPageComponent } from '../contract-rov-page/contract-rov-page.component';
import { SbmRovReportsMenuComponent } from '../reports/roving/reports-menu/sbm-rov-reports-menu.component';
import { SbmLtcCanceledTicketsPageComponent } from '../reports/longterm/cncledtkts/canceled-tickets-page.component';
import { SbmLtcSalesTranRptPageComponent } from '../reports/longterm/salestranrpt/sales-tran-rpt-page/sbm-ltc-sales-tran-rpt-page.component';
import { SbmLtcNoSaleReportPageComponent } from '../reports/longterm/nosalerpt/no-sale-report-page.component';
import { SbmLtcBalDueTktsPageComponent } from '../reports/longterm/balduetkts/sbm-ltc-bal-due-tkts-page.component';
import { SbmLtcReportsMenuComponent } from '../reports/longterm/reports-menu/sbm-ltc-reports-menu.component';
import { SbmLtcPriceListRptComponent } from '../reports/longterm/pricelist/price-list-rpt.component';
import { SbmLtcSettlementReportPageComponent } from '../reports/longterm/settlement/settlement-report-page/settlement-report-page.component';

const routes: Routes = [  
  { path: 'logon', component: SbmLoginComponent },
  { path: 'clist', component: ContractListingComponent },
  { path: 'ltcpage', component: ContractLtcPageComponent },
  { path: 'rovpage', component: ContractRovPageComponent },
  { path: 'sbmrovrptmenu', component: SbmRovReportsMenuComponent },
  { path: 'sbmltcrptmenu', component: SbmLtcReportsMenuComponent },
  { path: 'sbmltcbalduerpt', component: SbmLtcBalDueTktsPageComponent },
  { path: 'sbmltcnosalerpt', component: SbmLtcNoSaleReportPageComponent },
  { path: 'sbmltcsalestranrpt', component: SbmLtcSalesTranRptPageComponent },
  { path: 'sbmltccanceledrpt', component: SbmLtcCanceledTicketsPageComponent },
  { path: 'sbmltccashdrawrpt', component: SbmLtcBalDueTktsPageComponent }, // Placeholder until cash drawer report component is created
  { path: 'sbmltcpricelistrpt', component: SbmLtcPriceListRptComponent },
  { path: 'sbmltcsetlmntrpt', component: SbmLtcSettlementReportPageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SbmRoutingModule { }
