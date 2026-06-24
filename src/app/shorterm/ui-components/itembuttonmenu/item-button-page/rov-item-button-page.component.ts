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

    this._rovApiSvc.loadSaleTaxPct(this.eventId, eventConfig.individualUID).subscribe({
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

  

  deptClicked(id: any) {
    this.deptIdSelected = id;
  }




  public deptList: ROV_Department[] = [];
  


  btnSaveClick() {

    let saveModel = new ROV_SaleTaxSaveModel();
    saveModel.bApplyConcDiscounts = this.concessionDiscountAfterTax;
    saveModel.bApplyExchCoupons = this.exchangeCouponAfterTax;
    saveModel.defaultCurrency = this.defaultCurrency;
    saveModel.currencyCode = this.currCode;
    saveModel.lstSaleTax = this.saleTaxItems;

    this._rovApiSvc.saveSaleTaxPct(this.eventId, 
      this.vendorLoginResult.individualUID, saveModel).subscribe({
      next: (response) => {
        this._toastSvc.success('Sale Tax Percent saved successfully.');   
      },
      error: (error) => {
        this._toastSvc.error('Error saving Sale Tax Percent.');
      }
    });
  }

  openMainMenu() {
    this._router.navigate(['rov/rmainmenu']);
  }

  onSalesCategoryListRefresh() {
    this.getAllSaleItems(+this.vendorLoginResult.locationUID, this.vendorLoginResult.contractUID, 0, 0, 0, 0);
  }

  copyFirstSaleTaxPctToAll(): void {
    if (!this.saleTaxItems || this.saleTaxItems.length < 2) {
      return;
    }

    const firstSaleTaxPct = this.saleTaxItems[0]?.salesTaxPct;
    this.saleTaxItems.forEach((item, index) => {
      if (index > 0) {
        item.salesTaxPct = firstSaleTaxPct;
      }
    });
  }



}
