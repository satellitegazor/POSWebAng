import { Component } from '@angular/core';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../../services/toast.service';
import { LTC_BalanceDueTickets, LTC_BalanceDueTicketsResultsModel } from '../../../../longterm/models/balancedue.tickets.model'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PosApiService } from '../../../../longterm/services/pos-api-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { LTC_Contract } from 'src/app/longterm/models/contract.models';
import { SbmWebApiService } from 'src/app/sbm/services/sbm-web-api.service';
import { useAnimation } from '@angular/animations';

@Component({
  selector: 'app-balance-due-tickets-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './sbm-ltc-bal-due-tkts-page.component.html',
  styleUrls: ['./sbm-ltc-bal-due-tkts-page.component.css']
})
export class SbmLtcBalDueTktsPageComponent {
onLocationChange() {
throw new Error('Method not implemented.');
}

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

  ltcContract: LTC_Contract = {} as LTC_Contract;
  
  constructor(
    private sbmApiService: SbmWebApiService,
    private router: Router,
    private toastService: ToastService,
    private activRoute: ActivatedRoute,
    private posApiService: PosApiService,
  ) {
    const now = new Date();
    this.fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    this.toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  ngOnInit(): void {

    const queryParams = toSignal(this.activRoute.queryParams);
    this.contractId = +queryParams()?.['cid'] || 0;
    this.locationId = +queryParams()?.['lid'] || 0;
    this.sbm_user_name = sessionStorage.getItem('sbm_name') || '';

    this.sbmApiService.loadLTCContract(this.contractId, this.sbm_user_name).subscribe({
      next: (result) => {
        this.ltcContract = result.contract;
        this.locationId = this.ltcContract?.locations[0]?.locationUID || 0;
        this.locationName = this.ltcContract?.locations[0]?.locationName || '';
        this.contractNumber = this.ltcContract?.contractNumber || '';
        this.facilityNumber = this.ltcContract?.locations[0]?.facilities[0]?.facilityNumber || '';
        this.vendorName = this.ltcContract?.vendorName || '';
        this.vendorNumber = this.ltcContract?.vendorNumber || '';
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
