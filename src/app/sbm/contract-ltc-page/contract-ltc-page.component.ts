import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { LTC_Contract } from '../../longterm/models/contract.models';

@Component({
  selector: 'app-contract-ltc-page',
  imports: [],
  templateUrl: './contract-ltc-page.component.html',
  styleUrls: ['./contract-ltc-page.component.css'],
  standalone: false
})
export class ContractLtcPageComponent implements OnInit {


  ltcContract: LTC_Contract | null = null;


  constructor(
    private sbmWebApiService: SbmWebApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const ctrid = params.get('ctrid');
      const userIdStr = sessionStorage.getItem('sbm_employeeId');
      if (ctrid && userIdStr) {
        const contractId = Number(ctrid);
        const userId = Number(userIdStr);
        if (!isNaN(contractId) && !isNaN(userId)) {
          this.LoadContract(contractId, userId);
        }
      }
    });
  }

  /**
   * Loads a contract by ContractId and UserId, assigns to ltcContract
   * @param ContractId number
   * @param UserId number
   */
  LoadContract(ContractId: number, UserId: number): void {
    this.sbmWebApiService.loadLTCContract(ContractId, UserId.toString()).subscribe({
      next: result => {
        this.ltcContract = result.contract;
      },
      error: err => {
        this.ltcContract = null;
        // Optionally handle error
      }
    });
  }

  onVendorLookupClick(): void {
    if (!this.ltcContract) {
      return;
    }

    const vendorNumber = (this.ltcContract.vendorNumber || '').trim();
    if (!vendorNumber) {
      return;
    }

    this.sbmWebApiService.getVendorLocal(vendorNumber).subscribe({
      next: (response: any) => {
        const vendor = response?.vendor || response?.Vendor || response;
        const resolvedVendorNumber = vendor?.vendorNumber || vendor?.VendorNumber || vendor?.sVendorNum || vendorNumber;
        const resolvedVendorName = vendor?.vendorName || vendor?.VendorName || vendor?.name || this.ltcContract?.vendorName || '';

        this.ltcContract!.vendorNumber = String(resolvedVendorNumber);
        this.ltcContract!.vendorName = String(resolvedVendorName);

        if (this.ltcContract?.concessionaire) {
          this.ltcContract.concessionaire.vendorNumber = String(resolvedVendorNumber);
          this.ltcContract.concessionaire.vendorName = String(resolvedVendorName);
        }
      },
      error: () => {
        // Keep existing values when lookup fails.
      }
    });
  }

  btnReportsClick(locationUID: number): void {
    throw new Error('Method not implemented.');
  }  

  onBackToContractListing() {
    this.router.navigate(['sbm/clist']);
  }
  onSaveLtcContract() {
    throw new Error('Method not implemented.');
  }
}
