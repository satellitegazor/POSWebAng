import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports-menu',
  imports: [],
  templateUrl: './reports-menu.component.html',
  styleUrl: './reports-menu.component.css'
})
export class ReportsMenuComponent {

  
  goToNoSaleReport() {
    this.router.navigate(['/rptnosale']);
  }
  constructor(private router: Router) {}

  goToSalesTransactionReport(): void {
    this.router.navigate(['/rptsalestran']);
  }

  goToSettlementReport(): void {
    this.router.navigate(['/rptsettlement']);
  }

  goToBalanceDueTickets(): void {
    this.router.navigate(['/rptbaldue']);
  }

  goToCancelledTickets(): void {
    this.router.navigate(['/rptcncld']);
  }

  goToCashDrawerReport() {
    this.router.navigate(['/rptcashdrw']);
  }
  goToPriceListReport() {
    this.router.navigate(['/rptpricelist']);
  }
}
