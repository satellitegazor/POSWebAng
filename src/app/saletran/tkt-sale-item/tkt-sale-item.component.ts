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
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { addSaleItem, updateServedByAssociate, decSaleitemQty, delSaleitemZeroQty, incSaleitemQty, updateAssocInAssocTips } from '../store/ticketstore/ticket.action';
import { SalesTransactionCheckoutItem } from '../models/salesTransactionCheckoutItem';
import { ConditionalExpr } from '@angular/compiler';
import { getCheckoutItemsSelector } from '../store/ticketstore/ticket.selector';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tkt-sale-item',
    templateUrl: './tkt-sale-item.component.html',
    styleUrls: ['./tkt-sale-item.component.css'],
    standalone: false
})
export class TktSaleItemComponent implements OnInit {

    constructor(private _saleTranSvc: SalesTranService,
        private _logonDataSvc: LogonDataService,
        private _store: Store<saleTranDataInterface>,
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

    onAssociateChange(evt: any, indivLocId: number, saleItemId: number, indx: number, srvdByAssociateName: string) {

        console.log(evt.target)

         setTimeout(function(obj: any, saleItemId: number, indx: number, indivLocId: number, srvdByAssociateName: string) {
             obj._store.dispatch(updateServedByAssociate({saleItemId, indx, indLocId: indivLocId, srvdByAssociateName}))
             obj._store.dispatch(updateAssocInAssocTips({saleItemId: saleItemId, indLocId: indivLocId}));
         }, 100, this, saleItemId, indx, indivLocId, evt.target['options'][+evt.target.selectedIndex].innerText
        ) 

        return true;
    }
}
