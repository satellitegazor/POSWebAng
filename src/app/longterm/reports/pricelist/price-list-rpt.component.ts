import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosApiService } from '../../services/pos-api-service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { Router } from '@angular/router';
import { LTC_ItemButtonMenuResults, LTC_ItemButtonMenuResultsModel } from '../../models/item.button.menu.models';

// View models for grouped menu structure
export interface LTC_Department {
  facilityUid: number;
  departmentUid: number;
  description: string;
  locationUid: number;
  locationName: string;
  allowTags: boolean | null;
  custInfoReq: boolean | null;
  feePercent: number;
  openCashDrwForTips: boolean | null;
  allowTips: boolean;
  allowEnvTax: boolean;
}

export interface SalesCategory {
  locationUid: number;
  facilityUid: number;
  displayOrder: number;
  departmentUid: number;
  businessFunctionId: number;
  salesCategoryId: number;
  salesCatTypeUid: number;
  salesCategoryDescription: string;
  price: number | null;
  allowEnvTax: boolean | null;
}

export interface SalesItem {
  locationUid: number;
  facilityUid: number;
  displayOrderItem: number;
  businessFunctionId: number;
  salesCategoryId: number;
  salesItemId: number;
  salesItemDescription: string;
  salesCategoryDescription: string;
  salesTax: number;
  price: string;
  exchCouponsAfterTax: boolean | null;
  vendCouponsAfterTax: boolean | null;
  allowTaxExemption: boolean | null;
  allowEnvTax: boolean | null;
  envTax: number;
  defaultCurrency: string;
  currencyCode: string;
  currencyDesc: string;
}

export interface MenuLocationSummary {
  locationUid: number;
  locationName: string;
  allowTaxExemption: boolean | null;
  vendCouponsAfterTax: boolean | null;
  exchCouponsAfterTax: boolean | null;
  openCashDrwForTips: boolean | null;
  businessModel: string;
}

export interface MenuModel {
  departments: LTC_Department[];
  salesCategories: SalesCategory[];
  gSalesCategories: SalesCategory[][];
  salesItems: SalesItem[];
  gSalesItems: SalesItem[][];
  locations: MenuLocationSummary[];
}

@Component({
  selector: 'app-price-list-rpt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-list-rpt.component.html',
  styleUrls: ['./price-list-rpt.component.css']
})
export class PriceListRptComponent implements OnInit {
  loading = false;
  menuItems: LTC_ItemButtonMenuResultsModel | null = null;
  menuModel: MenuModel | null = null;

  // Report parameters
  locationName: string = '';
  facilityNumber: string = '';
  contractNumber: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  currencySymbol: string = '';
  source: string = 'V';   // 'S' = SBM, 'V' = Vendor

  constructor(
    private posApiService: PosApiService,
    private logonDataService: LogonDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const locCnfg = this.logonDataService.getLocationConfig();
    this.locationName = locCnfg?.locationName || '';
    this.facilityNumber = locCnfg?.facilityNumber || '';
    this.contractNumber = locCnfg?.contractNumber || '';
    this.vendorName = locCnfg?.vendorName || '';
    this.vendorNumber = locCnfg?.vendorNumber || '';
    this.source = locCnfg?.isVendorLogin ? 'V' : 'S';
    this.loadConcessionMenuItems();
  }

  onRefreshClick(): void {
    this.loadConcessionMenuItems();
  }

  loadConcessionMenuItems(): void {
    const locCnfg = this.logonDataService.getLocationConfig();

    const locationUID = locCnfg?.locationUID || 0;
    const contractUID = locCnfg?.contractUID || 0;
    const facilityUID = locCnfg?.facilityUID || 0;
    const businessFunctionUID = locCnfg?.businessFunctionUID || 0;
    const uid = locCnfg?.individualUID?.toString() || '0';

    this.loading = true;
    this.posApiService.getConcessionMenuItem(
      locationUID,
      contractUID,
      facilityUID,
      businessFunctionUID,
      0,  // pSalesCatUID - default 0 for all categories
      0,  // pDepartmentUID - default 0 for all departments
      uid
    ).subscribe({
      next: (result: LTC_ItemButtonMenuResultsModel) => {
        this.menuItems = result;
        this.menuModel = this.buildMenuModel(result);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading concession menu items', err);
        this.loading = false;
      }
    });
  }

