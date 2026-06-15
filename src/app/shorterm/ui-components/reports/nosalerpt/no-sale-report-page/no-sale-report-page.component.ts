import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services/toast.service';
import { LTC_NoSaleTicket } from '../../../models/nosale.report.model';
import { PosApiService } from '../../../services/pos-api-service';

interface NoSaleTicketView {
  ticketId: number;
  transactionId: number;
  date: Date | string;
  time: string;
  associate: string;
  reason: string;
}

@Component({
  selector: 'app-no-sale-report-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './no-sale-report-page.component.html',
  styleUrl: './no-sale-report-page.component.css'
})
export class NoSaleReportPageComponent implements OnInit {

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
  noSaleTickets: NoSaleTicketView[] = [];

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
        this.toastService.error('Unable to load no sale report.');
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

  onEmail(): void {
    this.toastService.success('Email action will be available for No Sale report.');
  }

  goToReportsMenu(): void {
    this.router.navigate(['/rptmenu']);
  }

  goToSalesTransaction(): void {
    this.router.navigate(['/salestran']);
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

}
