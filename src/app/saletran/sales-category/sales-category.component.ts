import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
//import { EventEmitter } from 'events';
import { SalesCat } from '../models/sale.item';
import { SalesTranService } from '../services/sales-tran.service';
 
@Component({
  selector: 'app-sales-category',
  templateUrl: './sales-category.component.html',
  styleUrls: ['./sales-category.component.css']
})
export class SalesCategoryComponent implements OnInit {

    constructor(private _salesTranSvc: SalesTranService) { }
    @Input() saleCatList: SalesCat[] = [];
    @Output() saleCatClicked: EventEmitter<number> = new EventEmitter();

    ngOnInit(): void {
        //this.salesCatList = this._salesTranSvc.getSalesCategoryList();
    }

    public salesCatgClick(event: Event, catgId: number): void {
        //this._salesTranSvc.getSaleItemList(catgId);
        this.saleCatClicked.emit(catgId);
    }
}
