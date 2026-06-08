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
      this.contractId = params['contractid'];
      this.locationId = params['elocationIdentid'];
    });
  }

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  goToNoSaleReport() {
    this.router.navigate(['/sbmltcnosalerpt'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }  
  
  goToSalesTransactionReport(): void {
    this.router.navigate(['/sbmltcsalestranrpt'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToSettlementReport(): void {
    this.router.navigate(['/sbmltcsetlmntrpt'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goTaxSettingsReport(): void {
    this.router.navigate(['/sbmltcrpttaxsettings'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToDailyExchangeRateReport(): void {
    this.router.navigate(['/sbmltcrptdlyexchrate'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToCashDrawerReport() {
    this.router.navigate(['/sbmltcrptcashdrw'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToPriceListReport() {
    this.router.navigate(['/sbmltcrptpricelist'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToBalanceDueTickets() {
    this.router.navigate(['/sbmltcrptbalancedue'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToCancelledTickets() {
    this.router.navigate(['/sbmltcrptcancelled'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }

  goToSalesByAssociateReport() {
    this.router.navigate(['/sbmltcrptsalesbyassoc'], { queryParams: { contractid: this.contractId, locationid: this.locationId } });
  }
}
