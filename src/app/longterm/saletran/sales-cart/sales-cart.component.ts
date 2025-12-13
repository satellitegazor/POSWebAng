import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GlobalConstants } from '../../../global/global.constants';
import { LogonDataService } from '../../../global/logon-data-service.service';
import { TicketSplit } from '../../../models/ticket.split';
import { VendorLoginResultsModel } from '../../../models/vendor.login.results.model';
import { SharedSubjectService } from '../../../shared-subject/shared-subject.service';
import { Dept, SaleItem, SalesCat } from '../../models/sale.item';
import { SaleItemResultsModel } from '../../models/sale.item.results.model';
import { SalesTranService } from '../services/sales-tran.service';
import { TktSaleItemComponent } from '../tkt-sale-item/tkt-sale-item.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CustomerSearchComponent } from '../../../shared/customer-search/customer-search.component';

import { getSaleItemsStart, getSaleItemsActionSuccess, getSaleitemsFail } from '../store/saleitemstore/saleitem.action';
import { props, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getSaleItemListSelector } from '../store/saleitemstore/saleitem.selector';
import { getLocationConfigSelector } from '../store/locationconfigstore/locationconfig.selector';
import { getLocationConfigStart, setLocationConfig } from '../store/locationconfigstore/locationconfig.action';
import { getAuthLoginSelector } from 'src/app/authstate/auth.selector';
import { LocationConfig, LocationIndividual } from '../../models/location-config';
import { saleTranDataInterface } from '../store/ticketstore/ticket.state';
import { initTktObj } from '../store/ticketstore/ticket.action';
import { TicketLookupComponent } from '../../../shared/ticket-lookup/ticket-lookup.component';
import { getCheckoutItemsCount } from '../store/ticketstore/ticket.selector';
import {initialLocationConfigState, LocationConfigState} from '../store/locationconfigstore/locationconfig.state';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sales-cart',
    templateUrl: './sales-cart.component.html',
    styleUrls: ['./sales-cart.component.css'],
    standalone: false
})
export class SalesCartComponent implements OnInit, OnDestroy {

       modalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            centered: true
        };
        
    constructor(private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
        private _sharedSubSvc: SharedSubjectService, 
        private modalService: NgbModal, 
        private _store: Store<saleTranDataInterface>,
        private router: Router,
        private _locConfigStore: Store<LocationConfigState>) {
        //console.log('SalesCart constructor')
    }


    deptList: Dept[] = [];
    saleItemList: SaleItem[] = [];
    saleCatList: SalesCat[] = [];
    vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

    allItemButtonMenuList: SaleItem[] = [];
    salesItemRsltMdl!: Observable<SaleItemResultsModel>;

    strongErrMessage: string = "";
    errMessage: string = "";
    displayCustSearchDlg: string = '';
    displayTicketLookupDlg: string = '';
    showErrMsg: boolean = false;
    
    locationConfig: LocationConfig = {} as LocationConfig;
    locationIndividuals: LocationIndividual[] = [];

    disableCheckoutBtn: boolean = true;

    public salesCategoryListRefresh: Subject<boolean> = new Subject<boolean>();
    public salesItemListRefresh: Subject<boolean> = new Subject<boolean>();

    @ViewChild('tktSaleItemComponent')
    private tktSaleItemComponent: TktSaleItemComponent = {} as TktSaleItemComponent;

    ngOnInit(): void {

        //console.log('SalesCart ngOnInit')
        this.vendorLoginResult = this._logonDataSvc.getLTVendorLogonData();

        this._buildTktObj();
        this._saleTranSvc.getSaleItemListFromDB(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID).subscribe(data => {
            if(data.itemButtonMenuResults == null || data.itemButtonMenuResults.length == 0) {
                this.router.navigate(['/itembtnmenu']);
                return;
            }
            this.allItemButtonMenuList = data.itemButtonMenuResults;
            this.getDeptList();
        });

        this._saleTranSvc.getLocationConfig(+this.vendorLoginResult.locationUID, +this.vendorLoginResult.individualUID).subscribe(data => {

            this.locationConfig = data.configs[0];
            this.locationIndividuals = data.individuals;

            this._store.dispatch(initTktObj({ locConfig: this.locationConfig, individualUID: +this.vendorLoginResult.individualUID }));
        });

        let today = new Date();
        today.toDateString()
        this._saleTranSvc.GetDailyExchRate(+this.vendorLoginResult.locationUID, today.getMonth() + 1 + '-' + today.getDate() + '-' + today.getFullYear(), +this.vendorLoginResult.individualUID).subscribe(data => {
            this._logonDataSvc.setDailyExchRate(data.data);
        })

        this._store.select(getCheckoutItemsCount).subscribe(itemCount => {
            this.disableCheckoutBtn = (itemCount == 0);
        })
    }

    ngOnDestroy(): void {

    }

    public getDeptList(): void {
        
        this.allItemButtonMenuList.forEach(item => {
            let dptCount = this.deptList.filter(d => d.departmentUID == item.departmentUID).length;
            if (dptCount == 0) {
                let dpt = new Dept();
                dpt.departmentUID = item.departmentUID;
                dpt.departmentName = item.departmentName;
                this.deptList.push(dpt);
            }
        });

        this.getSalesCategoryList(this.deptList[0].departmentUID);
    }

    public getSalesCategoryList(deptId: number): void {

        
        
        this.saleCatList = [];
        let allDeptList = this.allItemButtonMenuList.filter(item => item.departmentUID == deptId);
        allDeptList.forEach(itm => {
            let k = this.saleCatList.filter(ct => ct.salesCategoryID == itm.salesCategoryID);
            if (k.length == 0) {
                this.saleCatList.push(itm);
            }
        });
        //console.log('setting salesCategoryListRefresh to true');
        this.salesCategoryListRefresh.next(true);

        this.getSaleItemList(this.saleCatList[0].salesCategoryID);
    }

    public getSaleItemList(categoryId: number): void {
        
        this.saleItemList = [];
        let allCatList = this.allItemButtonMenuList.filter(item => item.salesCategoryID == categoryId);
        allCatList.forEach(itm => {
            let k = this.saleItemList.filter(si => si.salesItemID == itm.salesItemID);
            if (k.length == 0) {
                this.saleItemList.push(itm);
            }
        });
        //console.log('setting salesItemListRefresh to true');
        this.salesItemListRefresh.next(true)
    }

    deptClicked(id: any) {
        this.getSalesCategoryList(id);
    }

    saleCatClicked(id: any) {
        this.getSaleItemList(id);
    }

    saleItemClicked(id: any) {
        //console.log('Sale Item Clicked: ' + id);
    }

    private _buildTktObj() {

    }

    btnCheckoutClick(evt: Event) {
        this.tktSaleItemComponent.btnCheckoutClicked();
    }

    btnCustDetailsClick(evt: Event) {
        this.displayCustSearchDlg = "display";
        const modalRef = this.modalService.open(CustomerSearchComponent, this.modalOptions);
        modalRef.componentInstance.data = "search customer";
        
    }

    closeCustSearchDlg() {
        this.displayCustSearchDlg = "none";
    }

    btnTicketLkup(evt: Event) {
        this.displayTicketLookupDlg = "display";
        const modalRef = this.modalService.open(TicketLookupComponent, this.modalOptions);
        modalRef.componentInstance.displayMsg = "search ticket";    
    }

    closeTicketLookupDlg() {
        this.displayTicketLookupDlg = "none";
    }
}
