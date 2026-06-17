import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RovSalesTranRptDetailComponent } from '../detail/detail.component';

import { filter, take } from 'rxjs';
import { RovApiService } from '../../../../short-term.service';
import { AssociateNamesListDetail, AssociateNamesListResultsModel, ROV_SalesTranRptDetail, ROV_SalesTranRptDetailModel, ROV_SalesTranRptSummary, ROV_SalesTranRptSummaryModel } from '../../../../models/models';
import { RovLogonDataService } from '../../../../rov-logon-data.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../../services-misc/toast.service';
import { SendEmailRequest } from '../../../../../models/misc-models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-rov-sales-tran-rpt-page',
  imports: [CommonModule, FormsModule, RovSalesTranRptDetailComponent],
  templateUrl: './sales-tran-rpt-page.component.html',
  styleUrls: ['./sales-tran-rpt-page.component.css']
})
export class RovSalesTranRptPageComponent implements OnInit {


  eventId: number = 0;  
  contractId: number = 0;
  facilityNumber: string = '';
  fromDate: string = '';
  toDate: string = '';
  uid: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  eventName: string = '';
  contractNumber: string = '';
  associateName: string = '';
  indivId: number = 0;
    showEmailPopup: boolean = false;
  selectedEmailOption: 'self' | 'manager' | 'custom' = 'self';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;
  saleAssociateList: AssociateNamesListDetail[] = [] as AssociateNamesListDetail[];

  rptSummary: ROV_SalesTranRptSummary[] = [] as ROV_SalesTranRptSummary[];
  rptDetail: ROV_SalesTranRptDetail[] = [] as ROV_SalesTranRptDetail[];

  rptSummaryData: ROV_SalesTranRptSummary[] = [] as ROV_SalesTranRptSummary[];
  rptDetailData: ROV_SalesTranRptDetail[] = [] as ROV_SalesTranRptDetail[];

  summaryTotals = {
    nbrTrans: 0,
    nbrTender: 0,
    sales: 0,
    salesTax: 0,
    vendorCoupons: 0,
    exchangeCoupons: 0,
    //lineItmKatsaCpnAmt: 0,
    tipAmount: 0,
    pct: 0
  };
  
  summaryBy: 'F' | 'L' | 'A' = 'L';
  transType: 'A' | 'S' | 'R' = 'A';
  categorizedByCode: 'F' | 'L' | 'A' = 'L'; 
  readonly transTypeLabels: Record<'A' | 'S' | 'R', string> = {
    A: 'All Transactions',
    S: 'Sale Only',
    R: 'Refund Only'
  };
    
  get transTypeLabel(): string {
    return this.transTypeLabels[this.transType];
  }

  constructor(
    private rovApiSvc: RovApiService,
    private _logonDataSvc: RovLogonDataService,
    private router: Router,
    private toastService: ToastService) {
  }

  public ngOnInit(): void {
    this.initializeDateRange();
    //this.updateCategorizedBy('L');

    const rovEventConfig = this._logonDataSvc.getRovEventConfig(); // ensure logon data is loaded
    this.eventId = rovEventConfig?.eventID || 0;
    this.contractId = rovEventConfig?.contractUID || 0;
    this.facilityNumber = rovEventConfig?.sBMFaciltyNumber || '';
    this.vendorName = rovEventConfig?.vendorName || '';
    this.vendorNumber = rovEventConfig?.vendorNumber || '';
    this.eventName = rovEventConfig?.eventName || '';
    this.contractNumber = rovEventConfig?.contractNumber || '';
    this.associateName = rovEventConfig?.associateName || '';
    this.indivId = rovEventConfig?.individualUID || 0;
    //this.updateCategorizedBy('L');
    this.loadSaleTranReport();
  }

  private loadSaleTranReport(): void {
    this.rovApiSvc.SalesTranReportSummary(
      this.contractId,
      this.eventId,
      this.indivId,
      this.fromDate,
      this.toDate,
      false,
      this.uid
    ).subscribe(reportObj => {

        this.rptSummaryData = reportObj.summary;
      

      this.RenderSummaryReport();
    });

    this.rovApiSvc.SalesTranReportDetail(
      this.contractId,
      this.eventId,
      this.indivId,
      this.fromDate,
      this.toDate,
      false,
      this.uid
    ).subscribe(reportObj => {
      this.rptDetailData = reportObj.detail;
    });

    this.rovApiSvc.GetAssociateNamesList(this.contractId, this.eventId, this.indivId, String(this.indivId))
      .subscribe((data: AssociateNamesListResultsModel) => {
      this.saleAssociateList = data.associateListSummary.associateDetails;
    })
  }

