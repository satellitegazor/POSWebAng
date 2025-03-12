import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { CheckoutItemsComponent } from '../checkout/checkout-items/checkout-items.component';
import { SaleItem } from '../models/sale.item';
import { SalesTransactionCheckoutItem } from '../models/salesTransactionCheckoutItem';
import { addSaleItem, updateServedByAssociate } from '../store/ticketstore/ticket.action';
import { getCheckoutItemsCount } from '../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { Observable, Subject } from 'rxjs';

 
@Component({
    selector: 'app-sale-item',
    templateUrl: './sale-item.component.html',
    styleUrls: ['./sale-item.component.css'],
    standalone: false
})
export class SaleItemComponent implements OnInit {

    constructor(private _logonDataSvc: LogonDataService, private _store: Store<saleTranDataInterface>) { }
    @Input() saleItemList: SaleItem[] = [];
    @Input() salesItemListRefreshEvent: Observable<boolean> = new Observable<boolean>();
    activeId: number = 0;
    ngOnInit(): void {
      if(this.saleItemList.length > 0) {
        this.activeId = this.saleItemList[0].salesItemID;
      }

      this.salesItemListRefreshEvent.subscribe(data => {
        console.log('subscription called salesitmListRefresh: ' + data);
        if(data) {
          this.activeId = this.saleItemList[0].salesItemID;
        }
      });
    }
    
    public salesItemClick(event: Event, itemId: number): void {
        
        const saleCheckoutItem = this.getSaleCheckOutItem(
          this.saleItemList.filter(itm => itm.salesItemID == itemId)[0]);

        saleCheckoutItem.srvdByAssociateText = this._logonDataSvc.getLTVendorLogonData().associateName;
        this._store.dispatch(addSaleItem({saleItem: saleCheckoutItem}));       
        if(this._logonDataSvc.getAllowTips()) {
          
          this._store.dispatch(updateServedByAssociate({ saleItemId: saleCheckoutItem.salesItemUID, indx: 0, 
            indLocId: saleCheckoutItem.srvdByAssociateVal, srvdByAssociateName: saleCheckoutItem.srvdByAssociateText}))
        }
    }

    private getSaleCheckOutItem(si: SaleItem): SalesTransactionCheckoutItem {

      let coItm: SalesTransactionCheckoutItem = {} as SalesTransactionCheckoutItem;      
      coItm.allowPartPay = si.allowPartPay;
      coItm.allowSaveTkt = si.allowSaveTkt;
      coItm.businessFunctionUID = si.businessFunctionUID;
      coItm.couponLineItemDollarAmount = 0;
      coItm.custInfoReq = si.custInfoReq;

      coItm.departmentUID = si.departmentUID;
      coItm.deptName = si.departmentName;
      coItm.dtlMaintTimestamp = si.maintTimestamp;
      coItm.dCUnitPrice = si.price;
      coItm.dCCouponLineItemDollarAmount = 0;
      coItm.dCDiscountAmount = 0;
      coItm.dCLineItemDollarDisplayAmount = 0;
      coItm.dCLineItemTaxAmount = 0;

      coItm.facilityUID = si.facilityUID;
      coItm.fCCouponLineItemDollarAmount = 0;
      coItm.fCLineItemEnvTaxAmount = 0;
      coItm.fCLineItmKatsaCpnAmt = 0;

      coItm.exchangeCouponDiscountPct = 0;
      coItm.envrnmtlTaxPct = si.envTax != null ? si.envTax : 0;

      coItm.lineItemDollarDisplayAmount = 0;
      coItm.lineItemEnvTaxAmount = 0;
      coItm.lineItemTaxAmount = 0;
      coItm.lineItmKatsaCpnAmt = 0;
      coItm.locationUID = si.locationUID;

      coItm.noOfTags = si.noOfTags;
      coItm.openCashDrwForTips = si.openCashDrwForTips;
            
      coItm.quantity = 1;
      coItm.salesCategoryUID = si.salesCategoryID;
      coItm.salesItemDesc = si.salesItemDescription;
      coItm.salesItemUID = si.salesItemID;
      coItm.salesTaxPct = si.salesTax;

      coItm.srvdByAssociateText = this._logonDataSvc.getLTVendorLogonData().associateName;
      coItm.srvdByAssociateVal = +this._logonDataSvc.getLocationConfig().indLocUID;
      coItm.ticketDetailId = 0;

      coItm.unitPrice = si.price;
      coItm.vendorCouponDiscountPct = 0;

      coItm.exchCpnAmountDC = 0;
      coItm.exchCpnAmountNDC = 0;
      coItm.vndCpnAmountDC = 0;
      coItm.vndCpnAmountNDC = 0;

      //coItm.saleItemTotal = 0;
      
      return coItm;
  }


}
