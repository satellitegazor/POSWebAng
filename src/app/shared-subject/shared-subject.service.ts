﻿import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { VendorLoginResultsModel } from '../models/vendor.login.results.model';
import { SaleItem } from '../saletran/models/sale.item';

@Injectable()
export class SharedSubjectService {
    //SharingData: BehaviorSubject<any> = new BehaviorSubject<any>();
    LogonDetails: BehaviorSubject<any> = new BehaviorSubject<any>(new VendorLoginResultsModel());
    SaleItem: Subject<SaleItem> = new Subject<SaleItem>();
    TktSaleItems: Subject<any> = new Subject<any>();
    constructor() { }

}