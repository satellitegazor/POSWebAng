import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sbm-rov-reports-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './sbm-rov-reports-menu.component.html',
  styleUrls: ['./sbm-rov-reports-menu.component.css']
})
export class SbmRovReportsMenuComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, 
    private router: Router) {

  }

  contractId: number = 0;
  eventId: number = 0;

  ngOnInit() {
    // Any initialization logic can go here
    this.activatedRoute.queryParams.subscribe(params => {
      this.contractId = params['contractid'];
      this.eventId = params['eventid'];
    });
  }

  goToNoSaleReport() {
    this.router.navigate(['/sbmrovrptnosale'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }
  

  goToSalesTransactionReport(): void {
    this.router.navigate(['/sbmrovrptsalestran'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }

  goToSettlementReport(): void {
    this.router.navigate(['/sbmrovrptsettlement'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }

  goTaxSettingsReport(): void {
    this.router.navigate(['/sbmrovrpttaxsettings'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }

  goToDailyExchangeRateReport(): void {
    this.router.navigate(['/sbmrovrptdlyexchrate'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }

  goToCashDrawerReport() {
    this.router.navigate(['/sbmrovrptcashdrw'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }

  goToPriceListReport() {
    this.router.navigate(['/sbmrovrptpricelist'], { queryParams: { contractid: this.contractId, eventid: this.eventId } });
  }
}
