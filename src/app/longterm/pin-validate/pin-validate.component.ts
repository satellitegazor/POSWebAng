import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from '../../global/logon-data-service.service';
import { PosApiService } from '../../longterm/services/pos-api-service';
import { LogonSvc } from '../../logon/logonsvc.service';
import { VLogonModel } from '../../logon/models/vlogon.model';
import { GlobalConstants } from '../../global/global.constants';
import { AlertOptions } from '../../alertmsg/alert-message/alert-message.model';
import { AlertService } from '../../alertmsg/alert-message/alert-message.service';
import { ToastService } from '../../services-misc/toast.service';
import { VendorLoginResultsModel } from '../../models/vendor.login.results.model';

@Component({
  selector: 'app-pin-validate',
  standalone: false,
  templateUrl: './pin-validate.component.html',
  styleUrls: ['./pin-validate.component.css']
})
export class PinValidateComponent implements OnInit {

  constructor(private modal: NgbModal, 
    public activeModal: NgbActiveModal,
    private _saleTranSvc: PosApiService, 
    private _logonSvc: LogonSvc, 
    private _logonDataSvc: LogonDataService,
    private router: Router, 
    private _toastSvc: ToastService,) { 

    }
    vpin: string = ''
    private _inputReady: boolean = false;

    ngOnInit(): void {
      setTimeout(() => { this._inputReady = true; }, 300);
    }

    pinKeyUp($event: KeyboardEvent) {
      if (!this._inputReady) { return; }
      if(this.vpin.length == 4) {
        this.ValidatePin(this.vpin);
      }
    }

    goToMainMenu(): void {
      this.activeModal.dismiss('main-menu');
      this.router.navigate(['/mainmenu']);
    }

    logout(): void {
      this.activeModal.dismiss('logout');
      this._logonDataSvc.clearTenderTypes();
      this.router.navigate(['/vlogon']);
    }

    ValidatePin(pin: string) {
      let logonMdl: VLogonModel = new VLogonModel();
      logonMdl.locationUID = this._logonDataSvc.getLocationConfig().locationUID
      logonMdl.pin = this.vpin;
      logonMdl.vendorNumber = this._logonDataSvc.getLocationConfig().vendorNumber
      logonMdl.exchangeNumber = this._logonDataSvc.getLocationConfig().facilityNumber.substring(0, 4);
      logonMdl.facilityNumber = this._logonDataSvc.getLocationConfig().facilityNumber;
      logonMdl.facilityName = this._logonDataSvc.getLocationConfig().facilityName;
      //logonMdl.individualUID = this._logonDataSvc.getLocationConfig().individualUID;
      logonMdl.guid = GlobalConstants.POST_GUID;
      logonMdl.cliTimeVar = GlobalConstants.GetClientTimeVariance();
      logonMdl.contractType = true;


      this._logonSvc.logonUser(logonMdl).subscribe(data => {
        // Handle the response data here
        if(data == null) {
          return;
        }

        if (data.isAuthorized == false) {
            this._toastSvc.error('Vendor Logon unsuccessful, please retry');
            this.vpin = '';
            return; 
        }
        else {
          this._toastSvc.success('Vendor Logon successful.');
          this.activeModal.close(data as VendorLoginResultsModel);
        }

      });

    }
}
