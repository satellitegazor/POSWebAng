import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { SharedSubjectService } from '../../shared-subject/shared-subject.service';
import { SaleItem } from '../models/sale.item';

 
@Component({
  selector: 'app-sale-item',
  templateUrl: './sale-item.component.html',
  styleUrls: ['./sale-item.component.css']
})
export class SaleItemComponent implements OnInit {

    constructor(private _sharedSvc: SharedSubjectService) { }
    @Input() saleItemList: SaleItem[] = [];

    ngOnInit(): void {
    }
    
    public salesItemClick(event: Event, itemId: number): void {
        this._sharedSvc.SaleItem.next(this.saleItemList.filter(itm => itm.salesItemID == itemId)[0]);
    }
}
