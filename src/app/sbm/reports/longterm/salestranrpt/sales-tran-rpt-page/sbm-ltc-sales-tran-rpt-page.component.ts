import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../../../services/toast.service';
import { PosApiService } from '../../../../../longterm/services/pos-api-service';
import { ContractSummaryGrouped, ContractTransactionDetail, SalesTranRptSummaryByFacility, VendorContractSummaryResultsModel } from '../../../../../models/saletran.report.model';
import { LTC_Associates } from '../../../../../longterm/models/location.associates';
import { SbmWebApiService } from '../../../../services/sbm-web-api.service';
import { LTC_Contract } from '../../../../../longterm/models/contract.models';
import { TenderType } from '../../../../../longterm/models/tender.type';
import { SbmSalesTranRptDetailComponent } from '../detail/sbm-sales-tran-rpt-detail.component';
import { LTC_ContractResultsModel } from '../../../../../longterm/models/contract.models';
import { LTC_StoreLocation } from '../../../../../longterm/models/store.location';
import { SendEmailRequest } from '../../../../../models/misc-models';

@Component({
  selector: 'app-sbm-ltc-sales-tran-rpt-page',
  standalone: true,
  imports: [SbmSalesTranRptDetailComponent, CommonModule, FormsModule],
  templateUrl: './sbm-ltc-sales-tran-rpt-page.component.html',
  styleUrls: ['./sbm-ltc-sales-tran-rpt-page.component.css']
})
export class SbmLtcSalesTranRptPageComponent {
  locationId: number = 0;
  contractId: number = 0;
  facilityNumber: string = '';
  fromDate: string = '';
  toDate: string = '';
  sbm_user_name: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  locationName: string = '';
  contractNumber: string = '';
  associateName: string = '';
  indivId: number = 0;
  public SaleAssocList: LTC_Associates[] = [];
  showEmailPopup: boolean = false;
  selectedEmailOption: 'self' | 'manager' | 'custom' = 'self';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;
  isLoadingReport: boolean = false;

  rptSummary: ContractSummaryGrouped[] = [];
  rptDetail: ContractTransactionDetail[] = [];
  summaryTotals = {
    nbrTrans: 0,
    nbrTender: 0,
    sales: 0,
    salesTax: 0,
    vendorCoupons: 0,
    exchangeCoupons: 0,
    lineItmKatsaCpnAmt: 0,
    tipAmount: 0,
    pct: 0
  };

  summaryBy: 'F' | 'L' | 'A' = 'L';
  transType: 'A' | 'S' | 'R' = 'A';
  categorizedByCode: 'F' | 'L' | 'A' = 'L';
  rptSummaryByFacility: SalesTranRptSummaryByFacility[] = [];

  readonly transTypeLabels: Record<'A' | 'S' | 'R', string> = {
    A: 'All Transactions',
    S: 'Sale Only',
    R: 'Refund Only'
  };

  CategorizedBy: string = '';
  tenderTypes: TenderType[] = [];

  saleTranReportData: VendorContractSummaryResultsModel = {} as VendorContractSummaryResultsModel;
  ltcContract: LTC_Contract = {} as LTC_Contract;

  get transTypeLabel(): string {
    return this.transTypeLabels[this.transType];
  }

  constructor(
    private posApiSvc: PosApiService,
    private sbmApiSvc: SbmWebApiService,
    private router: Router,
    private toastSvc: ToastService,
    private activRoute: ActivatedRoute
  ) {
    this.initializeDateRange();
  }

