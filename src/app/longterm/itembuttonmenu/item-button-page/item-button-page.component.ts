import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ItemButtonDeptListComponent } from '../item-button-dept-list/item-button-dept-list.component';
import { ItemButtonSalesCatListComponent } from '../item-button-sales-cat-list/item-button-sales-cat-list.component';
import { ItemButtonSalesItemListComponent } from '../item-button-sales-item-list/item-button-sales-item-list.component';
import { Dept, SaleItem, SalesCat } from '../../models/sale.item';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from 'src/app/shared-subject/shared-subject.service';
import { SalesTranService } from '../../saletran/services/sales-tran.service';
import { LocationConfigState } from '../../saletran/store/locationconfigstore/locationconfig.state';
import { saleTranDataInterface } from '../../saletran/store/ticketstore/ticket.state';
import { Subject } from 'rxjs';
import { VendorLoginResultsModel } from 'src/app/models/vendor.login.results.model';
import { UtilService } from 'src/app/services/util.service';
import { GlobalConstants } from 'src/app/global/global.constants';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { ThisReceiver } from '@angular/compiler';
import { SaleItemButton } from '../../models/sale.item.button';

@Component({
  selector: 'app-item-button-page',
  templateUrl: './item-button-page.component.html',
  styleUrl: './item-button-page.component.css',
  standalone: false
})
export class ItemButtonPageComponent implements OnInit, OnDestroy {
deleteItem($event: SaleItem) {
throw new Error('Method not implemented.');
}
updateItem($event: SaleItem) {
throw new Error('Method not implemented.');
}
addItem($event: SaleItem) {
throw new Error('Method not implemented.');
}
updateCategory($event: Event) {
throw new Error('Method not implemented.');
}
addCategory($event: Event) {
throw new Error('Method not implemented.');
}
selectCategory($event: Event) {
throw new Error('Method not implemented.');
}
  
  listInitialized: boolean = false;  
  // In your component.ts
  defaultCurrency: string = 'EUR'; // or 'USD'
  allowTaxExemption: boolean = true;
  concessionDiscountAfterTax: boolean = false;
  exchangeCouponAfterTax: boolean = false;
  openCashDrawerForTips: boolean = false;
  LocationName: string = '';
  disableSaveBtn: any;
  rgnCode: string = 'CON';
  currCode: string = '';
  currCodeSymbl: string = '';
  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  constructor(private _saleTranSvc: SalesTranService, 
    private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService, 
    private modalService: NgbModal, 
    private _store: Store<saleTranDataInterface>,
    private _locConfigStore: Store<LocationConfigState>, 
    private _utilSvc: UtilService) {
    //console.log('SalesCart constructor')
  }

  @ViewChild(ItemButtonSalesItemListComponent) salesItemListChild!: ItemButtonSalesItemListComponent;

  allItemButtonMenuList: SaleItem[] = [];
  public deptListRefreshEvent : Subject<boolean> = new Subject<boolean>();
  public salesCategoryListRefreshEvent: Subject<boolean> = new Subject<boolean>();
  public salesItemListRefresh: Subject<boolean> = new Subject<boolean>();
  public salesItemAddedInSC: Subject<SaleItem> = new Subject<SaleItem>();
  vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

  deptIdSelected: number = 0;
  salesCatIdSelected: number = 0

  ngOnInit(): void {

    let locationConfig = this._logonDataSvc.getLocationConfig();
    this.LocationName = locationConfig.locationName;
    this.defaultCurrency = locationConfig.defaultCurrency;
    this.concessionDiscountAfterTax = locationConfig.vendCouponsAfterTax;
    this.exchangeCouponAfterTax = locationConfig.exchCouponsAfterTax;
    this.rgnCode = locationConfig.rgnCode;
    this.openCashDrawerForTips = locationConfig.openCashDrawer;
    this.currCode = locationConfig.currCode;
    this.currCodeSymbl = this._utilSvc.currencySymbols.get(this.currCode) || this.currCode;

    this.deptListRefreshEvent.next(false);
    this.salesCategoryListRefreshEvent.next(false);
    this.salesItemListRefresh.next(false);

    this.vendorLoginResult = this._logonDataSvc.getLTVendorLogonData();
    this._saleTranSvc.getSaleItemListFromDB(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0).subscribe(data => {
      this.allItemButtonMenuList = data.itemButtonMenuResults;
      this.getDeptList();
    });

    this.salesItemAddedInSC.subscribe(data => {
      //console.log('subscription called salesItemAddedInSC: ' + data);
      if (data.salesItemID > 0) {
        data.locationUID = +this.vendorLoginResult.locationUID;
        data.contractUID = this.vendorLoginResult.contractUID;
        this.saleItemList.push(new SaleItemButton(data));
        //this.getSaleItemList(data);
      }
    });

  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }


  public getDeptList(): void {

    this.deptIdSelected = this.allItemButtonMenuList[0].departmentUID;
    this.salesCatIdSelected = this.allItemButtonMenuList[0].salesCategoryID;

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
        cat.salesCatTypeUID = itm.salesCatTypeUID;
        cat.displayOrder = itm.displayOrder;
        cat.cliTimeVar = GlobalConstants.GetClientTimeVariance();
        cat.maintUserId = +this.vendorLoginResult.individualUID
        cat.active = itm.salesCatActive
        
        this.saleCatList.push(cat);
        //this.saleCatList.push(itm);
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
      let k = this.saleItemList.filter(si => si.id == itm.salesItemID);
      if (k.length == 0) {
        this.saleItemList.push(new SaleItemButton(itm));
      }
    });
    //console.log('setting salesItemListRefresh to true');
    this.salesItemListRefresh.next(true)
    this.listInitialized = true;
  }

  deptClicked(id: any) {
    this.getSalesCategoryList(id);
    this.deptIdSelected = id;
  }

  saleCatClicked(id: any) {
    this.getSaleItemList(id);
    this.salesCatIdSelected = id;
  }

  saleItemClicked(id: any) {
    //console.log('Sale Item Clicked: ' + id);
  }


  public deptList: Dept[] = [];
  public saleItemList: SaleItemButton[] = [];
  public saleCatList: SalesCat[] = [];

  btnAddItemClick($event: PointerEvent) {
     
    let newSaleItem: SaleItem = JSON.parse(JSON.stringify(this.allItemButtonMenuList.filter(item => item.departmentUID == this.deptIdSelected && item.salesCategoryID == this.salesCatIdSelected)[0]));
    let newSaleItemButton = new SaleItemButton(newSaleItem);
    
    this.saleItemList.push(newSaleItemButton);
    this.salesItemListRefresh.next(true);
  }

  btnSalesTranClick($event: PointerEvent) {
    throw new Error('Method not implemented.');
  }

  btnSaveClick($event: PointerEvent) {
    const saleItems = this.salesItemListChild.getCurrentSalesItems();
    if(!saleItems || saleItems.length === 0){
      console.log('No items to save');
      return;
    }

    const payload = {
      department: this.deptIdSelected,
      category: this.salesCatIdSelected,
      salesItems: saleItems
    }

    console.log('Saving payload: ', payload);

    

  }
}
