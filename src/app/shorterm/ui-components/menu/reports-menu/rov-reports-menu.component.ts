import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rov-reports-menu',
  imports: [],
  templateUrl: './rov-reports-menu.component.html',
  styleUrls: ['./rov-reports-menu.component.css']
})
export class RovReportsMenuComponent {

  
  goToNoSaleReport() {
    this.router.navigate(['/rovrptnosale']);
  }
  constructor(private router: Router) {}

  goToSalesTransactionReport(): void {
    this.router.navigate(['/rovrptsalestran']);
  }

  goToSettlementReport(): void {
    this.router.navigate(['/rovrptsettlement']);
  }

  goToBalanceDueTickets(): void {
    this.router.navigate(['/rovrptbaldue']);
  }

  goToCancelledTickets(): void {
    this.router.navigate(['/rovrptcncld']);
  }

  goToCashDrawerReport() {
    this.router.navigate(['/rovrptcashdrw']);
  }
  goToPriceListReport() {
    this.router.navigate(['/rovrptpricelist']);
  }
}
