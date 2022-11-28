import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

    constructor() { }

    //public saveLogonData(exchNum: string, vendorNum: string): void {
    //    localStorage.setItem('ExchNum', exchNum);
    //    localStorage.setItem('VendorNum', vendorNum);
    //}

    //public getLogonData(): string[] {

    //    let storedData: string[] = ['', ''];

    //    storedData[0] = localStorage.getItem('ExchNum');
    //    storedData[1] = localStorage.getItem('VendorNum');

    //    return storedData;
    //}

    //public clearLogonData(): void {
    //    localStorage.clear();
    //}

    public setItemData(key: string, val: string): void {
        localStorage.setItem(key, val);
    }

    public getItemData(key: string): string {
        var k = localStorage.getItem(key);
        return k == null ? '' : k;
    }

}
