import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Dept } from '../models/sale.item';
import { SalesTranService } from '../services/sales-tran.service';
 
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
    activeId: number | null = null;
    public ngOnInit() {
        //console.log('DeptList ngOnInit');
        if (this.deptList.length > 0) {
            this.activeId = this.deptList[0].departmentUID;
        }
    }

    public deptClick(event: Event, deptId: number) {
        //this._saleTranSvc.getSalesCategoryList(deptId);
        this.activeId = deptId;
        this.deptClicked.emit(deptId);
    }
}
