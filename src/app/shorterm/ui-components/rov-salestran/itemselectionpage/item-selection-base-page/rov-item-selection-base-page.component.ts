import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GlobalConstants, ROVBusinessFunctionCode } from '../../../../../global/global.constants';
import { RovLogonDataService } from '../../../../rov-logon-data.service';
import { ROV_POSTicketSplit } from '../../../../models/rticket.split';
import { VendorLoginResultsModel } from '../../../../../models/vendor.login.results.model';
import { SharedSubjectService } from '../../../../../shared-subject/shared-subject.service';
import { Dept, SaleItem, SalesCat } from "../../../../../longterm/models/sale.item";
import { SaleItemResultsModel } from '../../../../../longterm/models/sale.item.results.model';
import { RovApiService } from "../../../../short-term.service";
import { RovTktSaleItemComponent } from '../tkt-sale-item/rov-tkt-sale-item.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { CustomerSearchComponent } from '../../../../../longterm/customer-search/customer-search.component';

import { getEventSaleItemsStart, getEventSaleItemsActionSuccess, getEventSaleitemsFail } from '../../../../store/saleitemstore/saleitem.action';
import { props, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { getSaleItemListSelector } from '../../../../store/saleitemstore/saleitem.selector';
import { getEventConfigSelector } from "../../../../store/roveventconfigstore/roveventconfig.selector"
import { getEventConfigStart, setEventConfig } from '../../../../store/roveventconfigstore/roveventconfig.action';
import { EventConfig } from '../../../../models/event.config';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { addTabSerialToTktObj, initTktObj } from '../../../../store/ticketstore/rticket.action';
import { RovTicketLookupComponent } from '../../../ticket-lookup/rov-ticket-lookup.component';
import { getRCheckoutItemsCount, getRTicketTotals, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { initialROVEventConfigState, ROVEventConfigState } from '../../../../store/roveventconfigstore/roveventconfig.state';
import { Router } from '@angular/router';
import { CPOSWebSvcService } from "../../../../../services-pinpad/cposweb-svc.service";
import { VerifoneCommStatus } from "../../../../../longterm/models/general-classes"
import { RovAddMiscItemDlgComponent } from '../add-misc-item-dlg/rov-add-misc-item-dlg.component';
import { DailyExchRate } from '../../../../../models/exchange.rate';
import { UtilService } from "../../../../../services-misc/util.service"

@Component({
    selector: 'app-rov-item-selection-base-page',
    templateUrl: './rov-item-selection-base-page.component.html',
    styleUrls: ['./rov-item-selection-base-page.component.css'],
    standalone: false
})
export class RovItemSelectionBasePageComponent implements OnInit, OnDestroy {

       modalOptions: NgbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            centered: true
        };
    salesCategoryListRefreshEvent: any;
    transactionId: number = 0;
    individualId: number = 0;
        
    constructor(private _rovApiSvc: RovApiService, 
        private _logonDataSvc: RovLogonDataService,
        private _sharedSubSvc: SharedSubjectService, 
        private modalService: NgbModal, 
        private _store: Store<RovSaleTranDataInterface>,
        private router: Router,
        private _rovEventConfigStore: Store<ROVEventConfigState>,
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
    
    eventConfig: EventConfig = {} as EventConfig;

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
    private tktSaleItemComponent: RovTktSaleItemComponent = {} as RovTktSaleItemComponent;

    ngOnInit(): void {
        this.initializeItemSelectionPage();
    }

    private initializeItemSelectionPage(): void {

        //console.log('SalesCart ngOnInit')
        this.vendorLoginResult = this._logonDataSvc.getRovVendorLogonData();
        this.defaultCurrencyCode = this._logonDataSvc.getDfltCurrCode?.() ?? this._logonDataSvc.getRovEventConfig()?.defaultCurrency ?? 'USD';
        
        this.isDefaultCurrencyUsd = this.defaultCurrencyCode.toUpperCase() === 'USD';
        
        let exchRateObj = this._logonDataSvc.getDailyExchRate();
        this.isForeignCurrency = exchRateObj?.isForeignCurr ?? false;

        this.individualId = +this._logonDataSvc.getRovVendorLogonData().individualUID;
        
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
        this._rovApiSvc.getConcessionMenuItem(this.individualId.toString(), this.vendorLoginResult.eventId, 0, true).subscribe(data => {
            if(data.lstItemButtons == null || data.lstItemButtons.length == 0) {
                this.router.navigate(['/itembtnmenu']);
                return;
            }
            this.allItemButtonMenuList = data.lstItemButtons;
            this.getDeptList();
        });

        

        this._rovApiSvc.GetEventConfig(+this.vendorLoginResult.eventId, this.vendorLoginResult.individualUID).subscribe(data => {

            this.eventConfig = data.config;
            this._rovEventConfigStore.dispatch(setEventConfig({ eventConfig: data.config }));

            if(this.eventConfig.rgnCode == "CON") {
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

        this._store.select(getRCheckoutItemsCount).subscribe(itemCount => {
            this.disableCheckoutBtn = (itemCount == 0);
        })

        this._store.select(getRTktObjSelector).subscribe(tktObj => {

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

        this._store.select(getRTicketTotals).subscribe(tktTotals => {
            
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
        const isCustomerSaveReqd = this.eventConfig.busFuncCode == ROVBusinessFunctionCode.BUSFNC_LTR_OTHER_CASH_CARRY
            || this.eventConfig.busFuncCode == ROVBusinessFunctionCode.BUSFNC_LTR_PHOTOGRAPHY;

        const isCustomerMissing = this.tktCustomerId === 0 && (this.tktCustomerLastName ?? '').trim().length === 0;

        if ((isCustomerSaveReqd || this.customerReqdForSaleItems) && isCustomerMissing ) {
            this.pendingCheckoutAfterCustomer = true;
            this.btnCustDetailsClick(new Event('isCustomerSaveReqd'));
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
        const modalRef = this.modalService.open(RovTicketLookupComponent, this.modalOptions);
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
        const modalRef = this.modalService.open(RovAddMiscItemDlgComponent, {
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
