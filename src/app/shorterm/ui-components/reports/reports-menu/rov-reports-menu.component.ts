import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RovLogonDataService } from '../../../rov-logon-data.service';
import { EventConfig } from '../../../models/event.config';

@Component({
  selector: 'app-rov-reports-menu',
  imports: [],
  templateUrl: './rov-reports-menu.component.html',
  styleUrls: ['./rov-reports-menu.component.css']
})
export class RovReportsMenuComponent implements OnInit {

  eventConfig: EventConfig = new EventConfig();
  rgnCode: string = '';

  constructor(
    private router: Router,
    private rovLogonDataService: RovLogonDataService
  ) {}

  ngOnInit(): void {
    this.eventConfig = this.rovLogonDataService.getRovEventConfig();
    this.rgnCode = this.eventConfig.rgnCode;
  }

  
  goToNoSaleReport() {
    this.router.navigate(['/rovrptnosale']);
  }

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

}
