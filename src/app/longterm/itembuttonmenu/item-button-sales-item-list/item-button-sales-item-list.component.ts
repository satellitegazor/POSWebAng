import { Component, Input } from '@angular/core';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { saleTranDataInterface } from '../../saletran/store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SaleItem } from '../../models/sale.item';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';

@Component({
  selector: 'app-item-button-sales-item-list',
  templateUrl: './item-button-sales-item-list.component.html',
  styleUrl: './item-button-sales-item-list.component.css',
  standalone: false
})
export class ItemButtonSalesItemListComponent {
deleteItem(_t14: SaleItem) {
throw new Error('Method not implemented.');
}
moveItemDown(_t15: number) {
throw new Error('Method not implemented.');
}
moveItemUp(_t15: number) {
throw new Error('Method not implemented.');
}
setDefaultTax(_t14: SaleItem) {
throw new Error('Method not implemented.');
}

  constructor(private _logonDataSvc: LogonDataService, private _store: Store<saleTranDataInterface>) { }
  @Input() saleItemList: SaleItem[] = [];
  @Input() salesItemListRefreshEvent: Observable<boolean> = new Observable<boolean>();
  
  activeId: number = 0;
  ngOnInit(): void {
    if (this.saleItemList.length > 0) {
      this.activeId = this.saleItemList[0].salesItemID;
    }

    this.salesItemListRefreshEvent.subscribe(data => {
      //console.log('subscription called salesitmListRefresh: ' + data);
      if (data) {
        this.activeId = this.saleItemList[0].salesItemID;
      }
    });
  }

  public salesItemClick(event: Event, itemId: number): void {

    const saleCheckoutItem = this.getSaleCheckOutItem(
      this.saleItemList.filter(itm => itm.salesItemID == itemId)[0]);

    // saleCheckoutItem.srvdByAssociateText = this._logonDataSvc.getLTVendorLogonData().associateName;
    // this._store.dispatch(addSaleItem({ saleItem: saleCheckoutItem }));
    // if (this._logonDataSvc.getAllowTips()) {

    //   this._store.dispatch(updateServedByAssociate({
    //     saleItemId: saleCheckoutItem.salesItemUID, indx: 0,
    //     indLocId: saleCheckoutItem.srvdByAssociateVal, srvdByAssociateName: saleCheckoutItem.srvdByAssociateText
    //   }))
    // }
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
