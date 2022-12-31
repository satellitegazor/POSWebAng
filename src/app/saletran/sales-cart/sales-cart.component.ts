import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GlobalConstants } from '../../global/global.constants';
import { LogonDataService } from '../../global/logon-data-service.service';
import { TicketSplit } from '../../models/ticket.split';
import { VendorLoginResultsModel } from '../../models/vendor.login.results.model';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { Dept, SaleItem, SalesCat } from '../models/sale.item';
import { SaleItemResultsModel } from '../models/sale.item.results.model';
import { SalesTranService } from '../services/sales-tran.service';
import { TktSaleItemComponent } from '../tkt-sale-item/tkt-sale-item.component';
import { ModalService, ModalCloseReason } from '@independer/ng-modal';
import { CustomerSearchComponent } from '../customer-search/customer-search.component';

import { getSaleItemsStart, getSaleItemsActionSuccess, getSaleitemsFail } from '../store/saleitemstore/saleitem.action';
import { props, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getSaleItemListSelector } from '../store/saleitemstore/saleitem.selector';
import { getLocationConfigSelector } from '../store/locationconfigstore/locationconfig.selector';
import { getLocationConfigStart } from '../store/locationconfigstore/locationconfig.action';
import { getAuthLoginSelector } from 'src/app/authstate/auth.selector';
import { LocationConfig, LocationIndividual } from '../models/location-config';


@Component({
  selector: 'app-sales-cart',
  templateUrl: './sales-cart.component.html',
  styleUrls: ['./sales-cart.component.css']
})
export class SalesCartComponent implements OnInit, OnDestroy {

    constructor(private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
        private _sharedSubSvc: SharedSubjectService, private modalService: ModalService, private _store: Store   ) {
        console.log('SalesCart constructor')        
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
    showErrMsg: boolean = false;
    locationConfig: LocationConfig = {} as LocationConfig;
    locationIndividuals: LocationIndividual[] = [];
    @ViewChild('tktSaleItemComponent')
    private tktSaleItemComponent: TktSaleItemComponent = {} as TktSaleItemComponent;

    ngOnInit(): void {
        console.log('SalesCart ngOnInit')
        this.vendorLoginResult = this._logonDataSvc.getLTVendorLogonData();

            //this.vendorLoginResult = this._logonDataSvc.getLTVendorLogonData();
            this._buildTktObj();
            this._saleTranSvc.getSaleItemListFromDB(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID).subscribe(data => {
                this.allItemButtonMenuList = data.itemButtonMenuResults;
                this.getDeptList();
            });

            this._saleTranSvc.getLocationConfig(+this.vendorLoginResult.locationUID, +this.vendorLoginResult.individualUID).subscribe(data => {
                this.locationConfig = data.configs[0];
                this.locationIndividuals = data.individuals;

                this._logonDataSvc.setLocationConfig(data);
            });
            
            // this._store.select(getSaleItemListSelector).subscribe(data => {
            //     if(data != null) {
            //         this.allItemButtonMenuList = data.itemButtonMenuResults;
            //         this.getDeptList();
            //     }
            // });
            //this._store.dispatch(getSaleItemsStart({locationId: +this.vendorLoginResult.locationUID, contractid: this.vendorLoginResult.contractUID}));
            //this._store.dispatch(getLocationConfigStart({locationId: +this.vendorLoginResult.locationUID, individualUID: +this.vendorLoginResult.individualUID}))

    }

    ngOnDestroy(): void {
        
    }

    public getDeptList(): void {
        console.log('SalesTranSvc getDeptList called')
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

        console.log('SalesCart getSalesCategoryList called');
        this.saleCatList = [];
        let allDeptList = this.allItemButtonMenuList.filter(item => item.departmentUID == deptId);
        allDeptList.forEach(itm => {
            let k = this.saleCatList.filter(ct => ct.salesCategoryID == itm.salesCategoryID);
            if (k.length == 0) {
                this.saleCatList.push(itm);
            }
        });
        this.getSaleItemList(this.saleCatList[0].salesCategoryID);
    }

    public getSaleItemList(categoryId: number): void {
        console.log('SalesTranSvc getSaleItemList called');
        this.saleItemList = [];
        let allCatList = this.allItemButtonMenuList.filter(item => item.salesCategoryID == categoryId);
        allCatList.forEach(itm => {
            let k = this.saleItemList.filter(si => si.salesItemID == itm.salesItemID);
            if (k.length == 0) {
                this.saleItemList.push(itm);
            }
        });
    }

    deptClicked(id: any) {
        this.getSalesCategoryList(id);
    }

    saleCatClicked(id: any) {
        this.getSaleItemList(id);
    }

    saleItemClicked(id: any) {
        console.log('Sale Item Clicked: ' + id);
    }

    private _buildTktObj() {

    }

    btnCheckoutClick(evt: Event) {
        this.tktSaleItemComponent.btnCheckoutClicked();
    }

    btnCustDetailsClick(evt: Event) {
        this.displayCustSearchDlg = "display";
        const modalRef = this.modalService.open(CustomerSearchComponent, m => {
            m.data = "search customer";
        });
    }    

    closeCustSearchDlg() {
        this.displayCustSearchDlg = "none";
    }
}
