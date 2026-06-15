import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RovApiService } from '../../short-term.service';
import { LocalStorageService } from 'src/app/global/local-storage.service';
import { ResetPinRequest, RLogonModel, ROV_AbbrEventModel, ROV_EventsResultModel } from '../../models/models';
import { ToastService } from '../../../services/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../../global/global.constants';
import { RovLogonDataService } from '../../rov-logon-data.service';
import { ResetPinDlgComponent } from '../../../common-ui-components/reset-pin-dlg/reset-pin-dlg.component';
import { MandateTrainingComponent } from '../../../common-ui-components/mandate-training/mandate-training.component';
import { Router } from '@angular/router';
import { VendorLoginResultsModel } from 'src/app/models/vendor.login.results.model';


@Component({
  selector: 'app-rov-logon',
  imports: [CommonModule, FormsModule],
  templateUrl: './rov-logon.component.html',
  styleUrls: ['./rov-logon.component.css']
})
export class RovLogonComponent implements OnInit {

  eventList: ROV_AbbrEventModel[] = [];
  exchangenum: string = '';
  vendornum: string = '';
  selectedEventId: number = 0;
  lpin: string = '';

  constructor(
    private _rovApiSvc: RovApiService,
    private _localStorageSvc: LocalStorageService,
    private _toastSvc: ToastService,
    private _modalService: NgbModal,
    private _rovLogonDataSvc: RovLogonDataService,
    private router: Router) { }

  ngOnInit() {

    this.exchangenum = this._localStorageSvc.getItemData('contract_exchange_number');
    this.vendornum = this._localStorageSvc.getItemData('contract_vendor_number');

    if (this.exchangenum != null && this.vendornum != null) {
      this.GetEvents();
    }
  }

  private GetEvents() {

    this._rovApiSvc.getVendorFacEvents(this.vendornum, this.exchangenum).subscribe({
      
      next: (data: ROV_EventsResultModel) => {

        this.eventList = data.events.filter((fac: { exchangeNumber: string; }) => fac.exchangeNumber === this.exchangenum);

        if (this.eventList.length > 0) {
          const ary = this.eventList.filter((loc) => loc.eventName == this._localStorageSvc.getItemData('event_name'));
          this.selectedEventId = +(ary.length > 0 ? ary[0].eventId : this.eventList[0].eventId);

        } else {
          this._toastSvc.error('No events found for given Vendor, Exchange Number.');
        }
      },
      error: err => {
        this._toastSvc.error('No events found for given Vendor, Exchange Number.');
      }
    })
  }

  onEventChange($event: Event, val: string) {
    this.selectedEventId = +val;
  }

  OnChangeVendorNum($event: Event) {
    this.eventList = [];
    if (this.vendornum.length === 0) {
      return;
    }
    this.GetEvents();
  }

  OnChangeExchangeNum($event: Event) {
    this.eventList = [];
    this.vendornum = '';
  }


