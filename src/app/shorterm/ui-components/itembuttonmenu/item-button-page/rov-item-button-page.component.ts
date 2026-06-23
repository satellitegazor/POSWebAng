import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
//import { LogonDataService } from '../../../../global/logon-data-service.service';
import { RovLogonDataService } from "../../../rov-logon-data.service";
import { SharedSubjectService } from '../../../../shared-subject/shared-subject.service';
//import { PosApiService } from '../../services/pos-api-service';
//import { LocationConfigState } from '../../../../app.state';
//import { saleTranDataInterface } from '../../saletran/store/ticketstore/ticket.state';
import { RovApiService } from "../../../short-term.service";
import { EventConfigState } from '../../../../app.state';
import { RovSaleTranDataInterface } from '../../../store/ticketstore/rticket.state';
import { Subject } from 'rxjs';
import { VendorLoginResultsModel } from '../../../../models/vendor.login.results.model';
import { CPOSAppType, UtilService } from '../../../../services-misc/util.service';
import { GlobalConstants } from '../../../../global/global.constants';
import { Rov_SalesTranCheckoutItem } from '../../../models/r-salestran-checkout-item';
//import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { ThisReceiver } from '@angular/compiler';
import { ToastService } from '../../../../services-misc/toast.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PosCurrency3Directive } from '../../../../directives/pos-currency.directive.3';
import { RDeptCategoryResultModels, ROV_SaleTaxSave, ROV_SaleTaxSaveModel } from '../../../models/models';
import { ROV_Department } from '../../../../longterm/models/ticket.list';

