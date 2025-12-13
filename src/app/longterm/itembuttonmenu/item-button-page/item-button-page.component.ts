import { Component, OnDestroy, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-item-button-page',
  templateUrl: './item-button-page.component.html',
  styleUrl: './item-button-page.component.css',
  standalone: false
})
export class ItemButtonPageComponent implements OnInit, OnDestroy {
btnSalesTranClick($event: PointerEvent) {
throw new Error('Method not implemented.');
}
disableSaveBtn: any;
btnSaveClick($event: PointerEvent) {
throw new Error('Method not implemented.');
}
btnAddItemClick($event: PointerEvent) {
throw new Error('Method not implemented.');
}
  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  constructor(private _saleTranSvc: SalesTranService, private _logonDataSvc: LogonDataService,
    private _sharedSubSvc: SharedSubjectService, private modalService: NgbModal, private _store: Store<saleTranDataInterface>,
    private _locConfigStore: Store<LocationConfigState>) {
    //console.log('SalesCart constructor')
  }
  
  allItemButtonMenuList: SaleItem[] = [];
  public salesCategoryListRefresh: Subject<boolean> = new Subject<boolean>();
  public salesItemListRefresh: Subject<boolean> = new Subject<boolean>();
  vendorLoginResult: VendorLoginResultsModel = {} as VendorLoginResultsModel;

  ngOnInit(): void {
    this.vendorLoginResult = this._logonDataSvc.getLTVendorLogonData();
    this._saleTranSvc.getSaleItemListFromDB(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0).subscribe(data => {
      this.allItemButtonMenuList = data.itemButtonMenuResults;
      this.getDeptList();
    });

  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
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


  public deptList: Dept[] = [];
  public saleItemList: SaleItem[] = [];
  public saleCatList: SalesCat[] = [];



}
