import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeptListComponent } from './saletran/itemselectionpage/salesdept/deptlist.component';
import { ItemSelectionBasePageComponent } from './saletran/itemselectionpage/item-selection-base-page/item-selection-base-page.component';
import { SalesCategoryComponent } from './saletran/itemselectionpage/sales-category/sales-category.component';
import { SaleItemComponent } from './saletran/itemselectionpage/sale-item/sale-item.component';
import { TktSaleItemComponent } from './saletran/itemselectionpage/tkt-sale-item/tkt-sale-item.component';
import { CouponsModalDlgComponent } from './saletran/checkout/coupons/coupons.component';
import { PartPayComponent } from './saletran/checkout/part-pay/part-pay.component';
import { BalanceDueComponent } from './saletran/checkout/balance-due/balance-due.component';
import { SaleTotalsComponent } from './saletran/checkout/sale-totals/sale-totals.component';
import { CheckoutPageComponent } from './saletran/checkout/checkout-page/checkout-page.component';
import { CheckoutItemsComponent } from './saletran/checkout/checkout-items/checkout-items.component';
import { TipsModalDlgComponent } from './saletran/checkout/tips-modal-dlg/tips-modal-dlg.component';
import { SaveTicketSuccessComponent } from './saletran/save-ticket-success/save-ticket-success.component';
import { SplitPayComponent } from './saletran/tender/split-pay/split-pay.component';
import { PinValidateComponent } from './pin-validate/pin-validate.component';
import { ItemButtonPageComponent } from './itembuttonmenu/item-button-page/item-button-page.component';
import { ItemButtonDeptListComponent } from './itembuttonmenu/item-button-dept-list/item-button-dept-list.component';
import { ItemButtonSalesCatListComponent } from './itembuttonmenu/item-button-sales-cat-list/item-button-sales-cat-list.component';
import { ItemButtonSalesItemListComponent } from './itembuttonmenu/item-button-sales-item-list/item-button-sales-item-list.component';
import { CashTndrComponent } from './saletran/tender/cash-tndr/cash-tndr.component';
import { ConcessionCardTndrComponent } from './saletran/tender/concession-card-tndr/concession-card-tndr.component';
import { DeviceTndrPageComponent } from './saletran/tender/device-tndr-page/device-tndr-page.component';
import { EgConcTndrComponent } from './saletran/tender/eg-conc-tndr/eg-conc-tndr.component';
import { GiftCardInquiryComponent } from './saletran/tender/gift-card-inquiry/gift-card-inquiry.component';
import { MainMenuComponent } from './menu/main-menu/main-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LongTermRouteModule } from './long-term-route.module';
//import { SharedSubjectModule } from 'src/app/shared-subject/shared-subject.module';
import { SharedSubjectModule } from '../shared-subject/shared-subject.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { TKT_OBJ_STATE } from './saletran/store/ticketstore/ticket.selector';
import { TktObjReducer } from './saletran/store/ticketstore/ticket.reducer';
import { SaleItemEffects } from './saletran/store/saleitemstore/saleitem.effects';
import { EffectsModule } from '@ngrx/effects';
import { LOC_CONFIG_STATE } from './saletran/store/locationconfigstore/locationconfig.selector';
import { GetLocationConfigReducer } from './saletran/store/locationconfigstore/locationconfig.reducer';
import { LocationConfigEffects } from './saletran/store/locationconfigstore/locationconfig.effects';
import { LOC_Assoc_STATE } from './saletran/store/localtionassociates/locationassociates.selector';
import { GetLocationAssocReducer } from './saletran/store/localtionassociates/locationassociates.reducer';
import { LocationAssocEffects } from './saletran/store/localtionassociates/locationassociates.effects';
import { TicketObjectEffects } from './saletran/store/ticketstore/ticket.effects';
import { PosCurrency3Directive } from '../directives/pos-currency.directive.3';
import { PosCurrencyDirective } from '../directives/pos-currency.directive';
import { SharedModule} from '../shared/shared.module'

import { DecimalDirective } from '../directives/decimal-directive';
import { EditableButtonComponent } from './itembuttonmenu/editable-button/editable-button.component';
import { SalesTranRptDetailComponent } from './reports/salestranrpt/detail/detail.component';
import { SalesTranRptPageComponent } from './reports/salestranrpt/sales-tran-rpt-page/sales-tran-rpt-page.component';
import { CustomerSearchComponent } from './customer-search/customer-search.component';
import { TicketLookupComponent } from './ticket-lookup/ticket-lookup.component';
import { CustomerNewComponent } from './customer-new/customer-new.component';
import { TranDetailsComponent } from '../misc-module/tran-details/tran-details.component';
import { TicketStatusDlgComponent } from './saletran/ticket-status-dlg/ticket-status-dlg.component';
import { AssocMaintenanceComponent } from './menu/admin-menu/assoc-maintenance/assoc-maintenance.component';
import { SplInstrucSetupComponent } from './menu/admin-menu/spl-instruc-setup/spl-instruc-setup.component';
import { AdminMenuComponent } from './menu/admin-menu/admin-menu.component';
import { CopyAssociateLocationModalComponent } from './menu/admin-menu/assoc-maintenance/copy-associate-location-modal.component';

@NgModule({
  declarations: [DeptListComponent, ItemSelectionBasePageComponent, SalesCategoryComponent, SaleItemComponent,
    TktSaleItemComponent, CouponsModalDlgComponent, PartPayComponent, BalanceDueComponent, SaleTotalsComponent,
    CheckoutPageComponent, CheckoutItemsComponent, TipsModalDlgComponent, SaveTicketSuccessComponent,
    SplitPayComponent, PinValidateComponent,ItemButtonPageComponent, ItemButtonDeptListComponent,
    ItemButtonSalesCatListComponent, ItemButtonSalesItemListComponent, CashTndrComponent,
    ConcessionCardTndrComponent, DeviceTndrPageComponent, EgConcTndrComponent,GiftCardInquiryComponent, MainMenuComponent,
    SalesTranRptDetailComponent, SalesTranRptPageComponent, CustomerSearchComponent, TicketLookupComponent,
    CustomerNewComponent, TranDetailsComponent, TicketStatusDlgComponent, AssocMaintenanceComponent, SplInstrucSetupComponent,
    AdminMenuComponent, CopyAssociateLocationModalComponent],
  
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LongTermRouteModule,
    SharedSubjectModule,
    NgbModule,
    StoreModule.forFeature(TKT_OBJ_STATE, TktObjReducer),
    EffectsModule.forFeature([SaleItemEffects]),
    StoreModule.forFeature(LOC_CONFIG_STATE, GetLocationConfigReducer),
    EffectsModule.forFeature([LocationConfigEffects]),
    StoreModule.forFeature(LOC_Assoc_STATE, GetLocationAssocReducer),
    EffectsModule.forFeature([LocationAssocEffects]),
    EffectsModule.forFeature([TicketObjectEffects]),
    
    PosCurrencyDirective, PosCurrency3Directive,
    DecimalDirective,
    EditableButtonComponent    
  ]
})
export class LongTermModule { }
