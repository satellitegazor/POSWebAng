import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
//import { EventEmitter } from 'events';
import { SalesCat } from '../../models/sale.item';
import { SalesTranService } from '../services/sales-tran.service';
import { Observable, Subject } from 'rxjs';
 
@Component({
    selector: 'app-sales-category',
    templateUrl: './sales-category.component.html',
    styleUrls: ['./sales-category.component.css'],
    standalone: false
})
export class SalesCategoryComponent implements OnInit, OnChanges {

    constructor() { 
        this.activeId = 0;
    }
    @Input() saleCatList: SalesCat[] = [];
    @Input() salesCategoryListRefreshEvent: Observable<boolean> = new Observable<boolean>();
    @Output() saleCatClicked: EventEmitter<number> = new EventEmitter();
    activeId: number = 0

    ngOnInit(): void {
        if(this.saleCatList.length > 0) {
            this.activeId = this.saleCatList[0].salesCategoryUID;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['saleCatList'] && !changes['saleCatList'].firstChange) {
            // saleCatList was updated from parent
            if (this.saleCatList.length > 0) {
                this.activeId = this.saleCatList[0].salesCategoryUID;
            }
        }
    }

    public salesCatgClick(event: Event, catgId: number): void {
        this.activeId = catgId;
        this.saleCatClicked.emit(catgId);
    }
}
