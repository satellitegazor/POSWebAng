import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SbmWebApiService } from '../services/sbm-web-api.service';
import { VendorContractDataModel } from '../models/contract.models';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ContractFilterDlgComponent } from '../contract-filter-dlg/contract-filter-dlg.component';

@Component({
  selector: 'app-contract-listing',
  standalone: false,
  templateUrl: './contract-listing.component.html',
  styleUrls: ['./contract-listing.component.css']
})
export class ContractListingComponent implements OnInit {

  public contractData: VendorContractDataModel | null = null;
  public isLoading = false;
  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true,
    windowClass: 'wider-modal' // This class will be applied to the modal window
  };

  constructor(
    private sbmWebApiService: SbmWebApiService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {

    const filterSelectAll = localStorage.getItem('filterSelectAll');
    const filterVendorNumber = localStorage.getItem('filterVendorNumber');
    const filterExchangeNumber = localStorage.getItem('filterExchangeNumber');
    const filterFacilityNumber = localStorage.getItem('filterFacilityNumber');
    const regionType = localStorage.getItem('regionType');
    const contractType = localStorage.getItem('contractType');
    const dvFilterPast = localStorage.getItem('dvFilterPast');
    const dvFilterCurrent = localStorage.getItem('dvFilterCurrent');
    const dvFilterFuture = localStorage.getItem('dvFilterFuture');

    const hasAnyPreference = (
      filterSelectAll !== null ||
      filterVendorNumber ||
      filterExchangeNumber ||
      filterFacilityNumber ||
      regionType ||
      contractType ||
      dvFilterPast ||
      dvFilterCurrent ||
      dvFilterFuture
    );

    if (!hasAnyPreference) {
      // Show modal for ContractFilterDlgComponent
      setTimeout(() => {
        const modalRef = this.modalService.open(ContractFilterDlgComponent, this.modalOptions);
        modalRef.result.then(() => {
          this.loadActiveContractIdsFromStoredFilters();
        }).catch(() => {});

      }, 0);
      return;
    }

    this.loadActiveContractIdsFromStoredFilters();
  }

  public loadActiveContractIdsFromStoredFilters(): void {
    const pastEvents = this.getLocalStorageFlagAsYN('dvFilterPast');
    const currentEvents = this.getLocalStorageFlagAsYN('dvFilterCurrent');
    const futureEvents = this.getLocalStorageFlagAsYN('dvFilterFuture');

    const uid = sessionStorage.getItem('individualUID') || '0';
    const pastMonthsBack = localStorage.getItem('pastMonthsBack') || '1';

    this.isLoading = true;
    this.sbmWebApiService
      .getActiveContractIds(pastEvents, currentEvents, futureEvents, pastMonthsBack, uid)
      .subscribe((data: VendorContractDataModel) => {
        this.contractData = data;
        //data.dataByExchange[0].contractsInExchange[0].appType = 1;
        this.isLoading = false;
      }, () => {
        this.isLoading = false;
      });
  }

  public get exchanges() {
    return this.contractData?.dataByExchange || [];
  }

  public formatContractDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  public onRefresh(): void {
    this.loadActiveContractIdsFromStoredFilters();
  }

  public onTimeframeChange(storageKey: 'dvFilterPast' | 'dvFilterCurrent' | 'dvFilterFuture', event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    localStorage.setItem(storageKey, JSON.stringify(checked));
  }

  public onMonthsBackChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    localStorage.setItem('pastMonthsBack', value);
  }

  public isFilterChecked(storageKey: 'dvFilterPast' | 'dvFilterCurrent' | 'dvFilterFuture'): boolean {
    return localStorage.getItem(storageKey) === 'true';
  }

  public getPastMonthsBack(): string {
    return localStorage.getItem('pastMonthsBack') || '1';
  }

  public openFilterDialog(): void {
    const modalRef = this.modalService.open(ContractFilterDlgComponent, this.modalOptions);
    modalRef.result.then(() => {
      this.loadActiveContractIdsFromStoredFilters();
    }).catch(() => {});
  }

  private getLocalStorageFlagAsYN(storageKey: 'dvFilterPast' | 'dvFilterCurrent' | 'dvFilterFuture'): 'Y' | 'N' {
    const value = localStorage.getItem(storageKey);
    return value === 'true' ? 'Y' : 'N';
  }

  public onAddLtcContract(): void {
    this.router.navigate(['sbm/ltcpage'], { queryParams: { cid: 0 } });
  }

  public onAddRovContract(): void {
    this.router.navigate(['sbm/rovpage'], { queryParams: { cid: 0 } });
  }

  public onListUserAuth(): void {
    this.emitLegacyAction('listUserAuth');
  }

  public onAddUserAuth(): void {
    this.emitLegacyAction('addUserAuth');
  }

  public onLogOut(): void {
    this.emitLegacyAction('logOut');
    sessionStorage.clear();
    this.router.navigate(['/sbm/logon']);
  }

  private emitLegacyAction(action: string): void {
    window.dispatchEvent(new CustomEvent('sbmAction', { detail: { action } }));
  }

  public navigateToPage(contract: any): void {
    const route = contract.appType === 1 ? 'sbm/rovpage' : 'sbm/ltcpage';
    this.router.navigate([route], { queryParams: { cid: contract.contractId } });
  }
}

