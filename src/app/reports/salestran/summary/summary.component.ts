import { Component, OnInit } from '@angular/core';
import { ContractSummaryGrouped } from 'src/app/models/sales.tran.report.models';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.css'],
    standalone: false
})
export class SummaryComponent implements OnInit {

  constructor() { }
  summaryList: ContractSummaryGrouped[] = [];
  
  ngOnInit(): void {
    
  }  

}
