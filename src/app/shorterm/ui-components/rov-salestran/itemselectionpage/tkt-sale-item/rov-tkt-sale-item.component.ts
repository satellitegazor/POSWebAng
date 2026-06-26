import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { RovLogonDataService } from '../../../../rov-logon-data.service';
import { SharedSubjectService } from '../../../../../shared-subject/shared-subject.service';
import { AssociateNamesListDetail } from "../../../../models/models"
import { RovApiService } from "../../../../short-term.service";
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { addRovSaleItem, decRovSaleitemQty, delRovSaleitemZeroQty, incRovSaleitemQty,  
    updateRovCheckoutTotals, inactiveRovTicketDetail } from '../../../../store/ticketstore/rticket.action';
import { Rov_SalesTranCheckoutItem } from '../../../../models/r-salestran-checkout-item';
import { ConditionalExpr } from '@angular/compiler';
import { getRCheckoutItemsSelector, getRTranIdTicketNumber } from '../../../../store/ticketstore/rticket.selector';
import { Router } from '@angular/router';
import { CPOSAppType } from '../../../../../services-misc/util.service';
import { currSymbls } from '../../../../../models/CurrencySymbols';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-rov-tkt-sale-item',
    templateUrl: './rov-tkt-sale-item.component.html',
    styleUrls: ['./rov-tkt-sale-item.component.css'],
    imports: [CommonModule, FormsModule]
})
export class RovTktSaleItemComponent implements OnInit {

    constructor(private _saleTranSvc: RovApiService,
        private _logonDataSvc: RovLogonDataService,
        private _store: Store<RovSaleTranDataInterface>,
        private _router: Router) { }

    tktSaleItems: Rov_SalesTranCheckoutItem[] = [];
    public allowTips: boolean = false;
    public indivId: number = 0;

    public dfltCurrSymbl: string = '$'
    public exchRate: number = 1;
    public dfltCurrCode: string = 'USD'

    public transactionId: number = 0;
    public eventId: number = 0;

    @Output() addMiscItemClicked: EventEmitter<void> = new EventEmitter<void>();

    ngOnInit(): void {

        this._store.select(getRTranIdTicketNumber).subscribe(data => {
            this.transactionId = data.tranId;
            this.eventId = data.locationId;});

        this._store.select(getRCheckoutItemsSelector).subscribe(data => {
        
            if(data == undefined)
                return;
                
            this.tktSaleItems = data;          
        });

        const locConfig = this._logonDataSvc.getRovEventConfig();
        this.allowTips = locConfig.allowTips;
        this.indivId = +this._logonDataSvc.getRovVendorLogonData().individualUID;        

        this.dfltCurrSymbl = currSymbls.find(x => x.key == this._logonDataSvc.getDfltCurrCode())?.value ?? '$'; 
        this.exchRate = this._logonDataSvc.getExchangeRate();
        this.dfltCurrCode = this._logonDataSvc.getDfltCurrCode();
        
    }

    btnMinusClicked(evt: Event, i: number) {

        if(this.tktSaleItems[i].quantity == 1) {

            if (this.transactionId > 0) {
                this._store.dispatch(inactiveRovTicketDetail({
                    uid: this.indivId,
                    request: {
                        locEvtId: this.eventId,
                        tranId: this.transactionId,
                        ticketDetailId: this.tktSaleItems[i].ticketDetailId,
                        appType: CPOSAppType.ShortTerm,
                        userId: this.indivId,
                        voidTicket: false,
                        voidTypeCode: '',
                        voidOtherReason: ''
                    }
                }));
            } 
            else 
            {
                this._store.dispatch(delRovSaleitemZeroQty({ deptUID: this.tktSaleItems[i].departmentUid, tktDtlId: this.tktSaleItems[i].ticketDetailId, defCurrSymbl: this.dfltCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));    
            }
        }
        else {
            this._store.dispatch(decRovSaleitemQty({ deptUID: this.tktSaleItems[i].departmentUid, tktDtlId: this.tktSaleItems[i].ticketDetailId , defCurrSymbl: this.dfltCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));
        }
        this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    }

    btnPlusClicked(evt: Event, i: number) {
        this._store.dispatch(incRovSaleitemQty({deptUID: this.tktSaleItems[i].departmentUid, tktDtlId: this.tktSaleItems[i].ticketDetailId, defCurrSymbl: this.dfltCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));
        this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    }

    public btnCheckoutClicked() {

        this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
        this._router.navigate(['/rov/rchekout'])
    }

    btnAddMiscItemClicked($event: Event) {
        this.addMiscItemClicked.emit();
    }

}
