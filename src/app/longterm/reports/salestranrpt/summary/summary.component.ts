import { Component, OnInit } from '@angular/core';
import { ContractSummaryGrouped } from 'src/app/models/sales.tran.report.models';

@Component({
    selector: 'app-sales-tran-rpt-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css'],
    standalone: false
})
export class SalesTranRptSummaryComponent implements OnInit {
CategorizedBy: any;

  constructor() { }
  summaryList: ContractSummaryGrouped[] = [];
  
  ngOnInit(): void {
    
  }  

}
