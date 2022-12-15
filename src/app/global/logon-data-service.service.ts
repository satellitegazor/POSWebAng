import { Injectable } from '@angular/core';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';
import { LocationConfigModel } from '../saletran/models/location-config';

@Injectable({
  providedIn: 'root'
})
export class LogonDataService {

    private _ltvendorLogonData: VendorLoginResultsModel = {} as VendorLoginResultsModel;
    private _ltLocationConfig: LocationConfigModel = {} as LocationConfigModel;

    constructor() { }

    public setLTVendorLogonData(ltVendorLogonData: VendorLoginResultsModel): void {
        this._ltvendorLogonData = ltVendorLogonData;
    }

    public getLTVendorLogonData(): VendorLoginResultsModel {
        return this._ltvendorLogonData;
    }

    public setLocationConfig(locConfig: LocationConfigModel) {
        this._ltLocationConfig = locConfig;
    }

    public getLocationConfig() {
        return this._ltLocationConfig;
    }
}
