import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services/toast.service';
import { Router } from '@angular/router';
import { LTC_ItemButtonMenuResults, LTC_ItemButtonMenuResultsModel } from '../../../../longterm/models/item.button.menu.models'
import { currSymbls } from '../../../../models/CurrencySymbols';
import { PosApiService } from '../../../../longterm/services/pos-api-service';

// View models for grouped menu structure
export interface LTC_Department {
  facilityUID: number;
  departmentUID: number;
  description: string;
  locationUID: number;
  locationName: string;
  allowTags: boolean | null;
  custInfoReq: boolean | null;
  feePercent: number;
  openCashDrwForTips: boolean | null;
  allowTips: boolean;
  allowEnvTax: boolean;
}

export interface SalesCategory {
  locationUID: number;
  facilityUID: number;
  displayOrder: number;
  departmentUID: number;
  businessFunctionUID: number;
  salesCategoryID: number;
  salesCatTypeUID: number;
  salesCategoryDescription: string;
  price: number | null;
  allowEnvTax: boolean | null;
}

export interface SalesItem {
  locationUID: number;
  facilityUID: number;
  displayOrderItem: number;
  businessFunctionUID: number;
  salesCategoryID: number;
  salesItemID: number;
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
  locationUID: number;
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
  selector: 'app-sbm-ltc-price-list-rpt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-list-rpt.component.html',
  styleUrls: ['./price-list-rpt.component.css']
})
export class SbmLtcPriceListRptComponent implements OnInit {
  loading = false;
  menuItems: LTC_ItemButtonMenuResultsModel | null = null;
  menuModel: MenuModel | null = null;
  private collapsedCategoryKeys = new Set<string>();

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
        this.collapsedCategoryKeys.clear();
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

    // Distinct locations by locationUID
    const locSeen = new Map<number, boolean>();
    menuModel.locations = items
      .filter(x => {
        if (locSeen.has(x.locationUID)) return false;
        locSeen.set(x.locationUID, true);
        return true;
      })
      .map(x => ({
        locationUID: x.locationUID,
        locationName: x.locationName,
        allowTaxExemption: x.allowTaxExemption,
        vendCouponsAfterTax: x.vendCouponsAfterTax,
        exchCouponsAfterTax: x.exchCouponsAfterTax,
        openCashDrwForTips: x.openCashDrwForTips,
        businessModel: x.businessModel
      }));

    // Distinct departments by {locationUID, departmentUID, facilityUID}
    const deptSeen = new Map<string, boolean>();
    menuModel.departments = items
      .filter(x => {
        const key = `${x.locationUID}_${x.departmentUID}_${x.facilityUID}`;
        if (deptSeen.has(key)) return false;
        deptSeen.set(key, true);
        return true;
      })
      .map(d => ({
        facilityUID: d.facilityUID,
        departmentUID: d.departmentUID,
        description: d.departmentName,
        locationUID: d.locationUID,
        locationName: d.locationName,
        allowTags: d.allowTags,
        custInfoReq: d.custInfoReq,
        feePercent: d.feePercent,
        openCashDrwForTips: d.openCashDrwForTips,
        allowTips: d.allowTips ?? false,
        allowEnvTax: d.allowEnvTax ?? false
      }));

    // Distinct sales categories by {locationUID, departmentUID, salesCategoryID, facilityUID}
    const catSeen = new Map<string, boolean>();
    menuModel.salesCategories = items
      .filter(x => {
        const key = `${x.locationUID}_${x.departmentUID}_${x.salesCategoryID}_${x.facilityUID}`;
        if (catSeen.has(key)) return false;
        catSeen.set(key, true);
        return true;
      })
      .map(x => ({
        locationUID: x.locationUID,
        facilityUID: x.facilityUID,
        displayOrder: x.displayOrder,
        departmentUID: x.departmentUID,
        businessFunctionUID: x.businessFunctionUID,
        salesCategoryID: x.salesCategoryID,
        salesCatTypeUID: x.salesCatTypeUID,
        salesCategoryDescription: x.salesCategoryDescription,
        price: x.price,
        allowEnvTax: x.allowEnvTax
      }));

