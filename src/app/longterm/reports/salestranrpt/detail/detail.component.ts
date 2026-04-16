import { Component, Input, OnInit } from '@angular/core';
import { ContractTransactionDetail } from 'src/app/models/saletran.report.model';

@Component({
    selector: 'app-sales-tran-rpt-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css'],
    standalone: false
})
export class SalesTranRptDetailComponent implements OnInit {

  @Input() rptDetail: ContractTransactionDetail[] = [];
  @Input() categorizedBy: string = 'L';

  constructor() { }

  ngOnInit(): void {
  }

}
