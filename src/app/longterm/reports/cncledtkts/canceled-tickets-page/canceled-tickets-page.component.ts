import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services-misc/toast.service';
import { LTC_CancelledTickets } from '../../../models/canceled.tickets.model';
import { PosApiService } from '../../../services/pos-api-service';

interface CancelledTicketGroup {
  locationUID: number;
  locationName: string;
  tickets: LTC_CancelledTickets[];
}

@Component({
  selector: 'app-canceled-tickets-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './canceled-tickets-page.component.html',
  styleUrl: './canceled-tickets-page.component.css'
})
export class CanceledTicketsPageComponent implements OnInit {

  indivId: number = 0;
  contractId: number = 0;
  locationId: number = 0;
  facilityNumber: string = '';
  locationName: string = '';
  contractNumber: string = '';
  vendorName: string = '';
  vendorNumber: string = '';

  fromDate: Date = new Date();
  toDate: Date = new Date();

  isLoading: boolean = false;
  cancelledTickets: LTC_CancelledTickets[] = [];

  constructor(
    private posApiService: PosApiService,
    private logonDataSvc: LogonDataService,
    private router: Router,
    private toastService: ToastService
  ) {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  ngOnInit(): void {
    const locCnfg = this.logonDataSvc.getLocationConfig();
    this.indivId = locCnfg.individualUID || 0;
    this.locationId = locCnfg.locationUID;
    this.contractId = locCnfg.contractUID;
    this.facilityNumber = locCnfg.facilityNumber || '';
    this.locationName = locCnfg.locationName || '';
    this.contractNumber = locCnfg.contractNumber || '';
    this.vendorName = locCnfg.vendorName || '';
    this.vendorNumber = locCnfg.vendorNumber || '';

    this.getCancelledTicketsData();
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
    const uid = String(this.indivId || '');
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
        this.toastService.error('Unable to load cancelled tickets report.');
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

  onEmail(): void {
    this.toastService.success('Email action will be available for Cancelled Tickets report.');
  }

  goToReportsMenu(): void {
    this.router.navigate(['/rptmenu']);
  }

  goToSalesTransaction(): void {
    this.router.navigate(['/salestran']);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

}