    // Distinct sale items by {locationUID, departmentUID, salesCategoryID, salesItemID, facilityUID}
    const itemSeen = new Map<string, boolean>();
    menuModel.salesItems = items
      .filter(x => {
        const key = `${x.locationUID}_${x.departmentUID}_${x.salesCategoryID}_${x.salesItemID}_${x.facilityUID}`;
        if (itemSeen.has(key)) return false;
        itemSeen.set(key, true);
        return true;
      })
      .map(x => ({
        locationUID: x.locationUID,
        facilityUID: x.facilityUID,
        displayOrderItem: x.displayOrderItem,
        businessFunctionUID: x.businessFunctionUID,
        salesCategoryID: x.salesCategoryID,
        salesItemID: x.salesItemID,
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
        currencyCode: currSymbls.find(c => c.key === x.currencyCode)?.value ?? x.currencyCode,
        currencyDesc: x.currencyDesc
      }));

    // Keep grouped arrays aligned to hierarchy for compatibility
    menuModel.gSalesCategories = menuModel.departments.map((dept) =>
      menuModel.salesCategories
        .filter((sc) => sc.locationUID === dept.locationUID && sc.departmentUID === dept.departmentUID)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    );

    menuModel.gSalesItems = menuModel.salesCategories.map((cat) =>
      menuModel.salesItems
        .filter((si) => si.locationUID === cat.locationUID && si.salesCategoryID === cat.salesCategoryID)
        .sort((a, b) => a.displayOrderItem - b.displayOrderItem)
    );

    return menuModel;
  }

  // Template helper methods
  getDepartmentsForLocation(locationUID: number): LTC_Department[] {
    return this.menuModel?.departments
      .filter(d => d.locationUID === locationUID)
      .sort((a, b) => a.description.localeCompare(b.description)) ?? [];
  }

  getCategoriesForDepartment(locationUID: number, departmentUID: number): SalesCategory[] {
    if (!this.menuModel) return [];
    const seen = new Set<number>();
    return this.menuModel.salesCategories
      .filter(sc => sc.locationUID === locationUID && sc.departmentUID === departmentUID && !seen.has(sc.salesCategoryID) && seen.add(sc.salesCategoryID))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getItemsForCategory(locationUID: number, departmentUID: number, salesCategoryID: number): SalesItem[] {
    return (this.menuModel?.salesItems ?? [])
      .filter(si => si.locationUID === locationUID && si.salesCategoryID === salesCategoryID && si.price != null)
      .sort((a, b) => a.displayOrderItem - b.displayOrderItem);
  }

  hasSetupItems(locationUID: number, departmentUID: number, category: SalesCategory): boolean {
    return this.getItemsForCategory(locationUID, departmentUID, category.salesCategoryID).some(
      si => si.price !== '0.00' || (si.displayOrderItem === 0 && category.salesCatTypeUID === 3 && si.price === '0.00')
    );
  }

  private getCategoryKey(locationUID: number, departmentUID: number, salesCategoryID: number): string {
    return `${locationUID}_${departmentUID}_${salesCategoryID}`;
  }

  isCategoryCollapsed(locationUID: number, departmentUID: number, salesCategoryID: number): boolean {
    return this.collapsedCategoryKeys.has(this.getCategoryKey(locationUID, departmentUID, salesCategoryID));
  }

  toggleCategory(locationUID: number, departmentUID: number, salesCategoryID: number): void {
    const key = this.getCategoryKey(locationUID, departmentUID, salesCategoryID);
    if (this.collapsedCategoryKeys.has(key)) {
      this.collapsedCategoryKeys.delete(key);
      return;
    }
    this.collapsedCategoryKeys.add(key);
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
    this.router.navigate(['/rptmenu']);
  }

  onContractListingClick(): void {
    this.router.navigate(['/contracts']);
  }

  onSalesTransactionClick(): void {
    this.router.navigate(['/salestran']);
  }
}