  ngOnInit(): void {
    this.updateCategorizedBy('L');

    this.activRoute.queryParams.subscribe(params => {
      this.contractId = +params['cid'] || 0;
      this.locationId = +params['lid'] || 0;
      this.sbm_user_name = sessionStorage.getItem('sbm_name') || '';

      this.sbmApiSvc.loadLTCContract(this.contractId, this.sbm_user_name).subscribe({
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
          this.locationName = this.ltcContract?.locations?.[0]?.locationName || '';
          this.contractNumber = this.ltcContract?.contractNumber || '';
          this.facilityNumber = this.ltcContract?.locations?.[0]?.facilities?.[0]?.facilityNumber || '';
          this.vendorName = this.ltcContract?.vendorName || '';
          this.vendorNumber = this.ltcContract?.vendorNumber || '';

          this.updateCategorizedBy('L');
          this.loadSaleTranReport();
        }
      });
    });
  }

  onLocationChange(): void {
    this.loadSaleTranReport();
  }

  private loadSaleTranReport(): void {
    this.isLoadingReport = true;

    this.posApiSvc.getSaleTranReport(
      this.contractId,
      this.locationId,
      this.indivId,
      this.facilityNumber,
      this.fromDate,
      this.toDate,
      this.sbm_user_name,
      0
    ).subscribe({
      next: reportObj => {
        this.isLoadingReport = false;
        this.saleTranReportData = reportObj;
        this.onTransTypeChange('A');

        this.posApiSvc.getLocationAssociates(this.locationId, String(this.indivId)).subscribe(data => {
          this.SaleAssocList = data.associates;
        });

        this.RenderSummaryReport();
      },
      error: () => {
        this.isLoadingReport = false;
        this.toastSvc.error('Unable to load sales transaction report. Please try again.');
      }
    });
  }

  private RenderSummaryReport(): void {
    if (this.summaryBy === 'F') {
      this.groupByFacility();
    }

    const totalSales = this.rptSummary.reduce((acc, curr) => acc + curr.sales, 0);
    this.rptSummary.forEach(summary => {
      summary.pct = totalSales > 0 ? (summary.sales / totalSales) * 100 : 0;
    });

    this.summaryTotals = this.rptSummary.reduce((totals, summary) => {
      totals.nbrTrans += summary.nbrTrans || 0;
      totals.nbrTender += summary.nbrTender || 0;
      totals.sales += summary.sales || 0;
      totals.salesTax += summary.salesTax || 0;
      totals.vendorCoupons += summary.vendorCoupons || 0;
      totals.exchangeCoupons += summary.exchangeCoupons || 0;
      totals.lineItmKatsaCpnAmt += summary.lineItmKatsaCpnAmt || 0;
      totals.tipAmount += summary.tipAmount || 0;
      totals.pct += summary.pct || 0;
      return totals;
    }, {
      nbrTrans: 0,
      nbrTender: 0,
      sales: 0,
      salesTax: 0,
      vendorCoupons: 0,
      exchangeCoupons: 0,
      lineItmKatsaCpnAmt: 0,
      tipAmount: 0,
      pct: 0
    });
  }

  onSummaryByChange(value: 'F' | 'L' | 'A'): void {
    if (this.summaryBy === value) {
      return;
    }

    this.summaryBy = value;
    this.updateCategorizedBy(value);
    this.RenderSummaryReport();
  }

  private initializeDateRange(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    this.fromDate = this.formatDate(new Date(year, month, 1));
    this.toDate = this.formatDate(new Date(year, month + 1, 0));
  }

  openNativeDatePicker(input: HTMLInputElement): void {
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (pickerInput.showPicker) {
      pickerInput.showPicker();
      return;
    }

    input.focus();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateCategorizedBy(value: 'F' | 'L' | 'A'): void {
    this.categorizedByCode = value;

    switch (value) {
      case 'F':
        this.CategorizedBy = this.facilityNumber;
        break;
      case 'L':
        this.CategorizedBy = `${this.locationName}-${this.facilityNumber}`;
        break;
      case 'A':
        this.CategorizedBy = this.associateName;
        break;
    }
  }

  onTransTypeChange(value: 'A' | 'S' | 'R'): void {
    this.transType = value;

    if (!this.saleTranReportData?.summary) {
      return;
    }

    if (this.transType === 'A') {
      this.rptSummary = this.saleTranReportData.summary.heading;
      this.rptDetail = this.saleTranReportData.summary.details.sort((a, b) => b.ticketNumber - a.ticketNumber);
    } else {
      const isRefund = this.transType === 'R';

      this.posApiSvc.getTenderTypes(1, 100).subscribe(result => {
        this.tenderTypes = result.types.filter(t => t.isRefundType === isRefund);
      });

      this.rptSummary = this.saleTranReportData.summary.heading.filter(summary =>
        this.tenderTypes.some(t => t.tenderTypeCode === summary.tenderTypeCode)
      );
      this.rptDetail = this.saleTranReportData.summary.details
        .filter(detail => this.tenderTypes.some(t => t.tenderTypeCode === detail.tenderTypeCode))
        .sort((a, b) => b.ticketNumber - a.ticketNumber);
    }

    this.RenderSummaryReport();
  }

  private groupByFacility(): void {
    const grouped = new Map<string, { nbrTrans: number; nbrTenders: number; totalSales: number }>();

    this.rptSummary.forEach(summary => {
      const key = summary.facilityNumber;
      if (!grouped.has(key)) {
        grouped.set(key, { nbrTrans: 0, nbrTenders: 0, totalSales: 0 });
      }

      const group = grouped.get(key)!;
      group.nbrTrans += summary.nbrTrans;
      group.nbrTenders += summary.nbrTender;
      group.totalSales += summary.sales;
    });

    const totalSales = Array.from(grouped.values()).reduce((acc, curr) => acc + curr.totalSales, 0);

    this.rptSummaryByFacility = Array.from(grouped.entries()).map(([facilityNumber, data]) => {
      const item = new SalesTranRptSummaryByFacility();
      item.facilityNumber = facilityNumber;
      item.nbrTrans = data.nbrTrans;
      item.nbrTenders = data.nbrTenders;
      item.totalSales = data.totalSales;
      item.pct = totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0;
      return item;
    });
  }

  btnSalesTran($event: Event): void {
    $event.preventDefault();
    this.router.navigate(['/salestran']);
  }

  btnReportsMenu($event: Event): void {
    $event.preventDefault();
    this.router.navigate(['/sbm/sbmltcrptmenu'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  btnEmailClick($event: Event): void {
    $event.preventDefault();
    this.selectedEmailOption = this.ownerAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;
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
      EmailContent: this.buildSalesTranReportHtml()
    };

    this.isSendingEmail = true;
    this.posApiSvc.sendEmail(this.sbm_user_name || this.indivId.toString(), request).subscribe({
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

    get ownerAssociateEmail(): string {
        return this.SaleAssocList.find(assoc => ((assoc.code || '').toUpperCase() === 'RLTYP_CONC_OWNR'))?.emailAddress?.trim() || '';
    }


  get managerAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => (assoc.code || '').toUpperCase() === 'RLTYP_CONC_MNGR')?.emailAddress?.trim() || '';
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
    return `Sales Transaction Report - ${this.locationName} (${this.fromDate} to ${this.toDate})`;
  }

  private buildSalesTranReportHtml(): string {
    const safe = (value: unknown) => this.escapeHtml(String(value ?? ''));
    const asCurrency = (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value) || 0);
    const asPct = (value: number) => `${(Number(value) || 0).toFixed(2)}%`;
    const formatDateValue = (value: Date | string) => this.formatDateForEmail(value);

    const vendorDisplay = `${this.vendorName || 'N/A'}${this.vendorNumber ? ` (${this.vendorNumber})` : ''}`;
    const locationDisplay = `${this.locationName || 'N/A'}${this.facilityNumber ? ` (${this.facilityNumber})` : ''}`;

    const summaryRows = this.rptSummary.length
      ? this.rptSummary.map(summary => `
          <tr>
            <td>${safe(summary.tenderTypeDescription || 'N/A')}</td>
            <td class="text-center">${summary.nbrTrans || 0}</td>
            <td class="text-center">${summary.nbrTender || 0}</td>
            <td class="text-end">${safe(asCurrency(summary.sales))}</td>
            <td class="text-end">${safe(asCurrency(summary.salesTax))}</td>
            <td class="text-end">${safe(asCurrency(summary.vendorCoupons))}</td>
            <td class="text-end">${safe(asCurrency(summary.exchangeCoupons))}</td>
            <td class="text-end">${safe(asCurrency(summary.lineItmKatsaCpnAmt))}</td>
            <td class="text-end">${safe(asCurrency(summary.tipAmount))}</td>
            <td class="text-end">${safe(asCurrency(summary.sales))}</td>
            <td class="text-end">${safe(asPct(summary.pct))}</td>
          </tr>`).join('')
      : `
          <tr>
            <td colspan="11" class="empty-row">No summary records found for the selected criteria.</td>
          </tr>`;

    const detailRows = this.rptDetail.length
      ? this.rptDetail.map(detail => `
          <tr>
            <td class="text-center">${safe(detail.ticketNumber || 0)}</td>
            <td class="text-center">${safe(formatDateValue(detail.transactionDate))}</td>
            <td class="text-center">${safe(detail.facilityNumber || '')}</td>
            <td class="text-end">${safe(asCurrency(detail.sales))}</td>
            <td class="text-end">${safe(asCurrency(detail.salesTax))}</td>
            <td class="text-end">${safe(asCurrency(detail.envTax))}</td>
            <td class="text-end">${safe(asCurrency(detail.vendorCoupons))}</td>
            <td class="text-end">${safe(asCurrency(detail.exchangeCoupons))}</td>
            <td class="text-end">${safe(asCurrency((detail.sales || 0) - (detail.salesTax || 0) - (detail.envTax || 0) - (detail.vendorCoupons || 0) - (detail.exchangeCoupons || 0)))}</td>
            <td class="text-center">${safe(detail.tenderTypeDescription || '')}</td>
          </tr>`).join('')
      : `
          <tr>
            <td colspan="10" class="empty-row">No detail records found for the selected criteria.</td>
          </tr>`;

    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Sales Transaction Report</title>
          <style>
            @page {
              size: landscape;
              margin: 16mm;
            }

            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              background: #f8fafc;
              color: #1f2937;
              font-size: 12px;
            }

            .report-shell {
              max-width: 1600px;
              margin: 0 auto;
              padding: 24px;
            }

            .report-header {
              padding: 14px 18px;
              border-radius: 10px;
              background: linear-gradient(135deg, #0f172a, #1d4ed8);
              color: #fff;
              box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
              margin-bottom: 16px;
            }

            .report-header h1 {
              margin: 0 0 4px 0;
              font-size: 24px;
              font-weight: 700;
            }

            .report-header .subtitle {
              margin: 0;
              font-size: 13px;
              opacity: 0.9;
            }

            .report-card {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 10px;
              box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
              overflow: hidden;
              margin-bottom: 16px;
            }

            .report-card-title {
              background: #e0f2fe;
              color: #0f172a;
              font-weight: 700;
              padding: 10px 14px;
              border-bottom: 1px solid #bae6fd;
              letter-spacing: 0.02em;
            }

            .report-card-body {
              padding: 14px;
            }

            .params-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 12px;
            }

            .param-item {
              background: #f8fafc;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 10px 12px;
            }

            .param-label {
              display: block;
              margin-bottom: 4px;
              font-size: 11px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }

            .param-value {
              font-size: 13px;
              color: #111827;
              font-weight: 600;
              word-break: break-word;
            }

            .table-wrap {
              overflow-x: auto;
            }

            table.report-table {
              width: 100%;
              border-collapse: collapse;
            }

            table.report-table th,
            table.report-table td {
              border: 1px solid #d1d5db;
              padding: 8px 10px;
              vertical-align: middle;
            }

            table.report-table th {
              background: #dbeafe;
              color: #0f172a;
              font-weight: 700;
              white-space: nowrap;
            }

            table.report-table tbody tr:nth-child(odd) {
              background: #f8fafc;
            }

            table.report-table tbody tr:hover {
              background: #eff6ff;
            }

            .text-center {
              text-align: center;
            }

            .text-end {
              text-align: right;
            }

            .summary-total {
              background: #eff6ff !important;
              font-weight: 700;
            }

            .empty-row {
              text-align: center;
              padding: 18px 10px;
              color: #475569;
              font-style: italic;
            }

            .generated-at {
              margin-top: 12px;
              color: #64748b;
              font-size: 11px;
            }

            @media print {
              body {
                background: #fff;
              }

              .report-shell {
                padding: 0;
              }

              .report-card,
              .report-header {
                box-shadow: none;
              }

              .report-card,
              table.report-table th,
              table.report-table td {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-shell">
            <div class="report-header">
              <h1>Sales Transaction Report</h1>
              <p class="subtitle">Generated for print and email from the report page data.</p>
            </div>

            <div class="report-card">
              <div class="report-card-title">Report Parameters</div>
              <div class="report-card-body">
                <div class="params-grid">
                  <div class="param-item">
                    <span class="param-label">Location</span>
                    <div class="param-value">${safe(locationDisplay)}</div>
                  </div>
                  <div class="param-item">
                    <span class="param-label">Vendor</span>
                    <div class="param-value">${safe(vendorDisplay)}</div>
                  </div>
                  <div class="param-item">
                    <span class="param-label">Contract</span>
                    <div class="param-value">${safe(this.contractNumber || 'N/A')}</div>
                  </div>
                  <div class="param-item">
                    <span class="param-label">From Date</span>
                    <div class="param-value">${safe(this.fromDate || 'N/A')}</div>
                  </div>
                  <div class="param-item">
                    <span class="param-label">To Date</span>
                    <div class="param-value">${safe(this.toDate || 'N/A')}</div>
                  </div>
                  <div class="param-item">
                    <span class="param-label">Summary By / Type</span>
                    <div class="param-value">${safe(this.summaryBy)} / ${safe(this.transTypeLabel)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="report-card">
              <div class="report-card-title">Summary</div>
              <div class="report-card-body">
                <div class="table-wrap">
                  <table class="report-table">
                    <thead>
                      <tr>
                        <th>Txn Type</th>
                        <th class="text-center"># Trans</th>
                        <th class="text-center"># Tenders</th>
                        <th class="text-end">Sales</th>
                        <th class="text-end">Sales Tax</th>
                        <th class="text-end">Vendor Coupons</th>
                        <th class="text-end">Exchange Coupons</th>
                        <th class="text-end">KATUSA Coupons</th>
                        <th class="text-end">Tip</th>
                        <th class="text-end">Total</th>
                        <th class="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${summaryRows}
                      <tr class="summary-total">
                        <td>Total</td>
                        <td class="text-center">${this.summaryTotals.nbrTrans}</td>
                        <td class="text-center">${this.summaryTotals.nbrTender}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.sales))}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.salesTax))}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.vendorCoupons))}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.exchangeCoupons))}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.lineItmKatsaCpnAmt))}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.tipAmount))}</td>
                        <td class="text-end">${safe(asCurrency(this.summaryTotals.sales))}</td>
                        <td class="text-end">${safe(asPct(this.summaryTotals.pct))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="report-card">
              <div class="report-card-title">Details</div>
              <div class="report-card-body">
                <div class="table-wrap">
                  <table class="report-table">
                    <thead>
                      <tr>
                        <th class="text-center">Ticket ID</th>
                        <th class="text-center">Date</th>
                        <th class="text-center">Facility</th>
                        <th class="text-end">Mdse Sales</th>
                        <th class="text-end">Tax</th>
                        <th class="text-end">Env. Tax</th>
                        <th class="text-end">Concession Discount</th>
                        <th class="text-end">Exchange Cpns</th>
                        <th class="text-end">Total</th>
                        <th class="text-center">Tender</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${detailRows}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="generated-at">Generated: ${safe(new Date().toLocaleString())}</div>
          </div>
        </body>
      </html>`;
  }

  private formatDateForEmail(value: Date | string): string {
    const dt = value ? new Date(value) : null;
    if (!dt || isNaN(dt.getTime())) {
      return '';
    }

    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  refreshSalesTranRpt(pullFromDB: boolean): void {
    this.loadSaleTranReport();
  }

  btnContractDetails($event: Event): void {
    $event.preventDefault();
    this.router.navigate(['/sbm/ltcpage'], { queryParams: { cid: this.contractId } });
  }

  btnPrintClick($event: PointerEvent): void {
    $event.preventDefault();
    const EmailContent = this.buildSalesTranReportHtml();
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.write(EmailContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }
}