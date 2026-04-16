import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PinValidateComponent } from '../../saletran/pin-validate/pin-validate.component';
import { VendorLoginResultsModel } from 'src/app/models/vendor.login.results.model';
import { ToastService } from 'src/app/services/toast.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LocalStorageService } from 'src/app/global/local-storage.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css',
  standalone: false
})
export class MainMenuComponent {
  private readonly pinModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

goToTicketLookUp() {
  this.router.navigate(['/ticketlookup']);
}
goToNoSaleReport() {
  this.openPinValidate(() => this.router.navigate(['/nosalereport']));
}
goToEnterSalesTransRefund() {
  this.openPinValidate(() => this.router.navigate(['/refundtran']));
}
goToTicketStatus() {
  this.router.navigate(['/ticketstatus']);
}
goToEndOfDayReport() {
  this.openPinValidate(() => this.router.navigate(['/rptnosale']));
}
goToAdminMenu() {
  this.openPinValidate((loginResult) => {
    if (this.isManagerUser(loginResult)) {
      this.router.navigate(['/adminmenu']);
      return;
    }

    this._toastSvc.error('Only manager users can access Admin Menu.');
  });
}
  constructor(
    private router: Router,
    private _modalService: NgbModal,
    private _toastSvc: ToastService,
    private _logonDataSvc: LogonDataService,
    private _localStorageSvc: LocalStorageService, 
  ) {}

  goToSalesTransaction(): void {
    this.openPinValidate(() => this.router.navigate(['/salestran']));
  }

  goToReports(): void {
    this.openPinValidate(() => this.router.navigate(['/reportsmenu']));
  }

  private openPinValidate(onAuthorized: (loginResult: VendorLoginResultsModel) => void): void {
    const modalRef = this._modalService.open(PinValidateComponent, this.pinModalOptions);
    modalRef.result.then((loginResult?: VendorLoginResultsModel) => {
      if (loginResult?.isAuthorized) {

        sessionStorage.setItem("vendorName", loginResult.userIdentity.fullName);
        sessionStorage.setItem("loggedInUserName", loginResult.associateName);
        sessionStorage.setItem("loggedInUserRole", loginResult.associateRoleDesc);
        this._localStorageSvc.setItemData('jwtToken', loginResult.tokenString);
        this._logonDataSvc.setLTVendorLogonData(loginResult);

        onAuthorized(loginResult);
      }
    }).catch(() => undefined);
  }

  private isManagerUser(loginResult: VendorLoginResultsModel): boolean {
    const roleCode = (loginResult.associateRole || '').toUpperCase();
    const roleDesc = (loginResult.associateRoleDesc || '').toUpperCase();
    return roleCode === 'RLTYP_CONC_MNGR'
      || roleCode.includes('MNGR')
      || roleDesc.includes('MANAGER')
      || roleDesc.includes('MNGR');
  }
}
