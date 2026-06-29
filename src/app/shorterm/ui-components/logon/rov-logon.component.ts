import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RovApiService } from '../../short-term.service';
import { LocalStorageService } from '../../../global/local-storage.service';
import { ResetPinRequest, RLogonModel, ROV_AbbrEventModel, ROV_EventsResultModel } from '../../models/models';
import { ToastService } from '../../../services-misc/toast.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from '../../../global/global.constants';
import { RovLogonDataService } from '../../rov-logon-data.service';
import { ResetPinDlgComponent } from '../../../common-ui-components/reset-pin-dlg/reset-pin-dlg.component';
import { MandateTrainingComponent } from '../../../common-ui-components/mandate-training/mandate-training.component';
import { Router } from '@angular/router';
import { VendorLoginResultsModel } from '../../../models/vendor.login.results.model';
import { RovTktObjState } from "../../../app.state";
import { Store } from '@ngrx/store';
import { addTabSerialToRovTktObj, rovInitTktObj, loadRovTicket, loadRovTicketSuccess, updateRovCheckoutTotals } from '../../store/ticketstore/rticket.action';
import { CPOSWebSvcService } from '../../../services-pinpad/cposweb-svc.service';
import { ofType } from '@ngrx/effects';
import { ROVEventConfigState } from '../../store/roveventconfigstore/roveventconfig.state';
import { setEventConfig, updateEventConfigPostLogon } from '../../store/roveventconfigstore/roveventconfig.action';


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
  actions$: any;

  constructor(
    private _rovApiSvc: RovApiService,
    private _localStorageSvc: LocalStorageService,
    private _toastSvc: ToastService,
    private _modalService: NgbModal,
    private _rovLogonDataSvc: RovLogonDataService,
    private router: Router,
    private _tktObjStore: Store<RovTktObjState>,
    private _evtConfigStore: Store<ROVEventConfigState>,
    private _cposWebSvc: CPOSWebSvcService) { }

  ngOnInit() {

    this.exchangenum = this._localStorageSvc.getItemData('rov_contract_exchange_number');
    this.vendornum = this._localStorageSvc.getItemData('rov_contract_vendor_number');

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
          this.selectedEventId = +(ary.length > 0 ? ary[0].eventID : this.eventList[0].eventID);

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
    let eventSelected = this.eventList.filter(k => k.eventID == selectedEventId)[0];
    let rovModel = new RLogonModel();

    rovModel.exchangeNumber = eventSelected.exchangeNumber;
    ///rovModel.facilityNumber = eventSelected.eventName.toString();
    //rovModel.facilityName = eventSelected.eventName.toString();
    rovModel.vendorNumber = this.vendornum;
    rovModel.pIN = this.lpin;
    rovModel.eventID = +selectedEventId;
    rovModel.cliTimeVar = GlobalConstants.GetClientTimeVariance();
    rovModel.guid = GlobalConstants.POST_GUID;
    rovModel.contractType = true;
    rovModel.individualUID = 0;
    rovModel.loggingOut = false;
    rovModel.newPIN = "";
    rovModel.verifyPIN = "";
    rovModel.pageID = 0;
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

      this._localStorageSvc.setItemData("userType", "vendorst");

      let selectedEventId: number = this.selectedEventId;
      let eventSelected = this.eventList.filter(k => k.eventID == selectedEventId)[0];

      this._localStorageSvc.setItemData('event_id', this.selectedEventId.toString());
      this._localStorageSvc.setItemData('rov_contract_vendor_number', this.vendornum);
      this._localStorageSvc.setItemData('rov_contract_exchange_number', eventSelected.exchangeNumber);
      this._localStorageSvc.setItemData('event_facility_number', eventSelected.facilityNumber);
      this._localStorageSvc.setItemData('event_ddlContract_Type', true.toString());
      //this._localStorageSvc.setItemData('event_facility_name', eventSelected.facilityName);

      sessionStorage.setItem('event_id', this.selectedEventId.toString());
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
      this._localStorageSvc.setItemData('apptype', 'shortterm')
      //console.log('vendorlt sending data to subject');
      this._rovLogonDataSvc.setRovVendorLogonData(data);

      // Keep app header/login state in sync even when reset-PIN or training flows short-circuit.
      this._evtConfigStore.dispatch(updateEventConfigPostLogon({
          associateName: data.associateName,
          associateRole: data.associateRole,
          associateRoleDesc: data.associateRoleDesc,
          contractNumber: this.vendornum,
          contractUID: +data.contractUID,
          eventName: eventSelected.eventName,  
          facilityNumber: eventSelected.facilityNumber,
          vendorNumber: this.vendornum,
          vendorName: data.userIdentity.fullName,
          facilityName: ''
      }));



      rovModel.individualUID = +data.individualUID;

      if (data.resetPIN == 1) {
        const modalRef = this._modalService.open(ResetPinDlgComponent, { backdrop: 'static', keyboard: false, centered: true });
        modalRef.result.then((result) => {
          if (result && result.newPIN) {
            //console.log('vendorlt reset pin dialog closed with new pin');
            rovModel.newPIN = result.newPIN;
            rovModel.verifyPIN = result.newPIN;

            let resetPinRequest: ResetPinRequest = {
              eventID: +selectedEventId,
              uid: rovModel.individualUID.toString(),
              creds: rovModel.newPIN,
              veid: rovModel.vendorNumber,
              cliTimeVar: 0,
              indvID: +rovModel.individualUID
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
          rovModel.pageID = 2;
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

  initOnSuccessfulLogon(data: VendorLoginResultsModel, locModel: RLogonModel) {

    //this.router.navigate(['/rmainmenu']);
    this._rovApiSvc.GetEventConfig(data.eventId, data.individualUID.toString()).subscribe(evtConfigMdl => {

      this._rovLogonDataSvc.setRovEventConfig(evtConfigMdl?.config ?? null);
      let evConfig = this._rovLogonDataSvc.getRovEventConfig();
      this._tktObjStore.dispatch(rovInitTktObj({ eventConfig: evConfig, individualUID: +locModel.individualUID }));
      this._evtConfigStore.dispatch(setEventConfig({ eventConfig: evConfig }));

      this._rovApiSvc.getTenderTypes(+locModel.individualUID).subscribe(tenderTypes => {
        this._rovLogonDataSvc.setTenderTypes(tenderTypes);
      });

      let today = new Date();
      today.toDateString()
      this._rovApiSvc.getDailyExchRate(data.eventId, today.toDateString(), data.individualUID.toString()).subscribe(exchRateMdl => {
        this._rovLogonDataSvc.setDailyExchRate(exchRateMdl.data);
      });

      let inProgTranId = 0;
      if(evConfig.inProgTranId > 0) {

        this._toastSvc.info("An incomplete ticket has been found. Please complete it or void it!!");
        inProgTranId = evConfig.inProgTranId;
        this._tktObjStore.dispatch(loadRovTicket({ eventId: data.eventId, tranId: inProgTranId, indivId: +locModel.individualUID }));

        this.actions$.pipe(ofType(loadRovTicketSuccess)).subscribe(() => {
            setTimeout((logonDataSvc, tktObjStore, routr) => {
              routr.navigate(['rov/rchekout']);
              tktObjStore.dispatch(updateRovCheckoutTotals({ logonDataSvc: this._rovLogonDataSvc }))
            }, 800, this._rovLogonDataSvc, this._tktObjStore, this.router);
        });
      }
      else {

        locModel.privActConfmComplete = data.privActConfmComplete;
        this._rovLogonDataSvc.setRovEventConfig(evtConfigMdl?.config ?? null);
        this._evtConfigStore.dispatch(setEventConfig({ eventConfig: evtConfigMdl?.config ?? null }));
        this.router.navigate(['rov/rmainmenu']);        
        //this.router.navigate(["rov/ritembtnmenu"]);
      }

      this._cposWebSvc.pinpadHeartbeat("PING").subscribe(data => {
          if (data.IsSuccess) {
              this._tktObjStore.dispatch(addTabSerialToRovTktObj({ tabSerialNum: data.TabMachineName, ipAddress: data.IpAddress }));
          }
      });
    });
  }
}
