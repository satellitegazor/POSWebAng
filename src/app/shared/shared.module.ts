import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketLookupComponent } from './ticket-lookup/ticket-lookup.component';
import { CustomerSearchComponent } from './customer-search/customer-search.component';
import { CustomerNewComponent } from './customer-new/customer-new.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [TicketLookupComponent, CustomerSearchComponent, CustomerNewComponent],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class SharedModule { }
