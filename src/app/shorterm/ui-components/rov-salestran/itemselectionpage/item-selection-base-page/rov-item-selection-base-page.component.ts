import { CommonModule } from '@angular/common';
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
import { addRovSaleItem, addTabSerialToRovTktObj, rovInitTktObj, updateRovCheckoutTotals } from '../../../../store/ticketstore/rticket.action';
import { RovTicketLookupComponent } from '../../../ticket-lookup/rov-ticket-lookup.component';
import { getRCheckoutItemsCount, getRTicketTotals, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { initialROVEventConfigState, ROVEventConfigState } from '../../../../store/roveventconfigstore/roveventconfig.state';
import { Router } from '@angular/router';
import { CPOSWebSvcService } from "../../../../../services-pinpad/cposweb-svc.service";
import { VerifoneCommStatus } from "../../../../../longterm/models/general-classes"
import { RovAddMiscItemDlgComponent } from '../add-misc-item-dlg/rov-add-misc-item-dlg.component';
import { DailyExchRate } from '../../../../../models/exchange.rate';
import { UtilService } from "../../../../../services-misc/util.service"
import { RovCustomerSearchComponent } from '../../../customer-search/rov-customer-search.component';
import { RovKeyPadComponent } from '../rov-key-pad/rov-key-pad.component';
import { RovDeptListComponent } from '../salesdept/rov-deptlist.component';
import { ROV_Department } from '../../../../../longterm/models/ticket.list';
import { RDeptCategoryResultModels, ROV_SaleTaxSaveStatusResultModel } from '../../../../models/models';
import { Rov_SalesTranCheckoutItem } from '../../../../models/r-salestran-checkout-item';
import { FormsModule } from '@angular/forms';
import { PosCurrencyDirective } from '../../../../../directives/pos-currency.directive';


@Component({
    selector: 'app-rov-item-selection-base-page',
    templateUrl: './rov-item-selection-base-page.component.html',
    styleUrls: ['./rov-item-selection-base-page.component.css'],
    imports: [CommonModule, FormsModule, PosCurrencyDirective, RovTktSaleItemComponent]
})

export class RovItemSelectionBasePageComponent implements OnInit, OnDestroy {

    modalOptions: NgbModalOptions = {
        backdrop: 'static',
        keyboard: false,
        centered: true
    };
    
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
        private _utilSvc: UtilService) {}

    public deptListRefreshEvent: Subject<boolean> = new Subject<boolean>();
    vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

    deptCategoryList: ROV_Department[] = [];

    strongErrMessage: string = "";
    errMessage: string = "";
    displayCustSearchDlg: string = '';
    displayTicketLookupDlg: string = '';
    showErrMsg: boolean = false;
    
    eventConfig: EventConfig = {} as EventConfig;
    disableCheckoutBtn: boolean = true;

    activeDeptId: number = 0;
    tktCustomerId: number = 0;
    tktCustomerLastName: string = '';
    saleItemPrice: number = 0;
    pendingCheckoutAfterCustomer: boolean = false;
    private isAddMiscModalOpen: boolean = false;
    exchangeRate: string = '';
    defaultCurrencyCode: string = 'USD';
    defCurrSymbl: string = '$';
    dcSubtotal: number = 0;
    ndcSubtotal: number = 0;
    private isDefaultCurrencyUsd: boolean = true;
    isForeignCurrency: boolean = false;
    dcCurrSymbol: string = '';
    ndcCurrSymbol: string = '';
    checkOutItemCount: number = 0;

    customerReqdForSaleItems: boolean = false;
    

    //public salesCategoryListRefresh: Subject<boolean> = new Subject<boolean>();
    public salesItemListRefresh: Subject<boolean> = new Subject<boolean>();

    @ViewChild('tktSaleItemComponent')
    private tktSaleItemComponent: RovTktSaleItemComponent = {} as RovTktSaleItemComponent;

    ngOnInit(): void {
        
        let eventId = +(localStorage.getItem('event_id') || 0);

        this._rovApiSvc.GetEventConfig(eventId, this.vendorLoginResult.individualUID).subscribe(data => {

            this.eventConfig = data.config;
            this._rovEventConfigStore.dispatch(setEventConfig({ eventConfig: data.config }));

            if (this.eventConfig.rgnCode == "CON") {
                this._cposWebSvc.getsysinfo("asdf").subscribe((data) => {
                    if (data.IsSuccess) {
                        console.log("SysInfo Success: ", data);
                        this._store.dispatch(addTabSerialToRovTktObj({ tabSerialNum: data.TabMachineName, ipAddress: data.IPAddress }));
                    }
                });
            }
            else {
                this.defaultCurrencyCode = this.eventConfig.defaultCurrency ?? 'USD';
                this.defCurrSymbl = this._utilSvc.currencySymbols.get(this.defaultCurrencyCode) || '';
                this._cposWebSvc.pinpadHeartbeat("PING").subscribe(data => {
                    if (data.IsSuccess) {
                        const pinpadStatus = data;
                        console.log("Pinpad Heartbeat Success: ", pinpadStatus);
                        this._store.dispatch(addTabSerialToRovTktObj({ tabSerialNum: pinpadStatus.TabMachineName, ipAddress: pinpadStatus.IpAddress }));
                    }
                });
            }
        });

        this._rovApiSvc.checkSalesTaxSaveStatus(eventId, this.individualId).subscribe((data: ROV_SaleTaxSaveStatusResultModel) => {
            if (data.saveStatus == false && (typeof data.defaultCurrency === 'undefined' || data.defaultCurrency.trim().length === 0)) {
                this.router.navigate(['/rov/ritembtnmenu']);
                return;
            }

            this._rovApiSvc.getConcessionMenuItem(this._logonDataSvc.getRovVendorLogonData().individualUID.toString(), 
                eventId, 
                0, 
                true).subscribe((data: RDeptCategoryResultModels) => {   
                    this.deptCategoryList = data.lstItemButtons;
            });
            this.initializeItemSelectionPage();
        });
    }

    private initializeItemSelectionPage(): void {

        //console.log('SalesCart ngOnInit')
        this.vendorLoginResult = this._logonDataSvc.getRovVendorLogonData();
        this.defaultCurrencyCode = this._logonDataSvc.getDfltCurrCode?.() ?? this.eventConfig?.defaultCurrency ?? 'USD';
        
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
        this.ndcCurrSymbol = this._utilSvc.currencySymbols.get(this.defaultCurrencyCode != 'USD' ? "USD" : exchRateObj?.currCode) || '';

        let pinpadStatus: VerifoneCommStatus = new VerifoneCommStatus();

        this._store.select(getRCheckoutItemsCount).subscribe(itemCount => {
            this.checkOutItemCount = itemCount;
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

    deptClick(evt: Event, deptDepartmentUID: number | string) {
        this.activeDeptId = Number(deptDepartmentUID) || 0;
        this.addSaleItemtoCart();
    }

    addSaleItemtoCart() {

        if (this.saleItemPrice > 0 && this.activeDeptId > 0) {

            let rovDept: ROV_Department = this.deptCategoryList.filter(dept => dept.departmentUID === this.activeDeptId)[0];
            let saleItem: Rov_SalesTranCheckoutItem = new Rov_SalesTranCheckoutItem();
            saleItem.departmentUid = this.activeDeptId;
            saleItem.unitPrice = this.saleItemPrice;
            saleItem.salesItemDesc = rovDept ? rovDept.description : '';
            //saleItem.salesItemUID = this._utilSvc.getUniqueNumberForDay();
            saleItem.isMiscellaneous = false;
            saleItem.custInfoReq = rovDept ? rovDept.custInfoReq : false;
            saleItem.ticketDetailId = -1 * (this.checkOutItemCount + 1);
            saleItem.salesTaxPct = rovDept ? rovDept.salesTaxPct : 0;
            saleItem.lineItemDollarDisplayAmount = 0;
            saleItem.lineItemTaxAmount = 0;
            saleItem.discountAmount = 0;
            saleItem.couponLineItemDollarAmount = 0;
            saleItem.fcCouponLineItemDollarAmount = 0;
            saleItem.dcCouponLineItemDollarAmount = 0;
            saleItem.dcDiscountAmount = 0;
            saleItem.dcLineItemTaxAmount = 0;
            saleItem.quantity = 1;

            this._store.dispatch(addRovSaleItem({ saleItem: saleItem, defCurrSymbl: this.defCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate() })); 
            this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
            this.activeDeptId = 0;
            this.saleItemPrice = 0;
        }


    }

    // onSaleItemPriceEntered(saleItemPrice: number): void {
    //     this.saleItemPrice = saleItemPrice ?? 0;
    //     this.addSaleItemtoCart();
    // }

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
            departmentNames: this.deptCategoryList.map(dept => ({
                departmentUID: dept.departmentUID,
                departmentName: dept.description
            }))
        };
        modalRef.componentInstance.allSaleItems = this.deptCategoryList;
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

    
      appendDigit(digit: number): void {
        const currentCents = Math.round((this.saleItemPrice ?? 0) * 100);
        this.saleItemPrice = (currentCents * 10 + digit) / 100;
      }
    
      appendDoubleZero(): void {
        const currentCents = Math.round((this.saleItemPrice ?? 0) * 100);
        this.saleItemPrice = currentCents;
      }
    
      backspace(): void {
        const currentCents = Math.round((this.saleItemPrice ?? 0) * 100);
        this.saleItemPrice = Math.floor(currentCents / 10) / 100;
      }
    
      clear(): void {
        this.saleItemPrice = 0;
      }
    
      enter(): void {
        this.addSaleItemtoCart();
      }
}
