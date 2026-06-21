import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
//import { EventEmitter } from 'events';
import { SalesCat } from '../../../models/sale.item';
//import { PosApiService } from '../../../services/pos-api-service';
import { RovApiService } from '../../../../short-term.service';
import { Observable, Subject } from 'rxjs';
 
@Component({
    selector: 'app-rov-sales-category',
    templateUrl: './rov-sales-category.component.html',
    styleUrls: ['./rov-sales-category.component.css'],
    standalone: false
})
export class RovSalesCategoryComponent implements OnInit, OnChanges {

    constructor() { 
        this.activeId = 0;
    }
    @Input() saleCatList: SalesCat[] = [];
    @Input() salesCategoryListRefreshEvent: Observable<boolean> = new Observable<boolean>();
    @Output() saleCatClicked: EventEmitter<number> = new EventEmitter();
    activeId: number = 0

    private setActiveId(catgId: number): void {
        this.activeId = catgId;
        this.saleCatClicked.emit(catgId);
    }

    ngOnInit(): void {
        if(this.saleCatList.length > 0) {
            this.setActiveId(this.saleCatList[0].salesCategoryUID);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['saleCatList'] && !changes['saleCatList'].firstChange) {
            // saleCatList was updated from parent
            if (this.saleCatList.length > 0) {
                this.setActiveId(this.saleCatList[0].salesCategoryUID);
            }
        }
    }

    public salesCatgClick(event: Event, catgId: number): void {
        this.setActiveId(catgId);
    }
}
