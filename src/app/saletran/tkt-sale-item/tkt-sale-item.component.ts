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
import { addSaleItem, addServedByAssociate, decSaleitemQty, delSaleitemZeroQty, incSaleitemQty } from '../store/ticketstore/ticket.action';
import { SalesTransactionCheckoutItem } from '../models/salesTransactionCheckoutItem';
import { ConditionalExpr } from '@angular/compiler';
import { getCheckoutItemsSelector } from '../store/ticketstore/ticket.selector';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tkt-sale-item',
    templateUrl: './tkt-sale-item.component.html',
    styleUrls: ['./tkt-sale-item.component.css']
})
export class TktSaleItemComponent implements OnInit {

    constructor(private _saleTranSvc: SalesTranService,
        private _logonDataSvc: LogonDataService,
        private _store: Store<tktObjInterface>,
        private _router: Router) { }

    tktSaleItems: SalesTransactionCheckoutItem[] = [];
    public allowTips: boolean = false;
    public SaleAssocList: LTC_Associates[] = [];
    public indivId: number = 0;

    ngOnInit(): void {

        this._store.select(getCheckoutItemsSelector).subscribe(data => {
        
            if(data == undefined)
                return;
                
            this.tktSaleItems = data;          
        });

        const locConfig = this._logonDataSvc.getLocationConfig();
        this.allowTips = locConfig.allowTips;
        this.indivId = +this._logonDataSvc.getLTVendorLogonData().individualUID;        

        this._saleTranSvc.getLocationAssociates(locConfig.locationUID, +this._logonDataSvc.getLTVendorLogonData().individualUID).subscribe(data => {
            this.SaleAssocList = data.associates
        })
    }

    btnMinusClicked(evt: Event, i: number) {

        if(this.tktSaleItems[i].quantity == 1) {
            this._store.dispatch(delSaleitemZeroQty({saleItemId: this.tktSaleItems[i].salesItemUID, tktDtlId: this.tktSaleItems[i].ticketDetailId}));    
        }
        else {
            this._store.dispatch(decSaleitemQty({saleItemId: this.tktSaleItems[i].salesItemUID, tktDtlId: this.tktSaleItems[i].ticketDetailId}));
        }
    }

    btnPlusClicked(evt: Event, i: number) {
        this._store.dispatch(incSaleitemQty({saleItemId: this.tktSaleItems[i].salesItemUID, tktDtlId: this.tktSaleItems[i].ticketDetailId}));

        //this.tktSaleItems[i].quantity++;
    }

    public btnCheckoutClicked() {
        this._router.navigate(['/checkout'])
    }

    onAssociateChange(evt: Event, srvdById: number, saleItemId: number, indx: number) {

        //this._store.dispatch(addServedByAssociate({saleItemId, indx, srvdById}))
         setTimeout(function(obj: any) {
             obj._store.dispatch(addServedByAssociate({saleItemId, indx, srvdById}))
         }, 100, this, saleItemId, indx, srvdById) 

        return true;
    }
}
