import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { SaleItem } from '../models/sale.item';
import { SalesTransactionCheckoutItem } from '../models/salesTransactionCheckoutItem';
import { addSaleItem } from '../store/ticketstore/ticket.action';
import { tktObjInterface } from '../store/ticketstore/ticket.state';

 
@Component({
  selector: 'app-sale-item',
  templateUrl: './sale-item.component.html',
  styleUrls: ['./sale-item.component.css']
})
export class SaleItemComponent implements OnInit {

    constructor(private _store: Store<tktObjInterface>) { }
    @Input() saleItemList: SaleItem[] = [];

    ngOnInit(): void {
    }
    
    public salesItemClick(event: Event, itemId: number): void {
        
        const saleItem = this.getSaleCheckOutItem(
        this.saleItemList.filter(itm => itm.salesItemID == itemId)[0]);
        this._store.dispatch(addSaleItem({saleItem}));        
    }

    private getSaleCheckOutItem(si: SaleItem): SalesTransactionCheckoutItem {

      let coItm: SalesTransactionCheckoutItem = {} as SalesTransactionCheckoutItem;      
      coItm.salesCategoryUID = si.salesItemID;
      coItm.salesCategoryUID = si.salesCategoryID;
      coItm.businessFunctionUID = si.businessFunctionUID;
      coItm.facilityUID = si.facilityUID;
      coItm.dCUnitPrice = si.price;
      coItm.quantity = 1;
      coItm.departmentUID = si.departmentUID;
      coItm.deptName = si.departmentName;
      coItm.dtlMaintTimestamp = si.maintTimestamp;
      return coItm;
  }
}
