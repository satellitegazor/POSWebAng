
import { Component } from '@angular/core';

@Component({
  selector: 'app-contract-filter-dlg',
  imports: [],
  templateUrl: './contract-filter-dlg.component.html',
  styleUrl: './contract-filter-dlg.component.css'
})
export class ContractFilterDlgComponent {

  onSelectFilter() {
    // Get values from UI elements
    const vendorNumber = (document.getElementById('txtFilterVendorNumber') as HTMLInputElement)?.value || '';
    const exchangeNumber = (document.getElementById('txtFilterExchangeNumber') as HTMLInputElement)?.value || '';
    const facilityNumber = (document.getElementById('txtFilterFacilityNumber') as HTMLInputElement)?.value || '';
    const selectAll = (document.getElementById('filterSelectAll') as HTMLInputElement)?.checked || false;
    const regionType = (document.getElementById('regiontype') as HTMLSelectElement)?.value || '';
    const contractType = (document.getElementById('contracttype') as HTMLSelectElement)?.value || '';

    // TimeFrame: collect checked values for dvFilterPast, dvFilterCurrent, dvFilterFuture
    const timeframes: string[] = [];
    if ((document.getElementById('dvFilterPast') as HTMLInputElement)?.checked) timeframes.push('P');
    if ((document.getElementById('dvFilterCurrent') as HTMLInputElement)?.checked) timeframes.push('C');
    if ((document.getElementById('dvFilterFuture') as HTMLInputElement)?.checked) timeframes.push('F');

    // Save to localStorage
    localStorage.setItem('filterVendorNumber', vendorNumber);
    localStorage.setItem('filterExchangeNumber', exchangeNumber);
    localStorage.setItem('filterFacilityNumber', facilityNumber);
    localStorage.setItem('filterSelectAll', JSON.stringify(selectAll));
    localStorage.setItem('regionType', regionType);
    localStorage.setItem('contractType', contractType);
    localStorage.setItem('filterTimeFrame', JSON.stringify(timeframes));
  }

  onFilterSelectAllChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const checked = checkbox.checked;
    const vendorInput = document.getElementById('txtFilterVendorNumber') as HTMLInputElement;
    const exchangeInput = document.getElementById('txtFilterExchangeNumber') as HTMLInputElement;
    const facilityInput = document.getElementById('txtFilterFacilityNumber') as HTMLInputElement;

    if (checked) {
      // If any field has value, warn user
      if (vendorInput.value || exchangeInput.value || facilityInput.value) {
        const proceed = window.confirm('All entered data will be removed. Do you want to continue?');
        if (!proceed) {
          checkbox.checked = false;
          return;
        }
        // Clear fields
        vendorInput.value = '';
        exchangeInput.value = '';
        facilityInput.value = '';
      }
      vendorInput.disabled = true;
      exchangeInput.disabled = true;
      facilityInput.disabled = true;
    } else {
      vendorInput.disabled = false;
      exchangeInput.disabled = false;
      facilityInput.disabled = false;
    }
  }
}
