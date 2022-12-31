
import { NgModule } from '@angular/core';
import { SalesTranModule } from './saletran.module';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { SalesCartComponent } from './sales-cart/sales-cart.component';
import { CheckoutPageComponent } from './checkout/checkout-page/checkout-page.component';
import { TenderPageComponent } from './tender-page/tender-page.component';
 
export const routes: Routes = [
    { path: '', component: SalesCartComponent},
    { path: 'salestran', component: SalesCartComponent },
    { path: 'checkout', component: CheckoutPageComponent },
    { path: 'tender', component: TenderPageComponent },
];

/*export const routing: ModuleWithProviders = RouterModule.forChild(routes)*/


//const routes: Routes = [
//    { path: '', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'vlogon', loadChildren: './logon/logon.module#LogonModule' },
//    { path: 'rlogon', loadChildren: './logon/logon.module#LogonModule' },
//];

//@NgModule({
//    imports: [RouterModule.forRoot(routes)],
//    exports: [RouterModule]
//})

export const SalesTranRoutingModule: ModuleWithProviders<SalesTranModule> = RouterModule.forChild(routes);