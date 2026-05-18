import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SbmRoutingModule } from './sbm-module-routing.module';
import { SbmLoginComponent } from '../sbm-login/sbm-login.component';
import { ContractListingComponent } from '../contract-listing/contract-listing.component';
import { ExchangePanelComponent } from '../exchange-panel/exchange-panel.component';
import { ContractFilterDlgComponent } from '../contract-filter-dlg/contract-filter-dlg.component';
import { ContractLtcPageComponent } from '../contract-ltc-page/contract-ltc-page.component';
import { ContractRovPageComponent } from '../contract-rov-page/contract-rov-page.component';
  

@NgModule({
  declarations: [SbmLoginComponent, ContractListingComponent, ExchangePanelComponent, 
      ContractLtcPageComponent, ContractFilterDlgComponent, ContractRovPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SbmRoutingModule
  ]
})
export class SbmModule { }
