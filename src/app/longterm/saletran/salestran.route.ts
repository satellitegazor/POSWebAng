
import { NgModule } from '@angular/core';
import { SalesTranModule } from './saletran.module';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { SalesCartComponent } from './sales-cart/sales-cart.component';
import { CheckoutPageComponent } from './checkout/checkout-page/checkout-page.component';
import { DeviceTndrPageComponent } from './tender/device-tndr-page/device-tndr-page.component';
import { SaveTicketSuccessComponent } from './save-ticket-success/save-ticket-success.component';
import { MiscModule } from '../../misc-module/misc.module';
import { SplitPayComponent } from './tender/split-pay/split-pay.component';
import { ConcessionCardTndrComponent } from './tender/concession-card-tndr/concession-card-tndr.component';
import { EgConcTndrComponent } from './tender/eg-conc-tndr/eg-conc-tndr.component';
import { CashTndrComponent } from './tender/cash-tndr/cash-tndr.component';
import { ItemButtonPageComponent } from '../itembuttonmenu/item-button-page/item-button-page.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { CanDeactivateGuard } from 'src/app/shared/can-component-deactivate';
import { GiftCardInquiryComponent } from './tender/gift-card-inquiry/gift-card-inquiry.component';

const routes: Routes = [
    { path: 'salestran', component: SalesCartComponent },
    { path: 'checkout', component: CheckoutPageComponent },
    { path: 'cctender', component: ConcessionCardTndrComponent },
    { path: 'savetktsuccess', component: SaveTicketSuccessComponent },
    { path: 'splitpay', component: SplitPayComponent},
    { path: 'pinpadtran', component: DeviceTndrPageComponent },
    { path: 'eaglecash', component:EgConcTndrComponent},
    { path: 'cashcheck', component:CashTndrComponent},
    { path: 'itembtnmenu', component: ItemButtonPageComponent, canDeactivate: [CanDeactivateGuard]},
    { path: 'adminmenu', component: AdminMenuComponent },
    { path: 'gcinquiry', component: GiftCardInquiryComponent}
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