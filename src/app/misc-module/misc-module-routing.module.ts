import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiscModule } from './misc.module';
import { LtcTicketReceiptComponent } from '../rcpt/ltc-ticket-receipt/ltc-ticket-receipt.component';
import { TranDetailsComponent } from './tran-details/tran-details.component';

const routes: Routes = [
{ path: 'trandtls', component: TranDetailsComponent},
];


//export const MiscModuleRoutingModule: ModuleWithProviders<MiscModule> = RouterModule.forChild(routes);


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})

export class MiscModuleRoutingModule{}
