import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { authinterceptorProviders } from '../../auth/auth.interceptor';
import { DeptListComponent } from './salesdept/deptlist.component';;
import { SalesCartComponent } from './sales-cart/sales-cart.component'
import { SalesTranRoutingModule } from './salestran.route';;
import { SalesCategoryComponent } from './sales-category/sales-category.component'
import { SharedSubjectModule } from '../../shared-subject/shared-subject.module';
import { SaleItemComponent } from './sale-item/sale-item.component';
import { TktSaleItemComponent } from './tkt-sale-item/tkt-sale-item.component';
import { CustomerSearchComponent } from '../../shared/customer-search/customer-search.component';
import { CustomerNewComponent } from '../../shared/customer-new/customer-new.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { GET_SALE_ITEM_MENU, SHARED_SALE_ITEMS_MENU_STATE } from './store/saleitemstore/saleitem.selector';
import { GetSaleItemMenuReducer } from './store/saleitemstore/saleitem.reducers';
import { EffectsModule } from '@ngrx/effects';
import { SaleItemEffects } from './store/saleitemstore/saleitem.effects';
import { GetLocationConfigReducer } from './store/locationconfigstore/locationconfig.reducer';
import { LOC_CONFIG_STATE } from './store/locationconfigstore/locationconfig.selector';
import { LocationConfigEffects } from './store/locationconfigstore/locationconfig.effects';
import { LOC_Assoc_STATE } from './store/localtionassociates/locationassociates.selector';
import { LocationAssocEffects } from './store/localtionassociates/locationassociates.effects';
import { GetLocationAssocReducer } from './store/localtionassociates/locationassociates.reducer';
import { CouponsModalDlgComponent } from './checkout/coupons/coupons.component';
import { PartPayComponent } from './checkout/part-pay/part-pay.component';
import { BalanceDueComponent } from './checkout/balance-due/balance-due.component';
import { SaleTotalsComponent } from './checkout/sale-totals/sale-totals.component';
import { getTktObjSelector, TKT_OBJ_STATE } from './store/ticketstore/ticket.selector';
import { TktObjReducer } from './store/ticketstore/ticket.reducer';
import { TicketObjectEffects } from './store/ticketstore/ticket.effects';
import { CheckoutPageComponent } from './checkout/checkout-page/checkout-page.component';
import { CheckoutItemsComponent } from './checkout/checkout-items/checkout-items.component';
import { TenderPageComponent } from './tender/tender-page/tender-page.component';
import { TipsModalDlgComponent } from './checkout/tips-modal-dlg/tips-modal-dlg.component';
import { SaveTicketSuccessComponent } from './save-ticket-success/save-ticket-success.component';
import { SplitPayComponent } from './tender/split-pay/split-pay.component';
import { TicketLookupComponent } from '../../shared/ticket-lookup/ticket-lookup.component';
import { SharedModule } from '../../shared/shared.module';
import { DecimalDirective } from '../../directives/decimal-directive';
import { PinValidateComponent } from './pin-validate/pin-validate.component';
import { PosCurrencyDirective } from '../../directives/pos-currency.directive';
import { ItemButtonPageComponent } from '../itembuttonmenu/item-button-page/item-button-page.component';
import { ItemButtonDeptListComponent } from '../itembuttonmenu/item-button-dept-list/item-button-dept-list.component';
import { ItemButtonSalesCatListComponent } from '../itembuttonmenu/item-button-sales-cat-list/item-button-sales-cat-list.component';
import { ItemButtonSalesItemListComponent } from '../itembuttonmenu/item-button-sales-item-list/item-button-sales-item-list.component';
import { PosCurrency3Directive } from '../../directives/pos-currency.directive.3';


import { EditableButtonComponent } from '../itembuttonmenu/editable-button/editable-button.component';

@NgModule({
    declarations: [DeptListComponent, SalesCartComponent, SalesCategoryComponent, SaleItemComponent,
        TktSaleItemComponent,  
        CouponsModalDlgComponent, PartPayComponent, BalanceDueComponent, SaleTotalsComponent, CheckoutPageComponent, 
        CheckoutItemsComponent, TenderPageComponent, TipsModalDlgComponent, SaveTicketSuccessComponent, SplitPayComponent,
        PinValidateComponent, ItemButtonPageComponent, ItemButtonDeptListComponent, ItemButtonSalesCatListComponent, ItemButtonSalesItemListComponent],
    imports: [
        CommonModule,
        FormsModule,
        SalesTranRoutingModule,
        SharedSubjectModule,
        NgbModule,
        StoreModule.forFeature(TKT_OBJ_STATE, TktObjReducer),
        EffectsModule.forFeature([SaleItemEffects]),
        StoreModule.forFeature(LOC_CONFIG_STATE, GetLocationConfigReducer),
        EffectsModule.forFeature([LocationConfigEffects]),
        StoreModule.forFeature(LOC_Assoc_STATE, GetLocationAssocReducer),
        EffectsModule.forFeature([LocationAssocEffects]),
        StoreModule.forFeature(TKT_OBJ_STATE, TktObjReducer),
        EffectsModule.forFeature([TicketObjectEffects]),
        SharedModule,
        DecimalDirective, PosCurrencyDirective, PosCurrency3Directive,
        EditableButtonComponent
    ],
    exports: [],
    providers: [authinterceptorProviders],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],

    //exports: [VendorLTComponent, VendorSTComponent, SbmComponent]
})
export class SalesTranModule { }

