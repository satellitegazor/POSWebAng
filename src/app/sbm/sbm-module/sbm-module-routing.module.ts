import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SbmLoginComponent } from '../sbm-login/sbm-login.component';
import { ContractListingComponent } from '../contract-listing/contract-listing.component';

const routes: Routes = [  
  { path: 'logon', component: SbmLoginComponent },
  { path: 'clist', component: ContractListingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SbmRoutingModule { }
