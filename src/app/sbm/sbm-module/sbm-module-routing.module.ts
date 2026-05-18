import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SbmLoginComponent } from '../sbm-login/sbm-login.component';
import { ContractListingComponent } from '../contract-listing/contract-listing.component';
import { ContractLtcPageComponent } from '../contract-ltc-page/contract-ltc-page.component';
import { ContractRovPageComponent } from '../contract-rov-page/contract-rov-page.component';

const routes: Routes = [  
  { path: 'logon', component: SbmLoginComponent },
  { path: 'clist', component: ContractListingComponent },
  { path: 'ltcpage', component: ContractLtcPageComponent },
  { path: 'rovpage', component: ContractRovPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SbmRoutingModule { }
