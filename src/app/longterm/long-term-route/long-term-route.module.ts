import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { LongTermModule } from '../long-term/long-term.module';
import { LongTermRouteRoutingModule } from './long-term-route-routing.module';
import { ItemSelectionBasePageComponent } from '../saletran/itemselectionpage/item-selection-base-page/item-selection-base-page.component';
import { SaveTicketSuccessComponent } from '../saletran/save-ticket-success/save-ticket-success.component';
import { ConcessionCardTndrComponent } from '../saletran/tender/concession-card-tndr/concession-card-tndr.component';
import { SplitPayComponent } from '../saletran/tender/split-pay/split-pay.component';
import { DeviceTndrPageComponent } from '../saletran/tender/device-tndr-page/device-tndr-page.component';
import { CheckoutPageComponent } from '../saletran/checkout/checkout-page/checkout-page.component';
import { EgConcTndrComponent } from '../saletran/tender/eg-conc-tndr/eg-conc-tndr.component';
import { CashTndrComponent } from '../saletran/tender/cash-tndr/cash-tndr.component';
import { CanDeactivateGuard } from 'src/app/shared/can-component-deactivate';
import { ItemButtonPageComponent } from '../itembuttonmenu/item-button-page/item-button-page.component';
import { AdminMenuComponent } from '../admin-menu/admin-menu.component';
import { GiftCardInquiryComponent } from '../saletran/tender/gift-card-inquiry/gift-card-inquiry.component';
import { MainMenuComponent } from '../menu/main-menu/main-menu.component';

const routes: Routes = [
  { path: 'salestran', component: ItemSelectionBasePageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'cctender', component: ConcessionCardTndrComponent },
  { path: 'savetktsuccess', component: SaveTicketSuccessComponent },
  { path: 'splitpay', component: SplitPayComponent },
  { path: 'pinpadtran', component: DeviceTndrPageComponent },
  { path: 'eaglecash', component: EgConcTndrComponent },
  { path: 'cashcheck', component: CashTndrComponent },
  { path: 'itembtnmenu', component: ItemButtonPageComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'adminmenu', component: AdminMenuComponent },
  { path: 'gcinquiry', component: GiftCardInquiryComponent },
  { path: 'mainmenu', component: MainMenuComponent }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LongTermRouteModule { }
