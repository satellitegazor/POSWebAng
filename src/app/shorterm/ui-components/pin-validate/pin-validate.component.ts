import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PosApiService } from '../../../longterm/services/pos-api-service';
import { LogonSvc } from '../../../logon/logonsvc.service';
import { GlobalConstants } from '../../../global/global.constants';
import { AlertOptions } from '../../../alertmsg/alert-message/alert-message.model';
import { AlertService } from '../../../alertmsg/alert-message/alert-message.service';
import { ToastService } from '../../../services-misc/toast.service';
import { VendorLoginResultsModel } from '../../../models/vendor.login.results.model';
import { RovLogonDataService } from '../../rov-logon-data.service';
import { RLogonModel } from '../../models/models';
import { RovApiService } from '../../short-term.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pin-validate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pin-validate.component.html',
  styleUrls: ['./pin-validate.component.css']
})
export class PinValidateComponent implements OnInit {

  constructor(private modal: NgbModal, 
    public activeModal: NgbActiveModal,
    private _saleTranSvc: PosApiService, 
    private _rovApiSvc: RovApiService, 
    private _logonDataSvc: RovLogonDataService,
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
      this.router.navigate(['/rmainmenu']);
    }

    logout(): void {
      this.activeModal.dismiss('logout');
      this._logonDataSvc.clearTenderTypes();
      this.router.navigate(['/rov/rlogon']);
    }

    ValidatePin(pin: string) {
      let logonMdl: RLogonModel = new RLogonModel();
      logonMdl.eventID = sessionStorage.getItem('event_id') ? +sessionStorage.getItem('event_id')! : 0;
      logonMdl.pIN = this.vpin;
      logonMdl.vendorNumber = sessionStorage.getItem('vendorNumber') ? sessionStorage.getItem('vendorNumber')! : '';
      logonMdl.exchangeNumber = sessionStorage.getItem('facilityNumber') ? sessionStorage.getItem('facilityNumber')!.substring(0, 4) : '';
      //logonMdl.individualUID = this._logonDataSvc.getLocationConfig().individualUID;
      logonMdl.guid = GlobalConstants.POST_GUID;
      logonMdl.cliTimeVar = GlobalConstants.GetClientTimeVariance();
      logonMdl.contractType = true;


      this._rovApiSvc.logonUser(logonMdl).subscribe(data => {
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
