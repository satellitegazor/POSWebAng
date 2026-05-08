import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contract-listing',
  standalone: false,
  templateUrl: './contract-listing.component.html',
  styleUrl: './contract-listing.component.css'
})
export class ContractListingComponent implements OnInit {

  ngOnInit(): void {
    const filterSelectAll = localStorage.getItem('filterSelectAll');
    const filterVendorNumber = localStorage.getItem('filterVendorNumber');
    const filterExchangeNumber = localStorage.getItem('filterExchangeNumber');
    const filterFacilityNumber = localStorage.getItem('filterFacilityNumber');
    const regionType = localStorage.getItem('regionType');
    const contractType = localStorage.getItem('contractType');
    const filterTimeFrame = localStorage.getItem('filterTimeFrame');

    const hasAnyPreference = (
      filterSelectAll !== null ||
      filterVendorNumber ||
      filterExchangeNumber ||
      filterFacilityNumber ||
      regionType ||
      contractType ||
      filterTimeFrame
    );

    if (!hasAnyPreference) {
      // Show modal for ContractFilterDlgComponent
      setTimeout(() => {
        const modal = document.getElementById('dlgEventFilter');
        if (modal) {
          // Bootstrap 5 modal show
          // @ts-ignore
          const bsModal = new window.bootstrap.Modal(modal);
          bsModal.show();
        }
      }, 0);
    }
  }
}
