import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { Rov_SalesTranCheckoutItem  } from "../../../../models/r-salestran-checkout-item"
import { Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
@Component({
    selector: 'app-rov-deptlist',
    templateUrl: './rov-deptlist.component.html',
    styleUrls: ['./rov-deptlist.component.css'],
    imports: [CommonModule, FormsModule]
})
export class RovDeptListComponent implements OnInit {

    constructor() { }
    @Input() deptList: Rov_SalesTranCheckoutItem[] = [];
    @Output() deptClicked: EventEmitter<number> = new EventEmitter<number>();
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
