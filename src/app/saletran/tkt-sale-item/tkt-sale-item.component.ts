import { Component, OnInit } from '@angular/core';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { SaleItem } from '../models/sale.item'; 
import { TktSaleItem } from '../models/ticket.detail';

@Component({
    selector: 'app-tkt-sale-item',
    templateUrl: './tkt-sale-item.component.html',
    styleUrls: ['./tkt-sale-item.component.css']
})
export class TktSaleItemComponent implements OnInit {

    constructor(private _sharedSvc: SharedSubjectService) { }

    tktSaleItems: TktSaleItem[] = [];
    ngOnInit(): void {
        this._sharedSvc.SaleItem.subscribe(data => {
            let tktsi: TktSaleItem = new TktSaleItem();
            tktsi.salesItemUID = data.salesItemID;
            tktsi.salesItemDesc = data.salesItemDescription;
            tktsi.unitPrice = data.price;
            tktsi.quantity = 1;
            this.tktSaleItems.push(tktsi);
        });
    }

    btnMinusClicked(evt: Event, i: number) {
        let qty = --this.tktSaleItems[i].quantity;
        if (qty == 0) {
            this.tktSaleItems.splice(i, 1);
        }
    }

    btnPlusClicked(evt: Event, i: number) {
        this.tktSaleItems[i].quantity++;
    }

    public btnCheckoutClicked() {
        this._sharedSvc.TktSaleItems.next(this.tktSaleItems);
    }
}
