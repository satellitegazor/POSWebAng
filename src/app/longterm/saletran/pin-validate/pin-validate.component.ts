import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SalesTranService } from 'src/app/longterm/saletran/services/sales-tran.service';
import { LogonSvc } from '../../../logon/logonsvc.service';
import { VLogonModel } from '../../../logon/models/vlogon.model';
import { GlobalConstants } from 'src/app/global/global.constants';
import { AlertOptions } from 'src/app/alertmsg/alert-message/alert-message.model';
import { AlertService } from 'src/app/alertmsg/alert-message/alert-message.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-pin-validate',
  standalone: false,
  templateUrl: './pin-validate.component.html',
  styleUrl: './pin-validate.component.css'
})
export class PinValidateComponent implements OnInit {

  constructor(private modal: NgbModal, 
    private _saleTranSvc: SalesTranService, 
    private _logonSvc: LogonSvc, 
    private _logonDataSvc: LogonDataService,
    private router: Router, 
    private _toastSvc: ToastService,) { 

    }
    vpin: string = ''

    ngOnInit(): void {

    }

    pinKeyUp($event: KeyboardEvent) {
      if(this.vpin.length == 4) {
        this.ValidatePin(this.vpin);
      }
    }

    goToMainMenu(): void {
      this.modal.dismissAll();
      this.router.navigate(['/adminmenu']);
    }

    logout(): void {
      this.modal.dismissAll();
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
      logonMdl.individualUID = this._logonDataSvc.getLocationConfig().individualUID;
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
            this._toastSvc.success('Vendor Logon successful, moving on to Sale Transaction...');
            this.router.navigate(['/salestran']);    
        }

      });

    }
}