  DoLogon(event: any) {

    let selectedEventId: number = this.selectedEventId;
    let eventSelected = this.eventList.filter(k => k.eventId == selectedEventId)[0];
    let rovModel = new RLogonModel();

    rovModel.exchangeNumber = eventSelected.exchangeNumber;
    ///rovModel.facilityNumber = eventSelected.eventName.toString();
    //rovModel.facilityName = eventSelected.eventName.toString();
    rovModel.vendorNumber = this.vendornum;
    rovModel.pin = this.lpin;
    rovModel.eventId = +selectedEventId;
    rovModel.cliTimeVar = GlobalConstants.GetClientTimeVariance();
    rovModel.guid = GlobalConstants.POST_GUID;
    rovModel.contractType = true;
    rovModel.individualUid = 0;
    rovModel.loggingOut = false;
    rovModel.newPin = "";
    rovModel.verifyPin = "";
    rovModel.pageId = 0;
    //rovModel.privActConfmComplete = false;
    rovModel.showPrivTrngConfrm = 0;
    rovModel.regionId = "conus";

    this._rovApiSvc.logonUser(rovModel).subscribe(data => {

      if (data == null) {
        return;
      }

      let inProgTranId = 0;

      if (!data.results.success) {
        // this.errorMsgDisplay = 'block';
        // this.successMsgDisplay = 'none';
        this._toastSvc.error('Vendor Logon unsuccessful');
        return;
      }
      else {
        // this.errorMsgDisplay = 'none';
        // this.successMsgDisplay = 'block';
        this._toastSvc.success('Vendor Logon successful, moving on to Sale Transaction...');
      }

      sessionStorage.setItem("userType", "vendorlt");

      let selectedEventId: number = this.selectedEventId;
      let eventSelected = this.eventList.filter(k => k.eventId == selectedEventId)[0];

      this._localStorageSvc.setItemData('contract_vendor_number', this.vendornum);
      this._localStorageSvc.setItemData('contract_exchange_number', eventSelected.exchangeNumber);
      this._localStorageSvc.setItemData('event_facility_number', eventSelected.facilityNumber);
      this._localStorageSvc.setItemData('event_ddlContract_Type', true.toString());
      //this._localStorageSvc.setItemData('event_facility_name', eventSelected.facilityName);

      sessionStorage.setItem('vendorNumber', this.vendornum);
      sessionStorage.setItem('facilityNumber', eventSelected.facilityNumber);
      sessionStorage.setItem("vendorName", data.userIdentity.fullName);
      sessionStorage.setItem("loggedInUserName", data.associateName);
      sessionStorage.setItem("loggedInUserRole", data.associateRoleDesc);
      //sessionStorage.setItem("eventName", eventSelected.facilityName);

      let cstart: Date = new Date(Date.parse(data.contractStart));
      let today: Date = new Date();
      this._localStorageSvc.setItemData('isFutureContract', (cstart > today ? true : false).toString());
      this._localStorageSvc.setItemData('jwtToken', data.tokenString);
      this._localStorageSvc.setItemData('apptype', 'longterm')
      //console.log('vendorlt sending data to subject');
      this._rovLogonDataSvc.setLTVendorLogonData(data);

      // Keep app header/login state in sync even when reset-PIN or training flows short-circuit.
      // this._locConfigStore.dispatch(updateLocationConfigPostLogon({
      //     associateName: data.associateName,
      //     associateRole: data.associateRole,
      //     associateRoleDesc: data.associateRoleDesc,
      //     contractNumber: this.vendornum,
      //     contractUID: +data.contractUID,
      //     facilityName: location.facilityName,
      //     locationName: location.facilityName,
      //     facilityNumber: location.facilityNumber,
      //     vendorNumber: this.vendornum,
      //     vendorName: data.userIdentity.fullName
      // }));



      rovModel.individualUid = +data.individualUID;

      if (data.resetPIN == 1) {
        const modalRef = this._modalService.open(ResetPinDlgComponent, { backdrop: 'static', keyboard: false, centered: true });
        modalRef.result.then((result) => {
          if (result && result.newPin) {
            //console.log('vendorlt reset pin dialog closed with new pin');
            rovModel.newPin = result.newPin;
            rovModel.verifyPin = result.newPin;

            let resetPinRequest: ResetPinRequest = {
              eventID: +selectedEventId,
              uid: rovModel.individualUid.toString(),
              creds: rovModel.newPin,
              veid: rovModel.vendorNumber,
              cliTimeVar: 0,
              indvID: +rovModel.individualUid
            };

            setTimeout(() => {
              this._rovApiSvc.resetRovAssociatePin(resetPinRequest).subscribe(pinData => {
                //console.log('vendorlt navigating to SalesCart');

                this.router.navigate([inProgTranId > 0 ? '/checkout' : '/salestran']);
              });
            }, 500);
          }
        }, (reason) => {
          //console.log('vendorlt reset pin dialog dismissed');
        });
        return;
      }
      if (data.resetPIN == 0 && data.showPrivTrngConfrm > 0) {
        const modalRef = this._modalService.open(MandateTrainingComponent, { backdrop: 'static', keyboard: false, centered: true, size: 'lg' });
        modalRef.componentInstance.vendorName = data.associateName;
        modalRef.componentInstance.businessDate = new Date;
        modalRef.result.then((result: any) => {
          rovModel.pageId = 2;
          rovModel.privActConfmComplete = true;
          this._rovApiSvc.logonUser(rovModel).subscribe(() => {
            //this.router.navigate([inProgTranId > 0 ? '/checkout' : '/salestran']);
            this.router.navigate(['/rmainmenu']);
          });
          this.initOnSuccessfulLogon(data, rovModel);
          //console.log('vendorlt mandate training dialog closed');
        }, (reason: any) => {
          //console.log('vendorlt mandate training dialog dismissed');
        });
        return;
      }

      this.initOnSuccessfulLogon(data, rovModel);
    });
  }

  initOnSuccessfulLogon(data: VendorLoginResultsModel, locModel: RLogonModel) { }

}
