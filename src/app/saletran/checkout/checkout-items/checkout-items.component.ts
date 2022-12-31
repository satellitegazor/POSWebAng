import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LocationConfig } from '../../models/location-config';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { updateSaleitems } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-checkout-items',
  templateUrl: './checkout-items.component.html',
  styleUrls: ['./checkout-items.component.css']
})
export class CheckoutItemsComponent implements OnInit {

  constructor(private _store: Store<tktObjInterface>, private _logonDataSvc: LogonDataService) { }

  allowTips: boolean = false;
  tktDtlItems: SalesTransactionCheckoutItem[] = [];
  locationConfig: LocationConfig = {} as LocationConfig;

  subTotal: number = 0;
  exchCpnTotal: number = 0;
  saleTaxTotal: number = 0;
  tipsTotal: number = 0;
  grandTotal: number = 0;
  totalSavings: number = 0;
  vndDiscountTotal: number = 0;

  ngOnInit(): void {

    this.locationConfig = this._logonDataSvc.getLocationConfig();

    this._store.select(getCheckoutItemsSelector).subscribe(saleItems => {
      this.tktDtlItems = saleItems == null ? [] : saleItems;

      this.updateCheckoutTotals();
    })
  }

  btnAddRemove() {

  }

  btnCancelClicked() {

  }

  updateCheckoutTotals() {

    this.subTotal = 0;
    this.exchCpnTotal = 0;
    this.saleTaxTotal = 0;
    this.tipsTotal = 0;
    this.grandTotal = 0;
    this.totalSavings = 0;


    for (let k = 0; k < this.tktDtlItems.length; k++) {

      let subTotal = (this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity);
      let exchCpnTotal = (this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity) * this.tktDtlItems[k].exchangeCouponDiscountPct * 0.01;
      let saleTaxTotal = (this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity) * this.tktDtlItems[k].salesTaxPct * 0.01;
      let vndDiscountTotal = this.tktDtlItems[k].discountAmount | 0;

      this.subTotal += subTotal;
      this.exchCpnTotal += exchCpnTotal;
      this.saleTaxTotal += saleTaxTotal;
      this.vndDiscountTotal += vndDiscountTotal;

      this._store.dispatch(updateSaleitems({
        indx: k,
        saleItemId: this.tktDtlItems[k].salesItemUID,
        lineItemDollarDisplayAmount: (subTotal - exchCpnTotal - vndDiscountTotal + saleTaxTotal),
        lineItemTaxAmount: saleTaxTotal,
        lineItemDiscountAmount: vndDiscountTotal
      }));

    }
    this.grandTotal = this.subTotal - this.exchCpnTotal + this.saleTaxTotal;
    this.totalSavings = this.exchCpnTotal + this.vndDiscountTotal;
  }

}
