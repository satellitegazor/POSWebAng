import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthState } from 'src/app/authstate/auth.state';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from '../../../../shared-subject/shared-subject.service';
import { LTC_Associates } from '../../../models/location.associates';
import { SaleItem } from '../../../models/sale.item'; 
import { TktSaleItem } from '../../../../models/ticket.detail';
import { getLocationAssocSelector } from '../../store/localtionassociates/locationassociates.selector';
import { getLocCnfgIsAllowTipsSelector } from '../../store/locationconfigstore/locationconfig.selector';
import { PosApiService } from '../../../services/pos-api-service';
import { saleTranDataInterface } from '../../store/ticketstore/rticket.state';
import { addSaleItem, updateServedByAssociate, decSaleitemQty, delSaleitemZeroQty, incSaleitemQty, updateAssocInAssocTips, updateCheckoutTotals, inactiveTicketDetail } from '../../store/ticketstore/ticket.action';
import { SalesTransactionCheckoutItem } from '../../../models/salesTransactionCheckoutItem';
import { ConditionalExpr } from '@angular/compiler';
import { getCheckoutItemsSelector, getTranIdTicketNumber } from '../../store/ticketstore/ticket.selector';
import { Router } from '@angular/router';
import { CPOSAppType } from 'src/app/services-misc/util.service';

import { currSymbls } from 'src/app/models/CurrencySymbols';

@Component({
    selector: 'app-rov-tkt-sale-item',
    templateUrl: './rov-tkt-sale-item.component.html',
    styleUrls: ['./rov-tkt-sale-item.component.css'],
    standalone: false
})
export class RovTktSaleItemComponent implements OnInit {

    constructor(private _saleTranSvc: PosApiService,
        private _logonDataSvc: LogonDataService,
        private _store: Store<saleTranDataInterface>,
        private _router: Router) { }

    tktSaleItems: SalesTransactionCheckoutItem[] = [];
    public allowTips: boolean = false;
    public SaleAssocList: LTC_Associates[] = [];
    public indivId: number = 0;

    public dfltCurrSymbl: string = '$'
    public exchRate: number = 1;
    public dfltCurrCode: string = 'USD'

    public transactionId: number = 0;
    public locationId: number = 0;

    @Output() addMiscItemClicked: EventEmitter<void> = new EventEmitter<void>();

    ngOnInit(): void {

        this._store.select(getTranIdTicketNumber).subscribe(data => {
            this.transactionId = data.tranId;
            this.locationId = data.locationId;});

        this._store.select(getCheckoutItemsSelector).subscribe(data => {
        
            if(data == undefined)
                return;
                
            this.tktSaleItems = data;          
        });

        const locConfig = this._logonDataSvc.getLocationConfig();
        this.allowTips = locConfig.allowTips;
        this.indivId = +this._logonDataSvc.getLTVendorLogonData().individualUID;        

        this._saleTranSvc.getLocationAssociates(this.locationId, String(this.indivId)).subscribe(data => {
            this.SaleAssocList = data.associates
        })

        this.dfltCurrSymbl = currSymbls.find(x => x.key == this._logonDataSvc.getDfltCurrCode())?.value ?? '$'; 
        this.exchRate = this._logonDataSvc.getExchangeRate();
        this.dfltCurrCode = this._logonDataSvc.getDfltCurrCode();
        
    }

    btnMinusClicked(evt: Event, i: number) {

        if(this.tktSaleItems[i].quantity == 1) {

            if (this.transactionId > 0) {
                this._store.dispatch(inactiveTicketDetail({
                    uid: this.indivId,
                    request: {
                        locEvtId: this.locationId,
                        tranId: this.transactionId,
                        ticketDetailId: this.tktSaleItems[i].ticketDetailId,
                        appType: CPOSAppType.LongTerm,
                        userId: this.indivId,
                        voidTicket: false,
                        voidTypeCode: '',
                        voidOtherReason: ''
                    }
                }));
            } 
            else 
            {
                this._store.dispatch(delSaleitemZeroQty({saleItemId: this.tktSaleItems[i].salesItemUID, tktDtlId: this.tktSaleItems[i].ticketDetailId, defCurrSymbl: this.dfltCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));    
            }

        }
        else {
            this._store.dispatch(decSaleitemQty({ saleItemId: this.tktSaleItems[i].salesItemUID, tktDtlId: this.tktSaleItems[i].ticketDetailId , defCurrSymbl: this.dfltCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));
        }
        this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    }

    btnPlusClicked(evt: Event, i: number) {
        this._store.dispatch(incSaleitemQty({saleItemId: this.tktSaleItems[i].salesItemUID, tktDtlId: this.tktSaleItems[i].ticketDetailId, defCurrSymbl: this.dfltCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));
        this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    }

    public btnCheckoutClicked() {

        this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
        this._router.navigate(['/checkout'])
    }

    onAssociateChange(evt: any, indivLocId: number, saleItemId: number, indx: number, srvdByAssociateVal: string) {

        let srvdByAssociateName = evt.target['options'][+evt.target.selectedIndex].innerText;
        this._store.dispatch(updateServedByAssociate({ saleItemId, indx, indLocId: indivLocId, srvdByAssociateName: evt.target['options'][+evt.target.selectedIndex].innerText }))
        this._store.dispatch(updateAssocInAssocTips({ saleItemId: saleItemId, indLocId: indivLocId }));

        return true;
    }

    btnAddMiscItemClicked($event: Event) {
        this.addMiscItemClicked.emit();
    }

}
