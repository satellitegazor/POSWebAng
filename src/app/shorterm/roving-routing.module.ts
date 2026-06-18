import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RovLogonComponent } from './ui-components/logon/rov-logon.component';
import { RovMainMenuComponent } from './ui-components/menu/main-menu/rov-main-menu.component';
import { Rov_SalesTranCheckoutItem } from './models/r-salestran-checkout-item';
import { RovItemSelectionBasePageComponent } from './ui-components/rov-salestran/itemselectionpage/item-selection-base-page/rov-item-selection-base-page.component';

export const ROV_ROUTES: Routes = [
  { path: './rlogon', component: RovLogonComponent },
  { path: './rmainmenu', component: RovMainMenuComponent },
  { path: './ritemsel', component: RovItemSelectionBasePageComponent },
  { path: './rchekout', component: Rov_SalesTranCheckoutItem }
];

@NgModule({
  imports: [RouterModule.forChild(ROV_ROUTES)],
  exports: [RouterModule]
})
export class RovingRoutingModule { }
