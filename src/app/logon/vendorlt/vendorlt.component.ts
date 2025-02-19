import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from '../../global/global.constants';
import { LogonSvc } from '../logonsvc.service';
import { AbbrLocationsModel, VLogonModel } from '../models/vlogon.model';
import { Router } from "@angular/router";
import { LogonDataService } from '../../global/logon-data-service.service';
import { LocalStorageService } from '../../global/local-storage.service';
import { SalesTranService } from 'src/app/saletran/services/sales-tran.service';
import { AlertService } from 'src/app/alertmsg/alert-message/alert-message.service';
import { AlertOptions } from 'src/app/alertmsg/alert-message/alert-message.model';
 
@Component({
    selector: 'app-logon-vendorlt',
    templateUrl: './vendorlt.component.html',
    styleUrls: ['./vendorlt.component.css'],
    standalone: false
})
export class VendorLTComponent implements OnInit {

    exchangenum: string = '';
    vendornum: string = '';
    lpin: string = '';
    selectedLocationId = 0;
    isSelected: string = '';
    LocationList: AbbrLocationsModel[] = [];
    successMsgDisplay: string = 'none';
    errorMsgDisplay: string = 'none';
    

    constructor(private logonSvc: LogonSvc, 
        private router: Router,
        private _sharedSvc: LogonDataService, 
        private _localStorageSvc: LocalStorageService, 
        private _saleTranSvc: SalesTranService,
        private _alertSvc: AlertService ) { }
    cookieVal = '';
    ngOnInit() {

        this.exchangenum = this._localStorageSvc.getItemData('contract_exchange_number');
        this.vendornum = this._localStorageSvc.getItemData('contract_vendor_number');
        
        if (this.exchangenum != null && this.vendornum != null) {
            this.GetLocations();
        }
    }

    DoLogon(event: any) {
        let selectedLocId: number = this.selectedLocationId;
        let location = this.LocationList.filter(k => k.locationUID == selectedLocId)[0];
        let locModel = new VLogonModel();
        locModel.exchangeNumber = location.exchangeNumber;
        locModel.facilityNumber = location.locationUID.toString();
        locModel.facilityName = location.facilityName;
        locModel.vendorNumber = this.vendornum;
        locModel.pin = this.lpin;
        locModel.locationUID = +selectedLocId;
        locModel.cliTimeVar = GlobalConstants.GetClientTimeVariance();
        locModel.guid = GlobalConstants.POST_GUID;
        locModel.contractType = true;
        locModel.individualUID = 0;
        locModel.loggingOut = false;
        locModel.newPIN = "";
        locModel.verifyPIN = "";
        locModel.pageID = 0;
        locModel.privActConfmComplete = false;
        locModel.showPrivTrngConfrm = 0;
        locModel.regionId = "conus";

        this.logonSvc.logonUser(locModel).subscribe(data => {
            if(data == null) {
                return;
            }

            if (!data.results.success) {
                this.errorMsgDisplay = 'block';
                this.successMsgDisplay = 'none';
                let option: AlertOptions = new AlertOptions("", false, false);
                this._alertSvc.error('Vendor Logon unsuccessful', option);
                return; 
            }
            else {
                this.errorMsgDisplay = 'none';
                this.successMsgDisplay = 'block';
                let option: AlertOptions = new AlertOptions("", false, false);
                this._alertSvc.success('Vendor Logon successful, moving on to Sale Transaction...', option);
            }

            let selectedLocId: number = this.selectedLocationId;
            let location = this.LocationList.filter(k => k.locationUID == selectedLocId)[0];

            this._localStorageSvc.setItemData('contract_vendor_number', this.vendornum);
            this._localStorageSvc.setItemData('contract_exchange_number', location.exchangeNumber);
            this._localStorageSvc.setItemData('location_facility_number', location.facilityNumber);
            this._localStorageSvc.setItemData('location_ddlContract_Type', true.toString());
            this._localStorageSvc.setItemData('location_facility_name', location.facilityName);
 
            let cstart: Date = new Date(Date.parse(data.contractStart));
            let today: Date = new Date();
            this._localStorageSvc.setItemData('isFutureContract', (cstart > today ? true: false).toString());
            this._localStorageSvc.setItemData('jwtToken', data.tokenString);

            this._localStorageSvc.setItemData('apptype', 'longterm')

            

            console.log('vendorlt sending data to subject');
            this._sharedSvc.setLTVendorLogonData(data);



            this._saleTranSvc.getLocationConfig(+data.locationUID, +data.individualUID).subscribe(data => {

                this._sharedSvc.setLocationConfig(data);

                this._saleTranSvc.getTenderTypes(1, 100).subscribe(data => {
                    this._sharedSvc.setTenderTypes(data);
                });               
                console.log('vendorlt navigating to SalesCart');
                this.router.navigate(['/salestran']);    
            });

        });
    }

    OnChangeExchangeNum(event: any) {
        this.LocationList = [];
        this.vendornum = '';
    }

    OnChangeVendorNum(event: any) {
        this.LocationList = [];
        if (this.vendornum.length === 0) {
            return;
        }

        this.GetLocations();
    }

    private GetLocations() {

        this.logonSvc.GetLocations(this.vendornum).subscribe({
            next: data => {
                this.LocationList = data.locations.filter((fac: { exchangeNumber: string; }) => fac.exchangeNumber === this.exchangenum) 
                if (this.LocationList.length > 0) {
                    const ary = this.LocationList.filter((loc) => loc.facilityName == this._localStorageSvc.getItemData('location_facility_name'));
                    this.selectedLocationId = ary.length > 0 ? ary[0].locationUID : this.LocationList[0].locationUID;
                   
                } else {
                    alert('No locations found for given Vendor, Exchange Number.');
                }
            },
            error: err => {
                alert('No locations found for given Vendor, Exchange Number.');
                console.log(err);
            }
        })
    }

    onLocationChange(event: any, val: string) {
        this.selectedLocationId = +val;
    }
}
