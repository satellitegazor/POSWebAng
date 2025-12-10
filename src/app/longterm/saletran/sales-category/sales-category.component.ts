import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
export class SalesCategoryComponent implements OnInit {

    constructor() { 
        this.activeId = 0;
    }
    @Input() saleCatList: SalesCat[] = [];
    @Input('') salesCatListRefreshEvent: Observable<boolean> = new Observable<boolean>();
    @Output() saleCatClicked: EventEmitter<number> = new EventEmitter();
    activeId: number = 0

    ngOnInit(): void {
        if(this.saleCatList.length > 0) {
            this.activeId = this.saleCatList[0].salesCategoryID;
        }

        this.salesCatListRefreshEvent.subscribe(data => {
            //console.log('subscription called salesCatListRefresh: ' + data);
            if(data) {
                this.activeId = this.saleCatList[0].salesCategoryID;
            }
        });
    }

    public salesCatgClick(event: Event, catgId: number): void {
        this.activeId = catgId;
        this.saleCatClicked.emit(catgId);
    }
}