@Component({
  selector: 'app-rov-item-button-page',
  templateUrl: './rov-item-button-page.component.html',
  styleUrls: ['./rov-item-button-page.component.css'],
  imports: [CommonModule, FormsModule, PosCurrency3Directive] 
})
  export class RovItemButtonPageComponent implements OnInit, OnDestroy {
  
  listInitialized: boolean = false;  
  // In your component.ts
  defaultCurrency: string = 'EUR'; // or 'USD'
  canChangeCurrency: boolean = true;
  saleTranCount: number = 0;
  defCurrDisabledTooltip: string = 'Default currency is disabled because transactions already exist for this setup, and it cannot be changed now.';
  allowTaxExemption: boolean = true;
  concessionDiscountAfterTax: boolean = false;
  exchangeCouponAfterTax: boolean = false;
  openCashDrawerForTips: boolean = false;
  eventId: number = 0;
  eventName: string = '';
  disableSaveBtn: any;
  rgnCode: string = 'CON';
  currCode: string = '';
  currCodeSymbl: string = '';

  saleTaxItems: ROV_SaleTaxSave[] = [];
  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  constructor(private _rovApiSvc: RovApiService, 
    private _logonDataSvc: RovLogonDataService,
    private _sharedSubSvc: SharedSubjectService, 
    private modalService: NgbModal, 
    private _store: Store<RovSaleTranDataInterface>,
    private _locConfigStore: Store<EventConfigState>, 
    private _utilSvc: UtilService,
    private _toastSvc: ToastService,
    private _router: Router ) {
    //console.log('SalesCart constructor')
  }

    allItemButtonMenuList: ROV_Department[] = [];
  public salesItemAddedInSC: Subject<Rov_SalesTranCheckoutItem> = new Subject<Rov_SalesTranCheckoutItem>();
  vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

  deptIdSelected: number = 0;
  salesCatIdSelected: number = 0

  ngOnInit(): void {

    let eventConfig = this._logonDataSvc.getRovEventConfig();
    this.eventId = eventConfig.eventID;
    this.eventName = eventConfig.eventName;
    this.defaultCurrency = eventConfig.defaultCurrency;
    this.concessionDiscountAfterTax = eventConfig.vendCouponsAfterTax;
    this.exchangeCouponAfterTax = eventConfig.exchCouponsAfterTax;
    this.rgnCode = eventConfig.rgnCode;
    this.openCashDrawerForTips = eventConfig.openCashDrawer;
    this.currCode = eventConfig.currCode;
    this.currCodeSymbl = this._utilSvc.currencySymbols.get(this.currCode) || this.currCode;
    this.rgnCode = eventConfig.rgnCode;

    this.vendorLoginResult = this._logonDataSvc.getRovVendorLogonData();

    this._rovApiSvc.loadSaleTaxPct(this.eventId, +this.vendorLoginResult.individualUID).subscribe({
      next: (response: ROV_SaleTaxSaveModel) => {
        // Handle the response if needed
        this.defaultCurrency = response?.defaultCurrency ?? this.defaultCurrency;
        this.concessionDiscountAfterTax = response?.bApplyConcDiscounts ?? this.concessionDiscountAfterTax;
        this.exchangeCouponAfterTax = response?.bApplyExchCoupons ?? this.exchangeCouponAfterTax;
        this.saleTaxItems = response?.lstSaleTax ?? [];
      },
      error: (error) => {
        // Handle the error if needed
      }
    });

    this._rovApiSvc.getTranCountForEvent(
      Number(this.vendorLoginResult.locationUID),
      this.vendorLoginResult.individualUID
    ).subscribe({
      next: (response) => {
        const tranCount = response?.tranCount ?? 0;
        this.saleTranCount = tranCount;
        sessionStorage.setItem('SaleTranCount', tranCount.toString());
        // Disable currency controls when at least one transaction exists.
        this.canChangeCurrency = tranCount <= 0;
      },
      error: () => {
        // Keep previous behavior as fallback if service call fails.
        const saleTranCountStr = sessionStorage.getItem('SaleTranCount');
        const saleTranCount = saleTranCountStr ? parseInt(saleTranCountStr, 10) : 0;
        this.saleTranCount = saleTranCount;
        this.canChangeCurrency = saleTranCount === 0;
      }
    });
    



  }

  private getAllSaleItems(eventId: number, contractId: number, facilityid: number, businessFunctionId: number, salesCategoryId: number, departmentId: number): void {

    this._rovApiSvc.getConcessionMenuItem(this._logonDataSvc.getRovEventConfig().individualUID.toString(),
       eventId, facilityid, true).subscribe((data: RDeptCategoryResultModels) => {

      this.allItemButtonMenuList = data.lstItemButtons; //.filter(item => (item.salesItemDescription !== 'Enter Item Description Here' && item.saleItemActive) || (item.salesItemDescription == 'Enter Item Description Here' && !item.saleItemActive));
      this.deptIdSelected = this.deptIdSelected > 0 ? this.deptIdSelected : this.allItemButtonMenuList[0].departmentUID;
      this.getDeptList();
      //this.salesCatIdSelected = this.salesCatIdSelected > 0 ? this.salesCatIdSelected : this.allItemButtonMenuList[0].salesCategoryID;
      //this.getSalesCategoryList(this.deptIdSelected);
      //this.getSaleItemList(this.salesCatIdSelected);

    });

  }

  ngOnDestroy(): void {
    this.salesItemAddedInSC.unsubscribe();
  }


  public getDeptList(): void {

    this.allItemButtonMenuList.forEach(item => {
      let dptCount = this.deptList.filter(d => d.departmentUID == item.departmentUID).length;
      if (dptCount == 0) {
        let dpt = new ROV_Department();
        dpt.departmentUID = item.departmentUID;
        dpt.description = item.description;
        this.deptList.push(dpt);
      }
    });
    //this.deptListRefreshEvent.next(true);

    //this.getSalesCategoryList(this.deptIdSelected > 0 ? this.deptIdSelected : this.deptList[0].departmentUID);
  }

  // public getSalesCategoryList(deptId: number): void {

  //   this.saleCatList = [];
  //   let allDeptList = this.allItemButtonMenuList.filter(item => item.departmentUID == deptId && item.salesCatActive);
  //   allDeptList.forEach(itm => {
  //     let k = this.saleCatList.filter(ct => ct.salesCategoryUID == itm.salesCategoryID);

  //     if (k.length == 0) {
  //       let cat = new SalesCat();
  //       cat.salesCategoryUID = itm.salesCategoryID;
  //       cat.description = itm.salesCategoryDescription;
  //       cat.departmentName = itm.departmentName;
  //       cat.departmentUID = itm.departmentUID;
  //       cat.salesCatTypeUID = itm.salesCatTypeUID;
  //       cat.displayOrder = itm.displayOrder;
  //       cat.cliTimeVar = GlobalConstants.GetClientTimeVariance();
  //       cat.maintUserId = +this.vendorLoginResult.individualUID
  //       cat.active = itm.salesCatActive
        
  //       this.saleCatList.push(cat);
  //     }

  //     this.salesCatIdSelected = (this.salesCatIdSelected > 0 && this.saleCatList.filter(cat => cat.salesCategoryUID == this.salesCatIdSelected).length == 0) ? 
  //       this.saleCatList[0].salesCategoryUID : this.salesCatIdSelected;
  //   });
  //   //console.log('setting salesCategoryListRefresh to true');
  //   this.salesCategoryListRefreshEvent.next(true);

  //   this.getSaleItemList(this.salesCatIdSelected > 0 ? this.salesCatIdSelected : this.saleCatList[0].salesCategoryUID);
  // }

  // public getSaleItemList(categoryId: number): void {

  //   this.saleItemList = [];
  //   let allCatList = this.allItemButtonMenuList.filter(item => item.salesCategoryID == categoryId);

  //   allCatList.forEach(itm => {
  //     let k = this.saleItemList.filter(si => si.id == itm.salesItemID);
  //     if (k.length == 0) {
  //       itm.price = itm.price ?? 0;
  //       itm.salesTax = itm.salesTax ?? 0;
  //       this.saleItemList.push(new SaleItemButton(itm));
  //     }
  //   });
    
  //   let inActiveSaleItems = this.saleItemList.filter(item => item.active == false);
  //   this.saleItemList = this.saleItemList.length == 1 && this.saleItemList.filter(si => si.description == 'Enter Item Description Here' && si.id > 0).length == 1 ?
  //       this.saleItemList : this.saleItemList.filter(si => si.active);

   
  //   if(this.saleItemList.length > 0) {
  //     let emptySaleItem = inActiveSaleItems.filter(item => item.description == 'Enter Item Description Here' && item.price == 0 && item.salesTax == 0)[0]
  //     this.saleItemList = this.saleItemList.concat(emptySaleItem ? [emptySaleItem] : []);
  //   }

  //   this.saleItemList.sort((a, b) => (a.active ? 0 : 1) - (b.active ? 0 : 1) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  //   //console.log('setting salesItemListRefresh to true');
  //   this.salesItemListRefresh.next(true)
  //   this.listInitialized = true;
  // }

  deptClicked(id: any) {
  //  this.getSalesCategoryList(id);
    this.deptIdSelected = id;
  }

  // saleCatClicked(id: any) {
  //   this.getSaleItemList(id);
  //   this.salesCatIdSelected = id;
  // }

  saleItemClicked(id: any) {
    //console.log('Sale Item Clicked: ' + id);
  }



  public deptList: ROV_Department[] = [];
  // public saleItemList: SaleItemButton[] = [];
  // public saleCatList: SalesCat[] = [];

  // btnAddItemClick($event: PointerEvent) {

  //   let saleItemCount = this.allItemButtonMenuList.filter(item => item.departmentUID == this.deptIdSelected && item.salesCategoryID == this.salesCatIdSelected).length;
  //   if(saleItemCount == 30) {
  //     this._toastSvc.error('Maximum of 30 items allowed per category.');
  //     return;
  //   }

  //   const saleItems = this.salesItemListChild.getChangedItems();
    
  //   if (saleItems && saleItems.length > 0) {
  //     this._toastSvc.warning('Please save the recently added item before adding a new one.');
  //     return;
  //   }     

  //   let newSaleItem: SaleItem = JSON.parse(JSON.stringify(this.allItemButtonMenuList.filter(item => item.departmentUID == this.deptIdSelected && item.salesCategoryID == this.salesCatIdSelected)[0]));
    
  //   let newSaleItemButton = new SaleItemButton(newSaleItem);
  //   newSaleItemButton.id = 0;
  //   newSaleItemButton.description = 'Enter Item Description Here';
  //   newSaleItemButton.price = 0;
  //   newSaleItemButton.salesTax = 0;
  //   newSaleItemButton.displayOrder = this.saleItemList.length + 1;

  //   this.saleItemList.push(newSaleItemButton);
  //   this.salesItemListRefresh.next(true);
  // }

  btnSalesTranClick($event: PointerEvent) {
    this._router.navigate(['/salestran']);
  }

  btnSaveClick() {


    const payload1 = {
      department: this.deptIdSelected,

    }

    // let payload: LTC_SaveSalesItemModelParameters = {
    //   ContractUID: +this.vendorLoginResult.contractUID,
    //   AllowTaxExemption: this.allowTaxExemption,
    //   ExchCouponsAfterTax: this.exchangeCouponAfterTax,
    //   VendCouponsAfterTax: this.concessionDiscountAfterTax,
    //   OpenCashDrawerForTips: this.openCashDrawerForTips,
    //   DefaultCurrency: this.defaultCurrency,  
    //   SalesItems: saleItems.length > 0 ? saleItems.map<LTC_SalesItems>(item => {
 
    //     let salesItem = new LTC_SalesItems();
    //     salesItem.DisplayOrderItem = item.displayOrder;
    //     salesItem.FacilityUID = +this.vendorLoginResult.locationUID;
    //     salesItem.LocationUID = +this.vendorLoginResult.locationUID;
    //     salesItem.BusinessFunctionID = 0;
    //     salesItem.SalesCategoryID = item.salesCategoryID;
    //     salesItem.SalesItemID = item.id;
    //     salesItem.SalesItemDescription = item.description;
    //     salesItem.Price = item.price;
    //     salesItem.SalesTax = item.salesTax;
    //     salesItem.Action = item.id > 0 ? 2 : 1; // 2 = update, 1 = insert
    //     return salesItem;
    //   }) : [] as LTC_SalesItems[],
    // }

    // console.log('Saving payload: ', payload);
    // this._saleTranSvc.saveItemButtonMenu(payload, +this.vendorLoginResult.individualUID).subscribe(response => {
    //   this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
    //   this._toastSvc.success('Menu Items saved successfully.');
    //   console.log('Save response: ', response);
    // });
  }

  onSalesCategoryListRefresh() {
    this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
  }

  deleteItem($event: ROV_Department) {
    // let itemToBeDeleted = this.saleItemList.find(item => item.id === $event.salesItemID);
    // if (itemToBeDeleted) {
    //   this.saleItemList = this.saleItemList.filter(item => item.id !== itemToBeDeleted!.id);
    //   this.salesItemListRefresh.next(true);
    // }

    // let salesItemToDelete = new LTC_SalesItems();
    // salesItemToDelete.DisplayOrderItem = itemToBeDeleted!.displayOrder;
    // salesItemToDelete.FacilityUID = +this.vendorLoginResult.locationUID;
    // salesItemToDelete.LocationUID = +this.vendorLoginResult.locationUID;
    // salesItemToDelete.BusinessFunctionID = 0;
    // salesItemToDelete.SalesCategoryID = itemToBeDeleted!.salesCategoryID;
    // salesItemToDelete.SalesItemID = itemToBeDeleted!.id;
    // salesItemToDelete.SalesItemDescription = itemToBeDeleted!.description;
    // salesItemToDelete.Price = itemToBeDeleted!.price;
    // salesItemToDelete.SalesTax = itemToBeDeleted!.salesTax;
    // salesItemToDelete.Action = 3; // 3 = delete

    // let payload: LTC_SaveSalesItemModelParameters = {
    //   ContractUID: +this.vendorLoginResult.contractUID,
    //   AllowTaxExemption: this.allowTaxExemption,
    //   ExchCouponsAfterTax: this.exchangeCouponAfterTax,
    //   VendCouponsAfterTax: this.concessionDiscountAfterTax,
    //   OpenCashDrawerForTips: this.openCashDrawerForTips,
    //   DefaultCurrency: this.defaultCurrency,
    //   SalesItems: [salesItemToDelete]
    // };

    // this._saleTranSvc.saveItemButtonMenu(payload, +this.vendorLoginResult.individualUID).subscribe(response => {
    //   this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
    //   this._toastSvc.success('Item Button Menu saved successfully.');
    //   console.log('Save response: ', response);
    // });


  }
  updateItem($event: ROV_Department) {
    this.btnSaveClick();    
  }

  addItem($event: ROV_Department) {
    this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
  }
  updateCategory($event: Event) {
    this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
  }
  addCategory($event: Event) {
    this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
  }

  copyFirstSaleTaxPctToAll(): void {
    if (!this.saleTaxItems || this.saleTaxItems.length < 2) {
      return;
    }

    const firstSaleTaxPct = this.saleTaxItems[0]?.saleTaxPct;
    this.saleTaxItems.forEach((item, index) => {
      if (index > 0) {
        item.saleTaxPct = firstSaleTaxPct;
      }
    });
  }

  openAdminMenu() {
    console.log('Navigating to Admin Menu');
    this._router.navigate(['/adminmenu']);
  }


}
