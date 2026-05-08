import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SbmRoutingModule } from './sbm-module-routing.module';
import { SbmLoginComponent } from '../sbm-login/sbm-login.component';
import { ContractListingComponent } from '../contract-listing/contract-listing.component';
  

@NgModule({
  declarations: [SbmLoginComponent, ContractListingComponent],
  imports: [
    CommonModule,
    FormsModule,
    SbmRoutingModule
  ]
})
export class SbmModule { }
