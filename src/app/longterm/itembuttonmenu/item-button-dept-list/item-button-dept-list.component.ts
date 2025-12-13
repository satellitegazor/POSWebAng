import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SalesTranService } from '../../saletran/services/sales-tran.service';
import { Dept } from '../../models/sale.item';

@Component({
  selector: 'app-item-button-dept-list',
  templateUrl: './item-button-dept-list.component.html',
  styleUrl: './item-button-dept-list.component.css',
  standalone: false
})
export class ItemButtonDeptListComponent {
isHovered: any;
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
  
  public updateDeptName(newName: string, _t6: Dept) {
    throw new Error('Method not implemented.');
  }

}
