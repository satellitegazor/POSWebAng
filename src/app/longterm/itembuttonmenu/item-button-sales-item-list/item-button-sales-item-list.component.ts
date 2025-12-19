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

  constructor(private _logonDataSvc: LogonDataService, private _store: Store<saleTranDataInterface>) { 

  }

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




}
