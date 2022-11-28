import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { authinterceptorProviders } from '../auth/auth.interceptor';
import { DeptListComponent } from './salesdept/deptlist.component';;
import { SalesCartComponent } from './sales-cart/sales-cart.component'
import { SalesTranRoutingModule } from './salestran.route';;
import { SalesCategoryComponent } from './sales-category/sales-category.component'
import { SharedSubjectModule } from '../shared-subject/shared-subject.module';
import { SaleItemComponent } from './sale-item/sale-item.component';
import { TktSaleItemComponent } from './tkt-sale-item/tkt-sale-item.component';
import { CustomerSearchComponent } from './customer-search/customer-search.component';
import { CustomerNewComponent } from './customer-new/customer-new.component';
import { ModalModule } from '@independer/ng-modal';
import { TicketObjService } from './ticket-obj.service';
import { CheckoutComponent } from './checkout/checkout.component';
import { StoreModule } from '@ngrx/store';
import { GET_SALE_ITEM_MENU, SHARED_SALE_ITEMS_MENU_STATE } from './saletranstore/saleitemstore/saleitem.selector';
import { GetSaleItemMenuReducer } from './saletranstore/saleitemstore/saleitem.reducers';
import { EffectsModule } from '@ngrx/effects';
import { SaleItemEffects } from './saletranstore/saleitemstore/saleitem.effects';
import { GetLocationConfigReducer } from './saletranstore/locationconfigstore/locationconfig.reducer';
import { LOC_CONFIG_STATE } from './saletranstore/locationconfigstore/locationconfig.selector';
import { LocationConfigEffects } from './saletranstore/locationconfigstore/locationconfig.effects';

@NgModule({
    declarations: [DeptListComponent, SalesCartComponent, SalesCategoryComponent, SaleItemComponent,
        TktSaleItemComponent, CustomerNewComponent, CustomerSearchComponent, CheckoutComponent],
    imports: [
        CommonModule,
        FormsModule,
        SalesTranRoutingModule,
        SharedSubjectModule,
        ModalModule,
        StoreModule.forFeature(SHARED_SALE_ITEMS_MENU_STATE, GetSaleItemMenuReducer),
        StoreModule.forFeature(LOC_CONFIG_STATE, GetLocationConfigReducer),
        EffectsModule.forFeature([SaleItemEffects]),
        EffectsModule.forFeature([LocationConfigEffects])
    ],
    providers: [authinterceptorProviders, TicketObjService]
    //exports: [VendorLTComponent, VendorSTComponent, SbmComponent]
})
export class SalesTranModule { }

