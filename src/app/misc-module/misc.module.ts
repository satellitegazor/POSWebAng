import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { TranDetailsComponent } from './tran-details/tran-details.component';
import { MiscModuleRoutingModule } from './misc-module-routing.module';


@NgModule({
  declarations: [
    TranDetailsComponent
  ],
  imports: [
    CommonModule,
    MiscModuleRoutingModule,
    
  ]
})
export class MiscModule { }
