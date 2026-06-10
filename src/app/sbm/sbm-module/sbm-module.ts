import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SbmRoutingModule } from './sbm-module-routing.module';
import { SbmLoginComponent } from '../sbm-login/sbm-login.component';
import { ContractListingComponent } from '../contract-listing/contract-listing.component';
import { ExchangePanelComponent } from '../exchange-panel/exchange-panel.component';
import { ContractFilterDlgComponent } from '../contract-filter-dlg/contract-filter-dlg.component';
import { ContractLtcPageComponent } from '../contract-ltc-page/contract-ltc-page.component';
import { ContractRovPageComponent } from '../contract-rov-page/contract-rov-page.component';
import { PosCurrency3Directive } from '../../directives/pos-currency.directive.3';
import { SbmRovReportsMenuComponent } from '../reports/roving/reports-menu/sbm-rov-reports-menu.component';
import { SbmLtcReportsMenuComponent } from '../reports/longterm/reports-menu/sbm-ltc-reports-menu.component';
import { SbmLtcBalDueTktsPageComponent } from '../reports/longterm/balduetkts/sbm-ltc-bal-due-tkts-page.component';
import { SbmLtcNoSaleReportPageComponent } from '../reports/longterm/nosalerpt/no-sale-report-page.component';
import { SbmLtcSalesTranRptPageComponent } from '../reports/longterm/salestranrpt/sales-tran-rpt-page/sbm-ltc-sales-tran-rpt-page.component';
import { SbmLtcCanceledTicketsPageComponent } from '../reports/longterm/cncledtkts/sbm-ltc-canceled-tickets-page.component';
  

@NgModule({
  declarations: [SbmLoginComponent, ContractListingComponent, ExchangePanelComponent, 
    ContractLtcPageComponent, ContractFilterDlgComponent, ContractRovPageComponent,
    SbmRovReportsMenuComponent, SbmLtcReportsMenuComponent],
  imports: [
    CommonModule,
    FormsModule,
    PosCurrency3Directive,
    SbmRoutingModule
  ]
})
export class SbmModule { }
