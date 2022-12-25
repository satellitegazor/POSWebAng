import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { getCheckoutItemsSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-checkout-items',
  templateUrl: './checkout-items.component.html',
  styleUrls: ['./checkout-items.component.css']
})
export class CheckoutItemsComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>) { }
  tktDtlItems: SalesTransactionCheckoutItem[] = [];
  ngOnInit(): void {
    
    this._store.select(getCheckoutItemsSelector).subscribe(saleItems => {
      this.tktDtlItems = saleItems == null ? [] : saleItems;
    })
  }

  btnAddRemove() {}

  btnCancelClicked() {}

}
