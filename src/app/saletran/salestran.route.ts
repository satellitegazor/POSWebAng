
import { NgModule } from '@angular/core';
import { SalesTranModule } from './saletran.module';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { SalesCartComponent } from './sales-cart/sales-cart.component';
import { CheckoutPageComponent } from './checkout/checkout-page/checkout-page.component';
import { TenderPageComponent } from './tender/tender-page/tender-page.component';
import { SaveTicketSuccessComponent } from './save-ticket-success/save-ticket-success.component';
import { MiscModule } from '../misc-module/misc.module';
import { SplitPayComponent } from './tender/split-pay/split-pay.component';
import { SplitTenderPageComponent } from './tender/split-tender-page/split-tender-page.component';
import { CreditCardTndrComponent } from './tender/credit-card-tndr/credit-card-tndr.component';
import { EgConcTndrComponent } from './tender/eg-conc-tndr/eg-conc-tndr.component';
import { CashTndrComponent } from './tender/cash-tndr/cash-tndr.component';

const routes: Routes = [
    { path: 'salestran', component: SalesCartComponent },
    { path: 'checkout', component: CheckoutPageComponent },
    { path: 'tender', component: TenderPageComponent },
    { path: 'savetktsuccess', component: SaveTicketSuccessComponent },
    { path: 'splitpay', component: SplitPayComponent},
    { path: 'splittender', component: SplitTenderPageComponent},
    { path: 'pinpadtran', component: CreditCardTndrComponent},
    { path: 'eaglecash', component:EgConcTndrComponent},
    { path: 'cashcheck', component:CashTndrComponent},
    //{ path: '', component: SalesCartComponent},
    //{ path: 'rlogon', loadChildren? : './misc-module/mic.module##MiscModuleRoutingModule' }
];

/*export const routing: ModuleWithProviders = RouterModule.forChild(routes)*/


//const routes: Routes = [
//    { path: '', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'vlogon', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'rlogon', loadChildren: './logon/logon.module#LogonModule' },
//];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

//export const SalesTranRoutingModule: ModuleWithProviders<SalesTranModule> = RouterModule.forChild(routes);
export class SalesTranRoutingModule {}