import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState } from 'src/app/authstate/auth.state';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { LTC_Associates } from '../models/location.associates';
import { SaleItem } from '../models/sale.item'; 
import { TktSaleItem } from '../models/ticket.detail';
import { getLocationAssocSelector } from '../saletranstore/localtionassociates/locationassociates.selector';
import { getLocCnfgIsAllowTipsSelector } from '../saletranstore/locationconfigstore/locationconfig.selector';

@Component({
    selector: 'app-tkt-sale-item',
    templateUrl: './tkt-sale-item.component.html',
    styleUrls: ['./tkt-sale-item.component.css']
})
export class TktSaleItemComponent implements OnInit {

    constructor(private _sharedSvc: SharedSubjectService, private _store: Store) { }

    tktSaleItems: TktSaleItem[] = [];
    public allowTips: boolean = false;
    public SaleAssocList: LTC_Associates[] = [];
    ngOnInit(): void {
        this._sharedSvc.SaleItem.subscribe(data => {
            let tktsi: TktSaleItem = new TktSaleItem();
            tktsi.salesItemUID = data.salesItemID;
            tktsi.salesItemDesc = data.salesItemDescription;
            tktsi.unitPrice = data.price;
            tktsi.quantity = 1;
            this.tktSaleItems.push(tktsi);
        });

        this._store.select(getLocCnfgIsAllowTipsSelector).subscribe(data => {
            if(data != null)
                this.allowTips = data;
        })

        this._store.select(getLocationAssocSelector).subscribe(data => {
            if(data != null) {
                this.SaleAssocList = data.associates;
            }
        })
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

    onAssociateChange(evt: Event, individualUID: number) {

    }
}
