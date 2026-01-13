import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Dept } from '../../models/sale.item';
import { SalesTranService } from '../services/sales-tran.service';
import { Subject } from 'rxjs';
 
@Component({
    selector: 'app-deptlist',
    templateUrl: './deptlist.component.html',
    styleUrls: ['./deptlist.component.css'],
    standalone: false
})
export class DeptListComponent implements OnInit {

    constructor(private _saleTranSvc: SalesTranService) { }
    @Input() deptList: Dept[] = [];
    @Output() deptClicked: EventEmitter<number> = new EventEmitter();
    @Input() deptListRefreshEvent: Subject<boolean> = new Subject<boolean>();
    activeId: number = 0;
    public ngOnInit() {
        //console.log('DeptList ngOnInit');
        this.deptListRefreshEvent.subscribe(data => {
            if (data && this.deptList.length > 0) {
                this.activeId = this.deptList[0].departmentUID;
            }
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['deptList'] && this.deptList.length > 0) {
            this.activeId = this.activeId > 0 && this.deptList.some(dpt => dpt.departmentUID === this.activeId) ? this.activeId : this.deptList[0].departmentUID;
            this.deptClicked.emit(this.activeId);
        }
    }

    public deptClick(event: Event, deptId: number) {
        //this._saleTranSvc.getSalesCategoryList(deptId);
        this.activeId = deptId;
        this.deptClicked.emit(deptId);
    }
}
