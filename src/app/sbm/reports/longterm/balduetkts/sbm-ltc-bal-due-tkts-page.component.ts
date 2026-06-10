import { Component } from '@angular/core';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { LTC_BalanceDueTickets, LTC_BalanceDueTicketsResultsModel } from '../../../../longterm/models/balancedue.tickets.model'
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PosApiService, SendEmailRequest } from '../../../../longterm/services/pos-api-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { LTC_Contract } from 'src/app/longterm/models/contract.models';
import { SbmWebApiService } from 'src/app/sbm/services/sbm-web-api.service';
import { useAnimation } from '@angular/animations';
import { LTC_Associates, LTC_LocationAssociatesResultsModel } from 'src/app/longterm/models/location.associates';
import { LTC_StoreLocation } from '../../../../longterm/models/store.location';
import { LTC_ContractResultsModel } from '../../../../longterm/models/contract.models';

@Component({
  selector: 'app-balance-due-tickets-page',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sbm-ltc-bal-due-tkts-page.component.html',
  styleUrls: ['./sbm-ltc-bal-due-tkts-page.component.css']
})
export class SbmLtcBalDueTktsPageComponent {

  sbm_user_name: string = '';
  contractId: number = 0;
  locationId: number = 0;
  facilityNumber: string = '';
  locationName: string = '';
  contractNumber: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  fromDate: Date = new Date();
  toDate: Date = new Date();
  public isLoading: boolean = false;
  public hasTickets: boolean = false;
  balDueTickets: LTC_BalanceDueTickets[] = [];
  SaleAssocList: LTC_Associates[] = [];
  showEmailPopup: boolean = false;

  ltcContract: LTC_Contract = {} as LTC_Contract;
  
