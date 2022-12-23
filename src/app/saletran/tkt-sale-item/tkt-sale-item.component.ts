import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState } from 'src/app/authstate/auth.state';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { LTC_Associates } from '../models/location.associates';
import { SaleItem } from '../models/sale.item'; 
import { TktSaleItem } from '../../models/ticket.detail';
import { getLocationAssocSelector } from '../store/localtionassociates/locationassociates.selector';
import { getLocCnfgIsAllowTipsSelector } from '../store/locationconfigstore/locationconfig.selector';
import { SalesTranService } from '../services/sales-tran.service';
import { tktObjInterface } from '../store/ticketstore/ticket.state';
import { addSaleItem } from '../store/ticketstore/ticket.action';
import { SalesTransactionCheckoutItem } from '../models/salesTransactionCheckoutItem';
import { ConditionalExpr } from '@angular/compiler';
import { getCheckoutItemsSelector } from '../store/ticketstore/ticket.selector';

@Component({
    selector: 'app-tkt-sale-item',
    templateUrl: './tkt-sale-item.component.html',
    styleUrls: ['./tkt-sale-item.component.css']
})
export class TktSaleItemComponent implements OnInit {

    constructor(private _sharedSvc: SharedSubjectService, private _saleTranSvc: SalesTranService,
        private _logonDataSvc: LogonDataService,
        private _store: Store<tktObjInterface>) { }

    tktSaleItems: TktSaleItem[] = [];
    public allowTips: boolean = false;
    public SaleAssocList: LTC_Associates[] = [];
    public indivId: number = 0;

    ngOnInit(): void {

        this._store.select(getCheckoutItemsSelector).subscribe(data => {
        //this._sharedSvc.SaleItem.subscribe(data => {
            if(data == undefined)
                return;
            data.forEach((item) => {
                let tktsi: TktSaleItem = new TktSaleItem();
                tktsi.salesItemUID = item.salesItemUID;
                tktsi.salesItemDesc = item.salesItemDesc;
                tktsi.unitPrice = item.unitPrice
                tktsi.quantity = item.quantity;
                tktsi.locAssociateList =  JSON.parse(JSON.stringify(this.SaleAssocList));
                this.tktSaleItems.push(tktsi);                    
            })           
        });

        const locConfig = this._logonDataSvc.getLocationConfig();
        this.allowTips = locConfig.configs[0].allowTips;
        this.indivId = +this._logonDataSvc.getLTVendorLogonData().individualUID;        

        this._saleTranSvc.getLocationAssociates(locConfig.configs[0].locationUID, +this._logonDataSvc.getLTVendorLogonData().individualUID).subscribe(data => {
            this.SaleAssocList = data.associates
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
