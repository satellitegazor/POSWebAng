import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BusinessFunctionCode, GlobalConstants } from '../../../../global/global.constants';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { TicketSplit } from '../../../../models/ticket.split';
import { VendorLoginResultsModel } from '../../../../models/vendor.login.results.model';
import { SharedSubjectService } from '../../../../shared-subject/shared-subject.service';
import { Dept, SaleItem, SalesCat } from '../../../models/sale.item';
import { SaleItemResultsModel } from '../../../models/sale.item.results.model';
import { PosApiService } from '../../../services/pos-api-service';
import { TktSaleItemComponent } from '../tkt-sale-item/tkt-sale-item.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CustomerSearchComponent } from '../../../customer-search/customer-search.component';

import { getSaleItemsStart, getSaleItemsActionSuccess, getSaleitemsFail } from '../../store/saleitemstore/saleitem.action';
import { props, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getSaleItemListSelector } from '../../store/saleitemstore/saleitem.selector';
import { getLocationConfigSelector } from '../../store/locationconfigstore/locationconfig.selector';
import { getLocationConfigStart, setLocationConfig } from '../../store/locationconfigstore/locationconfig.action';
import { getAuthLoginSelector } from '../../../../authstate/auth.selector';
import { LocationConfig, LocationIndividual } from '../../../models/location-config';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { addTabSerialToTktObj, initTktObj } from '../../store/ticketstore/ticket.action';
import { TicketLookupComponent } from '../../../ticket-lookup/ticket-lookup.component';
import { getCheckoutItemsCount, getTicketTotals, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import {initialLocationConfigState, LocationConfigState} from '../../store/locationconfigstore/locationconfig.state';
import { Router } from '@angular/router';
import { CPOSWebSvcService } from '../../../services/cposweb-svc.service';
import { VerifoneCommStatus } from '../../../models/general-classes';
import { AddMiscItemDlgComponent } from '../add-misc-item-dlg/add-misc-item-dlg.component';
import { DailyExchRate } from '../../../../models/exchange.rate';
import { UtilService } from '../../../../services/util.service';

@Component({
    selector: 'app-item-selection-base-page',
    templateUrl: './item-selection-base-page.component.html',
    styleUrls: ['./item-selection-base-page.component.css'],
    standalone: false
})
export class ItemSelectionBasePageComponent implements OnInit, OnDestroy {

       modalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            centered: true
        };
    salesCategoryListRefreshEvent: any;
    transactionId: number = 0;
    individualId: number = 0;
        
    constructor(private _saleTranSvc: PosApiService, 
        private _logonDataSvc: LogonDataService,
        private _sharedSubSvc: SharedSubjectService, 
        private modalService: NgbModal, 
        private _store: Store<saleTranDataInterface>,
        private router: Router,
        private _locConfigStore: Store<LocationConfigState>,
        private _cposWebSvc: CPOSWebSvcService,
        private _utilSvc: UtilService) {

        //console.log('SalesCart constructor')
        this.salesCategoryListRefreshEvent = new Subject<boolean>();
    }

    public deptListRefreshEvent: Subject<boolean> = new Subject<boolean>();
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
    activeSalesCatId: number = 0;
    activeDeptId: number = 0;
    tktCustomerId: number = 0;
    tktCustomerLastName: string = '';
    pendingCheckoutAfterCustomer: boolean = false;
    private isAddMiscModalOpen: boolean = false;
    exchangeRate: string = '';
    defaultCurrencyCode: string = 'USD';
    dcSubtotal: number = 0;
    ndcSubtotal: number = 0;
    private isDefaultCurrencyUsd: boolean = true;
    isForeignCurrency: boolean = false;
    dcCurrSymbol: string = '';
    ndcCurrSymbol: string = '';

    customerReqdForSaleItems: boolean = false;

    //public salesCategoryListRefresh: Subject<boolean> = new Subject<boolean>();
    public salesItemListRefresh: Subject<boolean> = new Subject<boolean>();

    @ViewChild('tktSaleItemComponent')
    private tktSaleItemComponent: TktSaleItemComponent = {} as TktSaleItemComponent;

    ngOnInit(): void {

        //console.log('SalesCart ngOnInit')
        this.vendorLoginResult = this._logonDataSvc.getLTVendorLogonData();
        this.defaultCurrencyCode = this._logonDataSvc.getDfltCurrCode?.() ?? this._logonDataSvc.getLocationConfig()?.defaultCurrency ?? 'USD';
        
        this.isDefaultCurrencyUsd = this.defaultCurrencyCode.toUpperCase() === 'USD';
        
        let exchRateObj = this._logonDataSvc.getDailyExchRate();
        this.isForeignCurrency = exchRateObj?.isForeignCurr ?? false;

        this.individualId = +this._logonDataSvc.getLTVendorLogonData().individualUID;
        
        if(this.isForeignCurrency) {

            if(exchRateObj.isOneUSD) {
                this.exchangeRate = '1 USD = ' + exchRateObj.exchangeRate.toCPOSFixed(2) + ' ' + exchRateObj.foreignCurrCode;
            }
            else {
                this.exchangeRate = '1 USD' + ' = ' + exchRateObj.exchangeRate.toCPOSFixed(2) + ' ' + exchRateObj.dfltCurrCode;
            }
        }

        this.dcCurrSymbol = this._utilSvc.currencySymbols.get(this.defaultCurrencyCode) || '';
        this.ndcCurrSymbol = this._utilSvc.currencySymbols.get(this.defaultCurrencyCode != 'USD' ? "USD" : exchRateObj.currCode) || '';

        let pinpadStatus: VerifoneCommStatus = new VerifoneCommStatus();

        this._buildTktObj();
        this._saleTranSvc.getSaleItemListFromDB(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0).subscribe(data => {
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
            this._locConfigStore.dispatch(setLocationConfig({ locationConfig: data.configs[0] }));

            if(this.locationConfig.rgnCode == "CON") {
                this._cposWebSvc.getsysinfo("asdf").subscribe((data) => {
                    if (data.IsSuccess) {
                        console.log("SysInfo Success: ", data);
                        this._store.dispatch(addTabSerialToTktObj({ tabSerialNum: data.TabMachineName, ipAddress: data.IPAddress }));
                    }
                });
            }
            else {
                this._cposWebSvc.pinpadHeartbeat("PING").subscribe(data => {
                    if (data.IsSuccess) {
                        pinpadStatus = data;
                        console.log("Pinpad Heartbeat Success: ", pinpadStatus);
                        this._store.dispatch(addTabSerialToTktObj({ tabSerialNum: pinpadStatus.TabMachineName, ipAddress: pinpadStatus.IpAddress }));
                    }
                });   
            }         
        });

        this._store.select(getCheckoutItemsCount).subscribe(itemCount => {
            this.disableCheckoutBtn = (itemCount == 0);
        })

        this._store.select(getTktObjSelector).subscribe(tktObj => {

            this.customerReqdForSaleItems = (tktObj?.tktList?.filter(item => item.custInfoReq).length ?? 0) > 0;

            this.tktCustomerId = tktObj?.customerId ?? 0;
            this.tktCustomerLastName = tktObj?.customer?.cLastName ?? '';
            this.transactionId = tktObj?.transactionID ?? 0;            

            const isCustomerMissing = this.tktCustomerId === 0 && (this.tktCustomerLastName ?? '').trim().length === 0;
            if (this.pendingCheckoutAfterCustomer && !isCustomerMissing) {
                this.pendingCheckoutAfterCustomer = false;
                this.tktSaleItemComponent.btnCheckoutClicked();
            }
        })

        this._store.select(getTicketTotals).subscribe(tktTotals => {
            
            if (!tktTotals) {
                this.dcSubtotal = 0;
                return;
            }
            this.dcSubtotal = tktTotals.subTotalDC;
            this.ndcSubtotal = tktTotals.subTotalNDC;
        });
    }

    ngOnDestroy(): void {}

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
        this.deptListRefreshEvent.next(true);

        this.getSalesCategoryList(this.deptList[0].departmentUID);
    }

    public getSalesCategoryList(deptId: number): void {

        this.saleCatList = [];
        let allDeptList = this.allItemButtonMenuList.filter(item => item.departmentUID == deptId);
        allDeptList.forEach(itm => {
            let k = this.saleCatList.filter(ct => ct.salesCategoryUID == itm.salesCategoryID);
            if (k.length == 0) {
                let cat = new SalesCat();
                cat.salesCategoryUID = itm.salesCategoryID;
                cat.description = itm.salesCategoryDescription;
                cat.departmentName = itm.departmentName;
                cat.departmentUID = itm.departmentUID;
                cat.active = itm.salesCatActive;
                cat.salesCatTypeUID = itm.salesCatTypeUID;
                this.saleCatList.push(cat);
            }
        });
        //console.log('setting salesCategoryListRefresh to true');
        this.salesCategoryListRefreshEvent.next(true);

        this.getSaleItemList(this.saleCatList[0].salesCategoryUID);
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
        this.activeDeptId = Number(id) || 0;
        this.getSalesCategoryList(id);
    }

    saleCatClicked(id: any) {
        this.activeSalesCatId = Number(id) || 0;
        this.getSaleItemList(id);
    }

    saleItemClicked(id: any) {
        //console.log('Sale Item Clicked: ' + id);
    }

    private _buildTktObj() {

    }

    btnCheckoutClick(evt: Event) {
        const isLaundry = this.locationConfig.busFuncCode == BusinessFunctionCode.BUSFNC_LNDRYCLN
            || this.locationConfig.busFuncCode == BusinessFunctionCode.BUSFNC_LNDRYCLN_WALT;
        

        const isCustomerMissing = this.tktCustomerId === 0 && (this.tktCustomerLastName ?? '').trim().length === 0;

        if ((isLaundry || this.customerReqdForSaleItems) && isCustomerMissing ) {
            this.pendingCheckoutAfterCustomer = true;
            this.btnCustDetailsClick(new Event('isLaundry'));
            return;
        }

        this.tktSaleItemComponent.btnCheckoutClicked();
    }

    btnCustDetailsClick(evt: Event) {
        this.displayCustSearchDlg = "display";
        const modalRef = this.modalService.open(CustomerSearchComponent, this.modalOptions);
        modalRef.componentInstance.data = evt.type;
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

    btnAddMiscItemClicked() {
        if (this.isAddMiscModalOpen) {
            return;
        }

        this.isAddMiscModalOpen = true;
        console.log('SalesCartComponent.btnAddMiscItemClicked invoked');
        const modalRef = this.modalService.open(AddMiscItemDlgComponent, {
            ...this.modalOptions,
            size: 'lg'
        });

        modalRef.componentInstance.data = {
            departmentNames: this.deptList.map(dept => ({
                departmentUID: dept.departmentUID,
                departmentName: dept.departmentName
            }))
        };
        modalRef.componentInstance.allSaleItems = this.allItemButtonMenuList;
        modalRef.componentInstance.dailyExchRate = this._logonDataSvc ? this._logonDataSvc.getDailyExchRate() : {} as DailyExchRate;
        modalRef.componentInstance.transactionId = this.transactionId;
        modalRef.componentInstance.individualId = this.individualId;

        modalRef.result.then((result: any) => {
            if (!result) {
                return;
            }

            // Keep payload handling local until store wiring is implemented.
            console.log('Misc item dialog result:', result);
        }).catch(() => {
            // User cancelled the modal.
        }).finally(() => {
            this.isAddMiscModalOpen = false;
        });
    }
}
