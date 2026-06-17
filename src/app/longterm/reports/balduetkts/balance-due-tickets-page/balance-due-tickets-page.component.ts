import { Component } from '@angular/core';
import { PosApiService } from '../../../services/pos-api-service';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../services-misc/toast.service';
import { LTC_BalanceDueTickets, LTC_BalanceDueTicketsResultsModel } from '../../../models/balancedue.tickets.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-balance-due-tickets-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './balance-due-tickets-page.component.html',
  styleUrls: ['./balance-due-tickets-page.component.css']
})
export class BalanceDueTicketsPageComponent {

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
  public isLoading: boolean = false;
  public hasTickets: boolean = false;
  balDueTickets: LTC_BalanceDueTickets[] = [];

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

    this.getBalanceDueTicketsData();
  }

  getBalanceDueTicketsData(): void {
    const uid = String(this.indivId || '');

    this.isLoading = true;

    this.posApiService.getBalanceDueTickets(
      this.contractId,
      this.locationId,
      this.facilityNumber,
      this.formatDate(this.fromDate),
      this.formatDate(this.toDate),
      uid
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

  onEmail(): void {
    this.toastService.success('Email action will be available for Balance Due Tickets report.');
  }

  goToReportsMenu(): void {
    this.router.navigate(['/rptmenu']);
  }

  goToSalesTransaction(): void {
    this.router.navigate(['/salestrans']);
  }

  public formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }



}