  private RenderSummaryReport(): void {
    // handle report result

    // if (this.summaryBy === 'F') {
    //   this.groupByFacility();
    // }

    let totalSales = this.rptSummary.reduce((acc, curr) => acc + curr.sales, 0);
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
      //totals.lineItmKatsaCpnAmt += summary.lineItmKatsaCpnAmt || 0;
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
      //lineItmKatsaCpnAmt: 0,
      tipAmount: 0,
      pct: 0
    });


  }

  // onSummaryByChange(value: 'F' | 'L' | 'A'): void {
  //   if (this.summaryBy === value) return;
  //   this.summaryBy = value;
  //   this.updateCategorizedBy(value);
  //   this.RenderSummaryReport();
  //   // TODO: reload report data filtered by summaryBy
  // }

  private initializeDateRange(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    this.fromDate = this.formatDate(firstDay);

    const lastDay = new Date(year, month + 1, 0);
    this.toDate = this.formatDate(lastDay);
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



  // private updateCategorizedBy(value: 'F' | 'L' | 'A'): void {
  //   this.categorizedByCode = value;

  //   switch (value) {
  //     case 'F':
  //       this.CategorizedBy = this.facilityNumber;
  //       break;
  //     case 'L':
  //       this.CategorizedBy = this.eventName + "-" + this.facilityNumber;
  //       break;
  //     case 'A':
  //       this.CategorizedBy = this.associateName;
  //       break;
  //   }
  // }

  onTransTypeChange(value: 'A' | 'S' | 'R'): void {
    this.transType = value;

    if (!this.rptSummary?.length) {
      return;
    }

    //Filter data based on Sale or Refund transactions
    if (this.transType === 'A') {
      this.rptSummary = this.rptSummaryData;
      this.rptDetail = this.rptDetailData.sort((a, b) => b.ticketNumber - a.ticketNumber);
    } else {
      const isRefund = this.transType === 'R';
      let tenderTypes = this._logonDataSvc.getTenderTypes().types.filter(t => t.isRefundType === isRefund);
      this.rptSummary = this.rptSummaryData.filter(summary => tenderTypes.some(t => t.tenderTypeCode === summary.tenderTypeCode));
      this.rptDetail = this.rptDetailData.filter(detail => tenderTypes.some(t => t.tenderTypeCode === detail.tenderTypeCode)).sort((a, b) => b.ticketNumber - a.ticketNumber);
    }
    this.RenderSummaryReport();
  }

  // private groupByFacility(): void {
    
  //   const grouped = new Map<string, { nbrTrans: number; nbrTenders: number; totalSales: number }>();

  //   // Group and sum by facility
  //   this.rptSummary.forEach(summary => {
  //     const key = summary.
  //     if (!grouped.has(key)) {
  //       grouped.set(key, { nbrTrans: 0, nbrTenders: 0, totalSales: 0 });
  //     }
  //     const group = grouped.get(key)!;
  //     group.nbrTrans += summary.nbrTrans;
  //     group.nbrTenders += summary.nbrTender;
  //     group.totalSales += summary.sales;
  //   });

  //   // Calculate total sales for percentage
  //   const totalSales = Array.from(grouped.values()).reduce((acc, curr) => acc + curr.totalSales, 0);

  //   // Convert to array of SalesTranRptSummaryByFacility
  //   this.rptSummaryByFacility = Array.from(grouped.entries()).map(([facilityNumber, data]) => {
  //     const item = new SalesTranRptSummaryByFacility();
  //     item.facilityNumber = facilityNumber;
  //     item.nbrTrans = data.nbrTrans;
  //     item.nbrTenders = data.nbrTenders;
  //     item.totalSales = data.totalSales;
  //     item.pct = totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0;
  //     return item;
  //   });
  // }

  btnSalesTran($event: Event) {
    $event.preventDefault();
    this.router.navigate(['/salestran']);
  }
  btnReportsMenu($event: Event) {
    $event.preventDefault();
    this.router.navigate(['/reportsmenu']);
  }
  btnEmailClick($event: Event) {
    $event.preventDefault();
    this.selectedEmailOption = this.selfAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
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
    this.rovApiSvc.sendEmail(this.uid || this.indivId.toString(), request).subscribe({
      next: result => {
        this.isSendingEmail = false;
        if (result?.success) {
          this.emailSubmitSuccess = 'Email sent successfully.';
          this.showEmailPopup = false;
          this.toastService.success('Email sent successfully.');
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

  get selfAssociateEmail(): string {
    return this.saleAssociateList.find(assoc => assoc.associateID === this.indivId)?.emailAddress?.trim() || '';
  }

  get managerAssociateEmail(): string {
    return this.saleAssociateList.find(assoc => assoc.associateID === this.indivId)?.emailAddress?.trim() || '';
  }

  private getSelectedRecipientEmail(): string {
    if (this.selectedEmailOption === 'self') {
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

  private buildEmailSubject(): string {
    return `Sales Transaction Report - ${this.eventName} (${this.fromDate} to ${this.toDate})`;
  }

  private buildSalesTranReportHtml(): string {
    const safe = (val: string) => this.escapeHtml(val || '');
    const asCurrency = (val: number) => `$${(Number(val) || 0).toFixed(2)}`;
    const asPct = (val: number) => `${(Number(val) || 0).toFixed(2)}%`;

    const summaryRows = this.rptSummary.map(summary => `
      <tr>
        <td>${safe(summary.tenderTypeDescription)}</td>
        <td style="text-align:center;">${summary.nbrTrans || 0}</td>
        <td style="text-align:center;">${summary.nbrTender || 0}</td>
        <td style="text-align:right;">${asCurrency(summary.sales)}</td>
        <td style="text-align:right;">${asCurrency(summary.salesTax)}</td>
        <td style="text-align:right;">${asCurrency(summary.vendorCoupons)}</td>
        <td style="text-align:right;">${asCurrency(summary.exchangeCoupons)}</td>
        <td style="text-align:right;">${asCurrency(summary.tipAmount)}</td>
        <td style="text-align:right;">${asCurrency(summary.sales)}</td>
        <td style="text-align:right;">${asPct(summary.pct)}</td>
      </tr>`).join('');

    const detailRows = this.rptDetail.map(detail => `
      <tr>
        <td style="text-align:center;">${detail.ticketNumber || 0}</td>
        <td style="text-align:center;">${safe(this.formatDateForEmail(detail.transactionDate))}</td>
        <td style="text-align:right;">${asCurrency(detail.sales)}</td>
        <td style="text-align:right;">${asCurrency(detail.salesTax)}</td>
        <td style="text-align:right;">${asCurrency(detail.vendorCoupons)}</td>
        <td style="text-align:right;">${asCurrency(detail.exchangeCoupons)}</td>
        <td style="text-align:right;">${asCurrency((detail.sales || 0) - (detail.salesTax || 0) - (detail.vendorCoupons || 0) - (detail.exchangeCoupons || 0))}</td>
        <td style="text-align:center;">${safe(detail.tenderTypeDescription || '')}</td>
      </tr>`).join('');

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#1f2937;">
        <div style="padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:16px; background:#f8fafc;">
          <h2 style="margin:0 0 8px 0; color:#0d6efd;">Sales Transaction Report</h2>
          <div><strong>Location:</strong> ${safe(this.eventName)} (${safe(this.facilityNumber)})</div>
          <div><strong>Vendor:</strong> ${safe(this.vendorName)} (${safe(this.vendorNumber)})</div>
          <div><strong>Contract:</strong> ${safe(this.contractNumber)}</div>
          <div><strong>Date Range:</strong> ${safe(this.fromDate)} to ${safe(this.toDate)}</div>
          <div><strong>Summary By:</strong> ${safe(this.summaryBy)} | <strong>Transaction Type:</strong> ${safe(this.transTypeLabel)}</div>
        </div>

        <h3 style="margin:0 0 8px 0; color:#0d6efd;">Summary</h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <thead>
            <tr style="background:#e9ecef;">
              <th style="border:1px solid #dee2e6; padding:8px; text-align:left;">Txn Type</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:center;"># Trans</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:center;"># Tenders</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Sales</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Sales Tax</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Vendor Coupons</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Exchange Coupons</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">KATUSA Coupons</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Tip</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Total</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${summaryRows}
            <tr style="background:#f1f5f9; font-weight:700;">
              <td style="border:1px solid #dee2e6; padding:8px;">Total</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:center;">${this.summaryTotals.nbrTrans}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:center;">${this.summaryTotals.nbrTender}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asCurrency(this.summaryTotals.sales)}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asCurrency(this.summaryTotals.salesTax)}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asCurrency(this.summaryTotals.vendorCoupons)}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asCurrency(this.summaryTotals.exchangeCoupons)}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asCurrency(this.summaryTotals.tipAmount)}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asCurrency(this.summaryTotals.sales)}</td>
              <td style="border:1px solid #dee2e6; padding:8px; text-align:right;">${asPct(this.summaryTotals.pct)}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin:0 0 8px 0; color:#0d6efd;">Details</h3>
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#e9ecef;">
              <th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Ticket ID</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Date</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:left;">Facility</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Mdse Sales</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Tax</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Env. Tax</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Concession Discount</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Exchange Cpns</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:right;">Total</th>
              <th style="border:1px solid #dee2e6; padding:8px; text-align:center;">Tender</th>
            </tr>
          </thead>
          <tbody>
            ${detailRows}
          </tbody>
        </table>
      </div>`;
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



}