  buildMenuModel(result: LTC_ItemButtonMenuResultsModel): MenuModel {
    const items = result?.itemButtonMenuResults ?? [];

    const menuModel: MenuModel = {
      departments: [],
      salesCategories: [],
      gSalesCategories: [],
      salesItems: [],
      gSalesItems: [],
      locations: []
    };

    if (!items.length) return menuModel;

    // Distinct departments by {departmentUid, facilityUid}
    const deptSeen = new Map<string, boolean>();
    menuModel.departments = items
      .filter(x => {
        const key = `${x.departmentUid}_${x.facilityUid}`;
        if (deptSeen.has(key)) return false;
        deptSeen.set(key, true);
        return true;
      })
      .map(d => ({
        facilityUid: d.facilityUid,
        departmentUid: d.departmentUid,
        description: d.departmentName,
        locationUid: d.locationUid,
        locationName: d.locationName,
        allowTags: d.allowTags,
        custInfoReq: d.custInfoReq,
        feePercent: d.feePercent,
        openCashDrwForTips: d.openCashDrwForTips,
        allowTips: d.allowTips ?? false,
        allowEnvTax: d.allowEnvTax ?? false
      }));

    // For each department, build a distinct-by-salesCategoryId list of sales categories
    const gSalesCategories: SalesCategory[][] = [];
    for (const _dept of menuModel.departments) {
      const catSeen = new Map<number, boolean>();
      const cats: SalesCategory[] = items
        .filter(x => {
          if (catSeen.has(x.salesCategoryId)) return false;
          catSeen.set(x.salesCategoryId, true);
          return true;
        })
        .map(x => ({
          locationUid: x.locationUid,
          facilityUid: x.facilityUid,
          displayOrder: x.displayOrder,
          departmentUid: x.departmentUid,
          businessFunctionId: x.businessFunctionUid,
          salesCategoryId: x.salesCategoryId,
          salesCatTypeUid: x.salesCatTypeUid,
          salesCategoryDescription: x.salesCategoryDescription,
          price: x.price,
          allowEnvTax: x.allowEnvTax
        }));
      menuModel.salesCategories = cats;
      gSalesCategories.push(cats);
    }
    menuModel.gSalesCategories = gSalesCategories;

    // For each sales category in each group, build a distinct-by-salesItemId list of sales items
    const gSalesItems: SalesItem[][] = [];
    for (const catGroup of menuModel.gSalesCategories) {
      if (catGroup) {
        for (let i = 0; i < catGroup.length; i++) {
          const itemSeen = new Map<number, boolean>();
          const salesItems: SalesItem[] = items
            .filter(x => {
              if (itemSeen.has(x.salesItemId)) return false;
              itemSeen.set(x.salesItemId, true);
              return true;
            })
            .map(x => ({
              locationUid: x.locationUid,
              facilityUid: x.facilityUid,
              displayOrderItem: x.displayOrderItem,
              businessFunctionId: x.businessFunctionUid,
              salesCategoryId: x.salesCategoryId,
              salesItemId: x.salesItemId,
              salesItemDescription: x.salesItemDescription,
              salesCategoryDescription: x.salesCategoryDescription,
              salesTax: parseFloat((x.salesTax ?? 0).toFixed(4)),
              price: (x.price ?? 0).toFixed(2),
              exchCouponsAfterTax: x.exchCouponsAfterTax,
              vendCouponsAfterTax: x.vendCouponsAfterTax,
              allowTaxExemption: x.allowTaxExemption,
              allowEnvTax: x.allowEnvTax,
              envTax: x.envTax ?? 0,
              defaultCurrency: x.defaultCurrency,
              currencyCode: x.currencyCode,
              currencyDesc: x.currencyDesc
            }));
          menuModel.salesItems = salesItems;
          gSalesItems.push(salesItems);
        }
      }
    }
    menuModel.gSalesItems = gSalesItems;

    // Distinct locations by locationUid
    const locSeen = new Map<number, boolean>();
    menuModel.locations = items
      .filter(x => {
        if (locSeen.has(x.locationUid)) return false;
        locSeen.set(x.locationUid, true);
        return true;
      })
      .map(x => ({
        locationUid: x.locationUid,
        locationName: x.locationName,
        allowTaxExemption: x.allowTaxExemption,
        vendCouponsAfterTax: x.vendCouponsAfterTax,
        exchCouponsAfterTax: x.exchCouponsAfterTax,
        openCashDrwForTips: x.openCashDrwForTips,
        businessModel: x.businessModel
      }));

    return menuModel;
  }

  // Template helper methods
  getDepartmentsForLocation(locationUid: number): LTC_Department[] {
    return this.menuModel?.departments.filter(d => d.locationUid === locationUid) ?? [];
  }

  getCategoriesForDepartment(departmentUid: number): SalesCategory[] {
    if (!this.menuModel) return [];
    const seen = new Set<number>();
    return this.menuModel.salesCategories
      .filter(sc => sc.departmentUid === departmentUid && !seen.has(sc.salesCategoryId) && seen.add(sc.salesCategoryId))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getItemsForCategory(salesCategoryId: number): SalesItem[] {
    return (this.menuModel?.salesItems ?? [])
      .filter(si => si.salesCategoryId === salesCategoryId && si.price != null);
  }

  hasSetupItems(salesCategoryId: number): boolean {
    return this.getItemsForCategory(salesCategoryId).some(
      si => si.price !== '0.00' || si.displayOrderItem === 0
    );
  }

  get hasData(): boolean {
    return (this.menuModel?.locations?.length ?? 0) > 0;
  }

  onEmailClick(): void {
    console.log('Email - to be implemented');
  }

  onPrintClick(): void {
    window.print();
  }

  onReportsClick(): void {
    console.log('Navigate to reports');
  }

  onContractListingClick(): void {
    this.router.navigate(['/contracts']);
  }

  onSalesTransactionClick(): void {
    this.router.navigate(['/sales-transaction']);
  }
}
