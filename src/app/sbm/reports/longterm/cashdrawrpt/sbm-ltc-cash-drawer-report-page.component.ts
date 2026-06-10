import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PosApiService, SendEmailRequest } from '../../../../longterm/services/pos-api-service';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { CashDrawerSummaryResultsModel, LTC_CashDrawerReportSummary, LTC_CashDrawerDetails } from '../../../../longterm/models/cash.drawer.model';
import { LTC_Contract } from 'src/app/longterm/models/contract.models';
import { SbmWebApiService } from 'src/app/sbm/services/sbm-web-api.service';
import { LTC_Associates, LTC_LocationAssociatesResultsModel } from 'src/app/longterm/models/location.associates';
import { ToastService } from 'src/app/services/toast.service';
import { LTC_StoreLocation } from '../../../../longterm/models/store.location';
import { LTC_ContractResultsModel } from '../../../../longterm/models/contract.models';

interface CashDrawerDateGroup {
  businessDate: Date;
  details: LTC_CashDrawerDetails[];
}

@Component({
  selector: 'app-sbm-ltc-cash-drawer-report-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sbm-ltc-cash-drawer-report-page.component.html',
  styleUrls: ['./sbm-ltc-cash-drawer-report-page.component.css']
})
export class SbmLtcCashDrawerReportPageComponent implements OnInit {

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
  sbm_user_name: string = '';

  ltcContract: LTC_Contract | null = null;
  SaleAssocList: LTC_Associates[] = [];

  // Date range
  fromDate: string = '';
  toDate: string = '';

  constructor(
    private posApiService: PosApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sbmApiService: SbmWebApiService,
    private toastSvc: ToastService
  ) { }

