import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services-misc/toast.service';
import { LTC_NoSaleTicket } from '../../../../longterm/models/nosale.report.model';
import { PosApiService } from '../../../../longterm/services/pos-api-service';
import { LTC_Contract } from '../../../../longterm/models/contract.models';
import { LTC_Associates, LTC_LocationAssociatesResultsModel } from '../../../../longterm/models/location.associates';
import { SbmWebApiService } from '../../../../sbm/services/sbm-web-api.service';
import { FormsModule } from '@angular/forms';
import { LTC_StoreLocation } from '../../../../longterm/models/store.location';
import { LTC_ContractResultsModel } from '../../../../longterm/models/contract.models';
import { SendEmailRequest } from '../../../../models/misc-models';

interface NoSaleTicketView {
  ticketId: number;
  transactionId: number;
  date: Date | string;
  time: string;
  associate: string;
  reason: string;
}

@Component({
  selector: 'app-sbm-ltc-no-sale-report-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './no-sale-report-page.component.html',
  styleUrls: ['./no-sale-report-page.component.css']
})
export class SbmLtcNoSaleReportPageComponent implements OnInit {


  indivId: number = 0;
  contractId: number = 0;
  locationId: number = 0;
  facilityNumber: string = '';
  locationName: string = '';
  contractNumber: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  sbm_user_name: string = '';

  ltcContract: LTC_Contract | null = null;
  SaleAssocList: LTC_Associates[] = [];
  
  fromDate: Date = new Date();
  toDate: Date = new Date();

  isLoading: boolean = false;
  noSaleTickets: NoSaleTicketView[] = [];

  selectedEmailOption: 'owner' | 'manager' | 'custom' = 'owner';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;
  showEmailPopup: boolean = false;
  selfAssociateEmail: string = '';
  managerAssociateEmail: string = '';
  
  constructor(
    private posApiService: PosApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sbmApiService: SbmWebApiService,
    private toastSvc: ToastService
  ) {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  ngOnInit(): void {
    
    this.indivId = 0;
    this.locationId = 0;
    this.contractId = 0;
    this.facilityNumber = '';
    this.locationName = '';
    this.contractNumber = '';
    this.vendorName = '';
    this.vendorNumber = '';
    
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
      }
    });

    this.getNoSaleReportData();
  }

  get hasTickets(): boolean {
    return this.noSaleTickets.length > 0;
  }

  getNoSaleReportData(): void {
    const uid = String(this.indivId || '');
    this.isLoading = true;
    this.noSaleTickets = [];

    this.posApiService.getNoSaleReport(
      this.contractId,
      this.locationId,
      this.facilityNumber,
      this.formatDate(this.fromDate),
      this.formatDate(this.toDate),
      uid
    ).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.noSaleTickets = this.normalizeNoSaleTickets(result?.noSaleSummary?.noSaleTickets ?? (result as any)?.summaryReport?.noSaleDetails ?? []);
      },
      error: () => {
        this.isLoading = false;
        this.noSaleTickets = [];
        this.toastSvc.error('Unable to load no sale report.');
      }
    });
  }

  onRefreshClick(): void {
    this.getNoSaleReportData();
  }

  onFromDateChange(value: string): void {
    if (!value) {
      return;
    }
    this.fromDate = new Date(`${value}T00:00:00`);
  }

  onToDateChange(value: string): void {
    if (!value) {
      return;
    }
    this.toDate = new Date(`${value}T00:00:00`);
  }

  private normalizeNoSaleTickets(tickets: LTC_NoSaleTicket[] | any[]): NoSaleTicketView[] {
    return (tickets || []).map((ticket: any) => ({
      ticketId: Number(ticket.ticketID ?? ticket.ticketId ?? ticket.txnid ?? ticket.txnid ?? 0),
      transactionId: Number(ticket.transactionID ?? ticket.transactionId ?? ticket.txnid ?? ticket.txnid ?? 0),
      date: ticket.date ?? ticket.dropOffDate ?? ticket.transactionDate ?? '',
      time: String(ticket.time ?? this.extractTime(ticket.transactionDate) ?? ''),
      associate: String(ticket.associate ?? ''),
      reason: String(ticket.reason ?? '')
    }));
  }

  private extractTime(value: Date | string): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onEmailClick($event: PointerEvent) {
    $event.preventDefault();
    this.selectedEmailOption = this.selfAssociateEmail ? 'owner' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;  
  }
  btnPrintClick($event: PointerEvent) {
    $event.preventDefault();
    const EmailContent = this.buildNoSaleReportHtml();
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.write(EmailContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  goToReportsMenu() {
    this.router.navigate(['/sbm/sbmltcrptmenu'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToContractDetails($event: PointerEvent) {
    $event.preventDefault();
    this.router.navigate(['/sbm/ltcpage'], { queryParams: { cid: this.contractId } });
  }

  private buildEmailSubject(): string {
    return `No Sale Report - ${this.locationName} (${this.fromDate} to ${this.toDate})`;
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
      EmailContent: this.buildNoSaleReportHtml()
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


  buildNoSaleReportHtml(): string {

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

    const rowsHtml = this.noSaleTickets.length
      ? this.noSaleTickets.map(ticket => `
          <tr>
          <td class="text-center">${escapeHtml(ticket.ticketId)}</td>
          <td class="text-center">${escapeHtml(ticket.date)}</td>
          <td class="text-center">${escapeHtml(ticket.time)}</td>
          <td class="text-center">${escapeHtml(ticket.associate)}</td>
          <td class="text-center">${escapeHtml(ticket.reason)}</td>
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
          <title>Canceled Tickets Report</title>
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
            <h1>Canceled Tickets Report</h1>
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

          <div class="table-title">Canceled Tickets Report</div>
          <table class="report">
            <thead>
              <tr>
							<th class="text-center">Ticket ID</th>
							<th class="text-center">Date</th>
							<th class="text-center">Time</th>
							<th class="text-start">Associate</th>
							<th class="text-start">Reason</th>
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
    this.getNoSaleReportData();
  }

}
