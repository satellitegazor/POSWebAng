import { Injectable } from '@angular/core';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';

@Injectable({
  providedIn: 'root'
})
export class LogonDataService {

    private _ltvendorLogonData: VendorLoginResultsModel = {} as VendorLoginResultsModel;

    constructor() { }

    public setLTVendorLogonData(ltVendorLogonData: VendorLoginResultsModel): void {
        this._ltvendorLogonData = ltVendorLogonData;
    }

    public getLTVendorLogonData(): VendorLoginResultsModel {
        return this._ltvendorLogonData;
    }
}
