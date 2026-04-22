import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PosApiService } from '../../services/pos-api-service';
import { LogonDataService } from '../../../global/logon-data-service.service';
import { CashDrawerSummaryResultsModel, LTC_CashDrawerReportSummary, LTC_CashDrawerDetails } from '../../models/cash.drawer.model';

interface CashDrawerDateGroup {
  businessDate: Date;
  details: LTC_CashDrawerDetails[];
}

@Component({
  selector: 'app-cash-drawer-report-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cash-drawer-report-page.component.html',
  styleUrls: ['./cash-drawer-report-page.component.css']
})
export class CashDrawerReportPageComponent implements OnInit {
  loading = false;
  isNoData = false;
  cashDrawerDetails: LTC_CashDrawerDetails[] = [];
  groupedDetails: CashDrawerDateGroup[] = [];

  // Report parameters
  contractId: number = 0;
  locationId: number = 0;
  locationName: string = '';
  contractNumber: string = '';
  facilityNumber: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  source: string = '';

  // Date range
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private posApiService: PosApiService,
    private logonDataService: LogonDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeParameters();
  }

  private initializeParameters(): void {
    const locCnfg = this.logonDataService.getLocationConfig();
    const vendorData = this.logonDataService.getLTVendorLogonData();

    this.contractId = locCnfg?.contractUID || 0;
    this.locationId = locCnfg?.locationUID || 0;
    this.locationName = locCnfg?.locationName || '';
    this.facilityNumber = locCnfg?.facilityNumber || '';
    this.contractNumber = locCnfg?.contractNumber || '';
    this.vendorName = locCnfg?.vendorName || '';
    this.vendorNumber = locCnfg?.vendorNumber || '';
    this.source = locCnfg?.isVendorLogin ? 'V' : 'S'; // S for SBM, V for Vendor

    // Initialize date range: first day to last day of current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.fromDate = this.formatDate(firstDay);
    this.toDate = this.formatDate(lastDay);

    this.getCashDrawerReportData();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateString(dateStr: string): Date {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  onFromDateChange(): void {
    this.getCashDrawerReportData();
  }

  onToDateChange(): void {
    this.getCashDrawerReportData();
  }

  getCashDrawerReportData(): void {
    this.loading = true;
    this.isNoData = false;

    const locCnfg = this.logonDataService.getLocationConfig();
    const uid = locCnfg?.individualUID.toString() || '0';

    this.posApiService.getCashDrawerReport(
      this.contractId,
      this.locationId,
      "All",
      this.fromDate,
      this.toDate,
      uid
    ).subscribe({
      next: (result: CashDrawerSummaryResultsModel) => {
        if (result && result.summary && result.summary.cashDrawerDtls && result.summary.cashDrawerDtls.length > 0) {
          this.cashDrawerDetails = result.summary.cashDrawerDtls;
          this.groupByBusinessDate();
        } else {
          this.isNoData = true;
          this.groupedDetails = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cash drawer report', err);
        this.isNoData = true;
        this.loading = false;
      }
    });
  }

  private groupByBusinessDate(): void {
    const dateMap = new Map<string, LTC_CashDrawerDetails[]>();

    for (const detail of this.cashDrawerDetails) {
      const dateKey = this.formatDateDisplay(detail.businessDate);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(detail);
    }

    this.groupedDetails = Array.from(dateMap.entries())
      .map(([dateStr, details]) => ({
        businessDate: new Date(dateStr),
        details: details.sort((a, b) => {
          const timeA = new Date(a.transactionDate).getTime();
          const timeB = new Date(b.transactionDate).getTime();
          return timeB - timeA; // Descending order
        })
      }))
      .sort((a, b) => b.businessDate.getTime() - a.businessDate.getTime()); // Descending by date
  }

  formatDateDisplay(value: Date | string): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  formatCurrency(amount: number | null | undefined): string {
    if (amount == null) return '$0.00';
    return '$' + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDateTime(value: Date | string): string {
    if (!value) return '';
    const date = typeof value === 'string' ? new Date(value) : value;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  get hasDetails(): boolean {
    return this.groupedDetails.length > 0;
  }

  isFirstRowOfDate(dateGroup: CashDrawerDateGroup, index: number): boolean {
    return index === 0;
  }

  onRefreshClick(): void {
    this.getCashDrawerReportData();
  }

  onEmailClick(): void {
    // Show toast notification - placeholder for email functionality
    console.log('Email functionality - to be implemented');
  }

  onPrintClick(): void {
    // Print functionality - placeholder
    console.log('Print functionality - to be implemented');
    window.print();
  }

  onReportsClick(): void {
    // Navigate to reports menu
    console.log('Navigating to reports menu');
  }

  onContractListingClick(): void {
    // Navigate to contract listing
    this.router.navigate(['/contracts']);
  }

  onSalesTransactionClick(): void {
    // Navigate to sales transaction
    this.router.navigate(['/sales-transaction']);
  }

  showVariance(tranDate: string, associate: string): void {
    console.log('Show variance for:', tranDate, associate);
    // Placeholder for variance details modal/popup
  }

  getAdjustedAmount(detail: LTC_CashDrawerDetails): number {
    if (!detail) return 0;
    const tenderAmount = detail.tenderAmount ?? 0;
    const tipAmount = detail.tipAmount ?? 0;
    return detail.openCashDrwForTips ? (tenderAmount - tipAmount) : tenderAmount;
  }

  getVarianceAmount(detail: LTC_CashDrawerDetails): number {
    if (!detail) return 0;
    const depositAmount = detail.depositCashCheck ?? 0;
    const adjustedAmount = this.getAdjustedAmount(detail);
    return depositAmount - adjustedAmount;
  }
}
