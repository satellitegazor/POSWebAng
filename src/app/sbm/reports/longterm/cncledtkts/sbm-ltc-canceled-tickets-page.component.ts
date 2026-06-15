import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services/toast.service';
import { LTC_CancelledTickets } from '../../../../longterm/models/canceled.tickets.model'
import { PosApiService } from '../../../../longterm/services/pos-api-service';
import { SbmWebApiService } from 'src/app/sbm/services/sbm-web-api.service';
import { LTC_Contract } from 'src/app/longterm/models/contract.models';
import { LTC_Associates, LTC_LocationAssociatesResultsModel } from 'src/app/longterm/models/location.associates';
import { FormsModule } from '@angular/forms';
import { LTC_StoreLocation } from '../../../../longterm/models/store.location';
import { LTC_ContractResultsModel } from '../../../../longterm/models/contract.models';
import { SendEmailRequest } from '../../../../models/misc-models';

interface CancelledTicketGroup {
  locationUID: number;
  locationName: string;
  tickets: LTC_CancelledTickets[];
}

@Component({
  selector: 'app-sbm-ltc-canceled-tickets-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sbm-ltc-canceled-tickets-page.component.html',
  styleUrls: ['./sbm-ltc-canceled-tickets-page.component.css']
})
export class SbmLtcCanceledTicketsPageComponent implements OnInit {


  sbm_user_name: string = '';
  contractId: number = 0;
  locationId: number = 0;
  facilityNumber: string = '';
  locationName: string = '';
  contractNumber: string = '';
  vendorName: string = '';
  vendorNumber: string = '';

  ltcContract: LTC_Contract | null = null;
  SaleAssocList: LTC_Associates[] = [];

  fromDate: Date = new Date();
  toDate: Date = new Date();

  isLoading: boolean = false;
  cancelledTickets: LTC_CancelledTickets[] = [];

  selectedEmailOption: 'self' | 'manager' | 'custom' = 'self';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;
  showEmailPopup: boolean = false;
  ownerAssociateEmail: string = '';
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
          this.SaleAssocList = data.associates.filter(a => a.code === 'RLTYP_CONC_ASSC')
          this.managerAssociateEmail = data.associates.find(a => a.code === 'RLTYP_CONC_MNGR')?.emailAddress || '';
        });
      }
    });
    this.getCancelledTicketsData();
  }


  private initializeParameters(): void {

    this.contractId =  0;
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
   
  }

  get hasTickets(): boolean {
    return this.cancelledTickets.length > 0;
  }

  get groupedTickets(): CancelledTicketGroup[] {
    const grouped = new Map<number, CancelledTicketGroup>();

    for (const ticket of this.cancelledTickets) {
      const key = ticket.locationUID || 0;
      if (!grouped.has(key)) {
        grouped.set(key, {
          locationUID: key,
          locationName: ticket.locationName || this.locationName,
          tickets: []
        });
      }
      grouped.get(key)!.tickets.push(ticket);
    }

    return Array.from(grouped.values());
  }

  getCancelledTicketsData(): void {
    const uid = String(this.sbm_user_name || '');
    this.isLoading = true;
    this.cancelledTickets = [];

    this.posApiService.getCancelledTickets(
      this.contractId,
      this.locationId,
      this.facilityNumber,
      this.formatDate(this.fromDate),
      this.formatDate(this.toDate),
      uid
    ).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.cancelledTickets = result?.ltcCancelledTickets?.cancelledTickets ?? [];
      },
      error: () => {
        this.isLoading = false;
        this.cancelledTickets = [];
        this.toastSvc.error('Unable to load cancelled tickets report.');
      }
    });
  }

  onRefreshClick(): void {
    this.getCancelledTicketsData();
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

  getAmount(ticket: LTC_CancelledTickets): number {
    return ticket.dfltCurrCode === 'USD' ? ticket.totalAmount : ticket.fcTotalAmount;
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

  
  goToReportsMenu(): void {
    this.router.navigate(['/sbm/sbmltcrptmenu'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private buildEmailSubject(): string {
    return `Canceled Tickets Report - ${this.locationName} (${this.fromDate} to ${this.toDate})`;
  }

  buildCanceledTicketsReportHtml(): string {

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

    const rowsHtml = this.cancelledTickets.length
      ? this.cancelledTickets.map(ticket => `
          <tr>
          <td class="text-center">${escapeHtml(ticket.transactionID)}</td>
          <td class="text-center">${escapeHtml(formatReportDate(ticket.dropOffDate))}</td>
          <td class="text-center">${escapeHtml(formatReportDate(ticket.cancelDate))}</td>
            <td class="text-center">${escapeHtml(ticket.daysElapsed)}</td>
            <td class="text-end" [style.color]="(ticket.tenderAmount || 0) < 0 ? 'red' : 'black'">
              ${escapeHtml(formatCurrency(this.getAmount(ticket)))}
            </td>
            <td class="text-center">${escapeHtml(ticket.customerName)}</td>
            <td class="text-center">${escapeHtml(this.formatPhone(ticket.phoneNumber, ticket.countryDialCode))}</td>
            <td class="text-center">${escapeHtml(ticket.reason)}</td>
            <td class="text-center">${escapeHtml(ticket.associate)}</td>
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
							<th class="text-center">Ticket Date</th>
							<th class="text-center">Cancel Date</th>
							<th class="text-center">Days Elapsed</th>
							<th class="text-end">Total Amount</th>
							<th>Customer Name</th>
							<th class="text-center">Phone Number</th>
							<th>Reason</th>
							<th>Associate</th>
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
      EmailContent: this.buildCanceledTicketsReportHtml()
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

  onLocationChange() {
    this.getCancelledTicketsData();
  }

  onEmailClick($event: Event) {
    $event.preventDefault();
    this.selectedEmailOption = this.ownerAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;  
  }

  btnPrintClick($event: PointerEvent) {
    $event.preventDefault();
    const EmailContent = this.buildCanceledTicketsReportHtml();
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
      printWindow.document.write(EmailContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  goToContractDetails($event: PointerEvent) {
    $event.preventDefault();
    this.router.navigate(['/sbm/ltcpage'], { queryParams: { cid: this.contractId } });
  }

}