  constructor(
    private sbmApiService: SbmWebApiService,
    private router: Router,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private posApiService: PosApiService,
  ) {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  ngOnInit(): void {

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

    this.getBalanceDueTicketsData();
  }

  getBalanceDueTicketsData(): void {

    this.isLoading = true;

    this.posApiService.getBalanceDueTickets(
      this.contractId,
      this.locationId,
      this.facilityNumber,
      this.formatDate(this.fromDate),
      this.formatDate(this.toDate),
      this.sbm_user_name
    ).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.hasTickets = true;        
        this.balDueTickets = result?.balDueTktSummary?.balDueTickets ?? [];
      },
      error: () => {
        this.isLoading = false;
        
        this.hasTickets = false;
        this.balDueTickets = [];

        this.toastService.error('Unable to load balance due tickets.');
      }
    });
  }

  onRefreshClick(): void {
    this.getBalanceDueTicketsData();
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

  get tickets(): LTC_BalanceDueTickets[] {
    return this.balDueTickets;
  }

  getAmount(ticket: LTC_BalanceDueTickets): number {
    return ticket.dfltCurrCode === 'USD' ? ticket.totalAmount : ticket.fcTotalAmount;
  }

  getBalanceDue(ticket: LTC_BalanceDueTickets): number {
    return ticket.dfltCurrCode === 'USD' ? ticket.balanceDue : ticket.fcBalanceDue;
  }

  isValidDueDate(value: Date): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900;
  }

  formatPhone(phoneNumber: string, countryDialCode: string): string {
    if (!phoneNumber) {
      return 'N/A';
    }

    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const formattedPhone = digitsOnly.length === 10
      ? `${digitsOnly.substring(0, 3)}-${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6, 10)}`
      : phoneNumber;

    return countryDialCode ? `(${countryDialCode}) ${formattedPhone}` : formattedPhone;
  }

  selectedEmailOption: 'self' | 'manager' | 'custom' = 'self';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;

  get ownerAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => ((assoc.code || '').toUpperCase() === 'RLTYP_CONC_OWNR'))?.emailAddress?.trim() || '';
  }


  get managerAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => (assoc.code || '').toUpperCase() === 'RLTYP_CONC_MNGR')?.emailAddress?.trim() || '';
  }

  onEmail($event: Event): void {
    $event.preventDefault();
    this.selectedEmailOption = this.ownerAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;    
  }

  public formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  buildBalanceDueTicketsReportHtml(): string {
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
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(safeAmount);
    };

    const selectedLocation = this.locationId === 0
      ? 'All'
      : this.ltcContract?.locations?.find(loc => Number(loc.locationUID) === Number(this.locationId))?.locationName || this.locationName || 'N/A';

    const rowsHtml = this.balDueTickets.length
      ? this.balDueTickets.map(ticket => `
          <tr>
            <td class="text-center">${escapeHtml(ticket.ticketID)}</td>
            <td class="text-center">${escapeHtml(formatReportDate(ticket.dropOffDate))}</td>
            <td class="text-center">${escapeHtml(ticket.daysElapsed)}</td>
            <td class="text-right">${escapeHtml(formatCurrency(this.getAmount(ticket)))}</td>
            <td class="text-right">${escapeHtml(formatCurrency(this.getBalanceDue(ticket)))}</td>
            <td class="text-center">${escapeHtml(this.isValidDueDate(ticket.payByDueDate) ? formatReportDate(ticket.payByDueDate) : 'N/A')}</td>
            <td>${escapeHtml(ticket.customerName || 'N/A')}</td>
            <td>${escapeHtml(ticket.emailAddress ? ticket.emailAddress.toLowerCase() : 'N/A')}</td>
            <td>${escapeHtml(this.formatPhone(ticket.phoneNumber, ticket.countryDialCode))}</td>
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
          <title>Balance Due Tickets Report</title>
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
            <h1>Balance Due Tickets Report</h1>
          </div>

          <div class="meta">
            <table>
              <tr>
                <td><span class="label">Location</span>${escapeHtml(selectedLocation)}</td>
                <td><span class="label">Contract Number</span>${escapeHtml(this.contractNumber || 'N/A')}</td>
                <td><span class="label">Vendor</span>${escapeHtml(this.vendorName + (this.vendorNumber ? ` (${this.vendorNumber})` : '')) || 'N/A'}</td>
              </tr>
              <tr>
                <td><span class="label">From Date</span>${escapeHtml(formatReportDate(this.fromDate))}</td>
                <td><span class="label">To Date</span>${escapeHtml(formatReportDate(this.toDate))}</td>
                <td><span class="label">Facility Number</span>${escapeHtml(this.facilityNumber || 'N/A')}</td>
              </tr>
            </table>
          </div>

          <div class="table-title">Balance Due Tickets</div>
          <table class="report">
            <thead>
              <tr>
                <th class="text-center">Ticket ID</th>
                <th class="text-center">Ticket Date</th>
                <th class="text-center">Days Elapsed</th>
                <th class="text-right">Total Amount</th>
                <th class="text-right">Balance Due</th>
                <th class="text-center">Payment Due Date</th>
                <th>Customer Name</th>
                <th>Customer Email</th>
                <th>Phone Number</th>
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

  btnPrintClick($event: PointerEvent) {
    const EmailContent = this.buildBalanceDueTicketsReportHtml();
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.write(EmailContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  goToReportsMenu(): void {
    this.router.navigate(['/sbm/sbmltcrptmenu'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToContractDetails($event: Event) {
    $event.preventDefault();
    this.router.navigate(['/sbm/ltcpage'], { queryParams: { cid: this.contractId } });
  }

  onLocationChange() {
    this.getBalanceDueTicketsData();   
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      EmailContent: this.buildBalanceDueTicketsReportHtml()
    };

    this.isSendingEmail = true;
    this.posApiService.sendEmail(this.sbm_user_name, request).subscribe({
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

  private buildEmailSubject(): string {
    return `Balance Due Tickets Report - ${this.locationName} (${this.fromDate} to ${this.toDate})`;
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

  closeEmailPopup() {
    this.showEmailPopup = false;
    this.isSendingEmail = false;
  }


}