  ngOnInit(): void {
    this.initializeParameters();

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

        this.posApiService.getLocationAssociates(this.locationId, String(this.sbm_user_name)).subscribe((data: LTC_LocationAssociatesResultsModel) => {
          this.SaleAssocList = data.associates;
        });
      }
    });
  }

  private initializeParameters(): void {


    this.locationId = 0;
    this.locationName = '';
    this.facilityNumber = '';
    this.contractNumber = '';
    this.vendorName = '';
    this.vendorNumber = '';
    
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

    
    const sbm_user_name = sessionStorage.getItem('sbm_name') || '';

    this.posApiService.getCashDrawerReport(
      this.contractId,
      this.locationId,
      "All",
      this.fromDate,
      this.toDate,
      sbm_user_name
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
    if(amount < 0) {
      return '$(' + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ')';
    }
    else {
      return '$' + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
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

  onEmailClick($event: Event): void {
    $event.preventDefault();
    this.selectedEmailOption = this.ownerAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;    
  }

  btnPrintClick($event: Event) {
    $event.preventDefault();
    const EmailContent = this.buildCashDrawerReportHtml();
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.write(EmailContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  onReportsClick(): void {
    // Navigate to reports menu
    console.log('Navigating to reports menu');
    this.router.navigate(['/rptmenu']);
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

  
  selectedEmailOption: 'self' | 'manager' | 'custom' = 'self';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;
  showEmailPopup: boolean = false;

  get ownerAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => ((assoc.code || '').toUpperCase() === 'RLTYP_CONC_OWNR'))?.emailAddress?.trim() || '';
  }

  get managerAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => (assoc.code || '').toUpperCase() === 'RLTYP_CONC_MNGR')?.emailAddress?.trim() || '';
  }

  onEmail($event: Event) {
    $event.preventDefault();
    this.selectedEmailOption = this.ownerAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;
  }
  onLocationChange() {
    this.getCashDrawerReportData();
  }
  goToReportsMenu(): void {
    this.router.navigate(['/sbm/sbmltcrptmenu'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToContractDetails($event: Event) {
    $event.preventDefault();
    this.router.navigate(['/sbm/ltcpage'], { queryParams: { cid: this.contractId } });
  }


  closeEmailPopup(): void {
    this.showEmailPopup = false;
    this.isSendingEmail = false;
  }

  submitEmailPopup(): void {
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';

    const recipientEmail = this.getSelectedRecipientEmail();
    if (!recipientEmail) {
      this.emailSubmitError = 'Please select a valid email option.';
      return;
    }

    if (!this.isValidEmail(recipientEmail)) {
      this.emailSubmitError = 'Please enter a valid email address.';
      return;
    }

    const request: SendEmailRequest = {
      EmailAddress: recipientEmail,
      Subject: this.buildEmailSubject(),
      EmailContent: this.buildCashDrawerReportHtml()
    };

    this.isSendingEmail = true;
    this.posApiService.sendEmail(this.sbm_user_name, request).subscribe({
      next: result => {
        this.isSendingEmail = false;
        if (result?.success) {
          this.emailSubmitSuccess = 'Email sent successfully.';
          this.showEmailPopup = false;
          this.toastSvc.success('Email sent successfully.');
          return;
        }

        this.emailSubmitError = result?.returnMsg || 'Unable to send email.';
      },
      error: () => {
        this.isSendingEmail = false;
        this.emailSubmitError = 'Unable to send email.';
      }
    });
  }

  private getSelectedRecipientEmail(): string {
    if (this.selectedEmailOption === 'self') {
      return this.ownerAssociateEmail;
    }

    if (this.selectedEmailOption === 'manager') {
      return this.managerAssociateEmail;
    }

    return (this.customEmailAddress || '').trim();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private buildEmailSubject(): string {
    return `Cash Drawer Report - ${this.locationName} (${this.fromDate} to ${this.toDate})`;
  }



  
  buildCashDrawerReportHtml(): string {
    const escapeHtml = (value: unknown): string => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const formatReportDate = (value: Date): string => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    const formatCurrency = (amount: number): string => {
      const numericAmount = Number(amount);
      const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;
      let retVal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(safeAmount);
      return safeAmount < 0 ? `(${retVal.replace('-', '')})` : retVal;
    };

    const selectedLocation = this.locationId === 0
      ? 'All'
      : this.ltcContract?.locations?.find(loc => Number(loc.locationUID) === Number(this.locationId))?.locationName || this.locationName || 'N/A';

    const rowsHtml = this.cashDrawerDetails.length
      ? this.cashDrawerDetails.map(detail => `
          <tr>
          <td class="text-center">${escapeHtml(formatReportDate(detail.transactionDate))}</td>
            <td class="text-center">${escapeHtml(detail.associate)}</td>
            <td class="text-center">${escapeHtml(detail.openCashDrwForTips ? 'Yes' : 'No')}</td>
            <td class="text-end" [style.color]="(detail.tenderAmount || 0) < 0 ? 'red' : 'black'">
              ${escapeHtml(formatCurrency(detail.tenderAmount))}
            </td>
            <td class="text-end" [style.color]="(detail.tipAmount || 0) < 0 ? 'red' : 'black'">
              ${escapeHtml(formatCurrency(detail.tipAmount))}
            </td>
            <td class="text-end" [style.color]="getAdjustedAmount(detail) < 0 ? 'red' : 'black'">
              ${escapeHtml(formatCurrency(this.getAdjustedAmount(detail)))}
            </td>
            <td class="text-end" [style.color]="(detail.depositCashCheck || 0) < 0 ? 'red' : 'black'">
              ${escapeHtml(formatCurrency(detail.depositCashCheck))}
            </td>
            <td class="text-end" [style.color]="getVarianceAmount(detail) < 0 ? 'red' : 'black'">
                ${escapeHtml(formatCurrency(this.getVarianceAmount(detail)))}
            </td>
          </tr>
        `).join('')
      : `
          <tr>
            <td colspan="9" class="text-center empty-row">Vendor does not have information for this time period and/or for this contract.</td>
          </tr>
        `;

    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Cash Drawer Report</title>
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
            .table-title {
              margin: 12px 0 8px;
              font-size: 16px;
              font-weight: 700;
              color: #111827;
            }
            table.report {
              width: 100%;
              border-collapse: collapse;
            }
            table.report th,
            table.report td {
              border: 1px solid #d1d5db;
              padding: 8px 6px;
            }
            table.report th {
              background: #f3f4f6;
              text-align: left;
              font-weight: 700;
              white-space: nowrap;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .empty-row {
              padding: 16px;
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
            <h1>Cash Drawer Report</h1>
          </div>

          <div class="meta">
            <table>
              <tr>
                <td><span class="label">Location</span>${escapeHtml(selectedLocation)}</td>
                <td><span class="label">Contract Number</span>${escapeHtml(this.contractNumber || 'N/A')}</td>
                <td><span class="label">Vendor</span>${escapeHtml(this.vendorName + (this.vendorNumber ? ` (${this.vendorNumber})` : '')) || 'N/A'}</td>
              </tr>
              <tr>
                <td><span class="label">From Date</span>${escapeHtml(this.fromDate)}</td>
                <td><span class="label">To Date</span>${escapeHtml(this.toDate)}</td>
                <td><span class="label">Facility Number</span>${escapeHtml(this.facilityNumber || 'N/A')}</td>
              </tr>
            </table>
          </div>

          <div class="table-title">Cash Drawer Report</div>
          <table class="report">
            <thead>
              <tr>
          <th class="text-start" style="width: 12%;">Business Date</th>
          <th class="text-center" style="width: 12%;">EOD Time</th>
          <th class="text-center" style="width: 12%;">Associate</th>
          <th class="text-center" style="width: 8%;">Open Cash Drawer</th>
          <th class="text-end" style="width: 11%;">System Total</th>
          <th class="text-end" style="width: 11%;">Tip Amount</th>
          <th class="text-end" style="width: 11%;">Adjusted</th>
          <th class="text-end" style="width: 11%;">Actual Total</th>
          <th class="text-end" style="width: 12%;">Variance</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="generated-at">Generated: ${escapeHtml(new Date().toLocaleString())}</div>
        </body>
      </html>
    `;
  }


}
