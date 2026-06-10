import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sbm-ltc-reports-menu',
  standalone: false,
  templateUrl: './sbm-ltc-reports-menu.component.html',
  styleUrls: ['./sbm-ltc-reports-menu.component.css']
})
export class SbmLtcReportsMenuComponent implements OnInit {


  locationId: number = 0;
  contractId: number = 0;

  ngOnInit() {
    // Any initialization logic can go here
    this.activatedRoute.queryParams.subscribe(params => {
      this.contractId = params['cid'];
      this.locationId = params['lid'];
    });
  }

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  goToNoSaleReport() {
    this.router.navigate(['/sbm/sbmltcnosalerpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }  
  
  goToSalesTransactionReport(): void {
    this.router.navigate(['/sbm/sbmltcsalestranrpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToSettlementReport(): void {
    this.router.navigate(['/sbm/sbmltcsetlmntrpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goTaxSettingsReport(): void {
    this.router.navigate(['/sbm/sbmltcrpttaxsettings'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToDailyExchangeRateReport(): void {
    this.router.navigate(['/sbm/sbmltcrptdlyexchrate'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToCashDrawerReport() {
    this.router.navigate(['/sbm/sbmltccashdrawrpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToPriceListReport() {
    this.router.navigate(['/sbm/sbmltcpricelistrpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToBalanceDueTickets() {
    this.router.navigate(['/sbm/sbmltcbalduerpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToCancelledTickets() {
    this.router.navigate(['/sbm/sbmltccanceledrpt'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }

  goToSalesByAssociateReport() {
    this.router.navigate(['/sbm/sbmltcrptsalesbyassoc'], { queryParams: { cid: this.contractId, lid: this.locationId } });
  }
}
