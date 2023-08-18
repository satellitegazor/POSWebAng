import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { GlobalConstants } from '../../global/global.constants';
import { LogonSvc } from '../logonsvc.service';
import { AbbrLocationsModel, VLogonModel } from '../models/vlogon.model';
import { Router } from "@angular/router";
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { LogonDataService } from '../../global/logon-data-service.service';
import { LocalStorageService } from '../../global/local-storage.service';
import { Store } from '@ngrx/store';
import { getAuthLoginSelector } from 'src/app/authstate/auth.selector';
import { getLoginStart } from 'src/app/authstate/auth.action';
import { SalesTranService } from 'src/app/saletran/services/sales-tran.service';
 
@Component({
    selector: 'app-logon-vendorlt',
    templateUrl: './vendorlt.component.html',
    styleUrls: ['./vendorlt.component.css']
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
        private authSvc: AuthService, 
        private router: Router,
        private _sharedSvc: LogonDataService, 
        private _localStorageSvc: LocalStorageService, 
        private _saleTranSvc: SalesTranService,
        private _store: Store) { }
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

        //this._store.select(getAuthLoginSelector).subscribe(data => {
            
        this.logonSvc.logonUser(locModel).subscribe(data => {
            if(data == null) {
                return;
            }

            if (!data.results.success) {
                this.errorMsgDisplay = 'block';
                this.successMsgDisplay = 'none';
                return; 
            }
            else {
                this.errorMsgDisplay = 'none';
                this.successMsgDisplay = 'block';
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

        //this._store.dispatch(getLoginStart({logonMdl: locModel}));        
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
