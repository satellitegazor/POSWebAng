import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LTC_ItemButtonMenuResults, LTC_ItemButtonMenuResultsModel } from '../../../../longterm/models/item.button.menu.models'
import { currSymbls } from '../../../../models/CurrencySymbols';
import { PosApiService } from '../../../../longterm/services/pos-api-service';
import { LTC_Contract } from '../../../../longterm/models/contract.models';
import { LTC_Associates, LTC_LocationAssociatesResultsModel } from '../../../../longterm/models/location.associates';
import { SbmWebApiService } from '../../../../sbm/services/sbm-web-api.service';
import { LTC_StoreLocation } from '../../../../longterm/models/store.location';
import { LTC_ContractResultsModel } from '../../../../longterm/models/contract.models';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
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
  sbm_user_name: string = '';

  contractId: number = 0;
  locationId: number = 0;
  managerAssociateEmail: string = '';

  ltcContract: LTC_Contract | null = null;
  SaleAssocList: LTC_Associates[] = [];

  selectedEmailOption: 'owner' | 'manager' | 'custom' = 'owner';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;
  showEmailPopup: boolean = false;
  selfAssociateEmail: string = '';
 
  constructor(
    private posApiService: PosApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sbmApiService: SbmWebApiService,
    private toastSvc: ToastService
  ) {}

  ngOnInit(): void {
    
    this.locationName = '';
    this.facilityNumber = '';
    this.contractNumber = '';
    this.vendorName = '';
    this.vendorNumber = '';
    this.source = 'V';
    
        this.activatedRoute.queryParams.subscribe(params => {
          this.contractId = Number(params['cid'] || 0);
          this.locationId = Number(params['lid'] || 0);
        });
        this.sbm_user_name = sessionStorage.getItem('sbm_name') || '';
    
        this.sbmApiService.loadLTCContract(this.contractId, this.sbm_user_name).subscribe({
          next: (result: LTC_ContractResultsModel) => {
            this.ltcContract = result.contract;
          if(this.locationId === 0) {
            this.locationId = this.ltcContract?.locations?.[0]?.locationUID || 0;
            this.locationName = this.ltcContract?.locations?.[0]?.locationName || '';
          }
          else {
            this.ltcContract.locations.forEach((loc: LTC_StoreLocation) => {
              if(loc.locationUID === this.locationId) {
                this.locationName = loc.locationName || '';
              }
            });
          }
            this.contractNumber = this.ltcContract?.contractNumber || '';
            this.facilityNumber = this.ltcContract?.locations[0]?.facilities[0]?.facilityNumber || '';
            this.vendorName = this.ltcContract?.vendorName || '';
            this.vendorNumber = this.ltcContract?.vendorNumber || '';
    
            this.posApiService.getLocationAssociates(this.locationId, String(this.sbm_user_name))
              .subscribe((data: LTC_LocationAssociatesResultsModel) => {
                this.SaleAssocList = data.associates.filter(a => a.code === 'RLTYP_CONC_ASSC')
                this.managerAssociateEmail = data.associates.find(a => a.code === 'RLTYP_CONC_MNGR')?.emailAddress || '';
            });
            
            this.loadConcessionMenuItems();
          }
        });
    
  }

  onRefreshClick(): void {
    this.loadConcessionMenuItems();
  }

  loadConcessionMenuItems(): void {
    

    const locationUID = this.locationId || 0;
    const contractUID = this.contractId || 0;
    const facilityUID = this.ltcContract?.locations[0]?.facilities[0]?.facilityUID || 0;
    const businessFunctionUID = 0;
    

    this.loading = true;
    this.posApiService.getConcessionMenuItem(
      locationUID,
      contractUID,
      facilityUID,
      businessFunctionUID,
      0,  // pSalesCatUID - default 0 for all categories
      0,  // pDepartmentUID - default 0 for all departments
      this.sbm_user_name
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


  buildPriceListHtml(): string {
    const escapeHtml = (value: unknown): string => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const formatYesNo = (value: boolean | null | undefined): string => value ? 'Yes' : 'No';
    const formatTaxTiming = (value: boolean | null | undefined): string => value ? 'After Tax' : 'Before Tax';

    const noDataHtml = `
      <div class="empty-state">
        *** Vendor Does Not Have Sales Item Information For This Facility ***
      </div>
    `;

    const locationsHtml = (this.menuModel?.locations ?? []).map((loc) => {
      const departmentsHtml = this.getDepartmentsForLocation(loc.locationUID).map((dept) => {
        const categoriesHtml = this.getCategoriesForDepartment(dept.locationUID, dept.departmentUID).map((sc) => {
          if (!this.hasSetupItems(dept.locationUID, dept.departmentUID, sc)) {
            return `
              <div class="category-card not-setup">
                <div class="category-not-setup-row">
                  <span>${escapeHtml(sc.salesCategoryDescription)}</span>
                  <span class="warning">Menu is currently not setup</span>
                </div>
              </div>
            `;
          }

          const rowsHtml = this.getItemsForCategory(dept.locationUID, dept.departmentUID, sc.salesCategoryID)
            .filter((si, j) => j < 30 && (si.price !== '0.00' || si.displayOrderItem === 0))
            .map((si) => `
              <tr>
                <td>${escapeHtml(si.salesItemDescription)}</td>
                <td class="text-end">${escapeHtml(si.currencyCode)} ${escapeHtml(si.price)}</td>
                <td class="text-end">${escapeHtml((+si.salesTax).toFixed(3))}%</td>
                ${sc.allowEnvTax ? `<td class="text-end">${escapeHtml(si.envTax.toFixed(3))}%</td>` : ''}
              </tr>
            `)
            .join('');

          return `
            <div class="category-card">
              <div class="category-title">${escapeHtml(sc.salesCategoryDescription)}</div>
              <table class="report-table">
                <thead>
                  <tr>
                    <th class="text-start">${escapeHtml(sc.salesCategoryDescription)}</th>
                    <th class="text-end">Price</th>
                    <th class="text-end">Sales Tax</th>
                    ${sc.allowEnvTax ? '<th class="text-end">Environmental Tax</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml || '<tr><td colspan="4" class="empty-row">No items configured.</td></tr>'}
                </tbody>
              </table>
            </div>
          `;
        }).join('');

        return `
          <section class="department-section">
            <div class="department-title">${escapeHtml(dept.description)}</div>
            ${categoriesHtml}
          </section>
        `;
      }).join('');

      return `
        <section class="location-section">
          <div class="location-header">
            <h2>LOCATION - ${escapeHtml(loc.locationName)}</h2>
            <div class="location-meta">
              <span><strong>Allow Tax Exemption:</strong> ${escapeHtml(formatYesNo(loc.allowTaxExemption))}</span>
              <span><strong>Apply Concession Discount:</strong> ${escapeHtml(formatTaxTiming(loc.vendCouponsAfterTax))}</span>
              <span><strong>Apply Exchange Coupons:</strong> ${escapeHtml(formatTaxTiming(loc.exchCouponsAfterTax))}</span>
              ${loc.businessModel === '5' ? `<span><strong>Open Cash Drawer for Tips:</strong> ${escapeHtml(formatYesNo(loc.openCashDrwForTips))}</span>` : ''}
            </div>
          </div>
          ${departmentsHtml}
        </section>
      `;
    }).join('');

    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Price List</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #1f2937;
              margin: 24px;
              font-size: 12px;
            }
            .header h1 {
              margin: 0 0 8px;
              font-size: 24px;
              color: #0f172a;
            }
            .meta {
              margin-bottom: 16px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              overflow: hidden;
            }
            .meta table {
              width: 100%;
              border-collapse: collapse;
            }
            .meta td {
              border: 1px solid #e5e7eb;
              padding: 8px;
              vertical-align: top;
            }
            .meta .label {
              font-weight: 700;
              color: #374151;
              display: block;
              margin-bottom: 2px;
            }
            .location-section {
              margin-bottom: 20px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              overflow: hidden;
            }
            .location-header {
              background: #eff6ff;
              border-bottom: 1px solid #dbeafe;
              padding: 10px;
            }
            .location-header h2 {
              margin: 0 0 6px;
              font-size: 16px;
              color: #0c4a6e;
            }
            .location-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 10px 16px;
            }
            .department-section {
              padding: 10px;
            }
            .department-title {
              font-size: 14px;
              font-weight: 700;
              text-align: center;
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              padding: 8px;
              margin-bottom: 8px;
            }
            .category-card {
              border: 1px solid #e5e7eb;
              border-radius: 4px;
              overflow: hidden;
              margin-bottom: 10px;
            }
            .category-title {
              background: #e0f2fe;
              padding: 8px;
              font-weight: 700;
              text-align: center;
              border-bottom: 1px solid #bae6fd;
            }
            .category-not-setup-row {
              padding: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
              background: #fff7ed;
            }
            .warning {
              color: #b91c1c;
              font-weight: 700;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
            }
            .report-table th,
            .report-table td {
              border: 1px solid #d1d5db;
              padding: 6px;
            }
            .report-table th {
              background: #f3f4f6;
              font-weight: 700;
            }
            .text-start {
              text-align: left;
            }
            .text-end {
              text-align: right;
            }
            .empty-row {
              text-align: center;
              color: #6b7280;
              padding: 10px;
            }
            .empty-state {
              border: 1px solid #fecaca;
              background: #fef2f2;
              color: #b91c1c;
              font-weight: 700;
              padding: 12px;
              border-radius: 6px;
              text-align: center;
            }
            .generated-at {
              margin-top: 10px;
              color: #6b7280;
              font-size: 11px;
            }
            @media print {
              body {
                margin: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Price List</h1>
          </div>

          <div class="meta">
            <table>
              <tr>
                <td><span class="label">Location Name</span>${escapeHtml(this.locationName || 'N/A')}</td>
                <td><span class="label">Vendor Number</span>${escapeHtml(this.vendorName + (this.vendorNumber ? ` (${this.vendorNumber})` : '')) || 'N/A'}</td>
                <td><span class="label">Contract Number</span>${escapeHtml(this.contractNumber || 'N/A')}</td>
              </tr>
              <tr>
                <td><span class="label">Facility Number</span>${escapeHtml(this.facilityNumber || 'N/A')}</td>
                <td><span class="label">Source</span>${escapeHtml(this.source === 'S' ? 'SBM' : 'Vendor')}</td>
                <td><span class="label">Generated By</span>${escapeHtml(this.sbm_user_name || 'N/A')}</td>
              </tr>
            </table>
          </div>

          ${this.hasData ? locationsHtml : noDataHtml}

          <div class="generated-at">Generated: ${escapeHtml(new Date().toLocaleString())}</div>
        </body>
      </html>
    `;
  }

  private getSelectedRecipientEmail(): string {
    if (this.selectedEmailOption === 'owner') {
      return this.selfAssociateEmail;
    }

    if (this.selectedEmailOption === 'manager') {
      return this.managerAssociateEmail;
    }

    return (this.customEmailAddress || '').trim();
  }
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onLocationChange() {
    this.loadConcessionMenuItems();
  }

  onEmailClick($event: Event): void {
    $event.preventDefault();
    this.selectedEmailOption = this.selfAssociateEmail ? 'owner' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;  
  }

  btnPrintClick($event: Event): void {
    $event.preventDefault();
    const EmailContent = this.buildPriceListHtml();
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.write(EmailContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  goToReportsMenu($event: Event): void {
    $event.preventDefault();
    console.log('Navigate to reports');
    this.router.navigate(['/sbm/sbmltcrptmenu'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToContractDetails($event: Event): void {
    $event.preventDefault();
    this.router.navigate(['/sbm/ltcpage'], { queryParams: { cid: this.contractId } });
  }


}
