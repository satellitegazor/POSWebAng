
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-contract-filter-dlg',
  imports: [FormsModule, CommonModule],
  templateUrl: './contract-filter-dlg.component.html',
  styleUrls: ['./contract-filter-dlg.component.css']
})
export class ContractFilterDlgComponent {

  constructor(public activeModal: NgbActiveModal) {}

  onSelectFilter() {
    // Get values from UI elements
    const vendorNumber = (document.getElementById('txtFilterVendorNumber') as HTMLInputElement)?.value || '';
    const exchangeNumber = (document.getElementById('txtFilterExchangeNumber') as HTMLInputElement)?.value || '';
    const facilityNumber = (document.getElementById('txtFilterFacilityNumber') as HTMLInputElement)?.value || '';
    const selectAll = (document.getElementById('filterSelectAll') as HTMLInputElement)?.checked || false;
    const regionType = (document.getElementById('regiontype') as HTMLSelectElement)?.value || '';
    const contractType = (document.getElementById('contracttype') as HTMLSelectElement)?.value || '';

    // Save dvFilterPast, dvFilterCurrent, dvFilterFuture as separate localStorage items
    const dvFilterPastChecked = (document.getElementById('dvFilterPast') as HTMLInputElement)?.checked || false;
    const dvFilterCurrentChecked = (document.getElementById('dvFilterCurrent') as HTMLInputElement)?.checked || false;
    const dvFilterFutureChecked = (document.getElementById('dvFilterFuture') as HTMLInputElement)?.checked || false;

    localStorage.setItem('filterVendorNumber', vendorNumber);
    localStorage.setItem('filterExchangeNumber', exchangeNumber);
    localStorage.setItem('filterFacilityNumber', facilityNumber);
    localStorage.setItem('filterSelectAll', JSON.stringify(selectAll));
    localStorage.setItem('regionType', regionType);
    localStorage.setItem('contractType', contractType);
    localStorage.setItem('dvFilterPast', JSON.stringify(dvFilterPastChecked));
    localStorage.setItem('dvFilterCurrent', JSON.stringify(dvFilterCurrentChecked));
    localStorage.setItem('dvFilterFuture', JSON.stringify(dvFilterFutureChecked));

    this.activeModal.close('selected');
  
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
