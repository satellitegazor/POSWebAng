import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContractTransactionDetail } from 'src/app/models/sales.tran.report.models';

type SortColumn =
  | 'ticketId'
  | 'date'
  | 'mdseSales'
  | 'tax'
  | 'envTax'
  | 'concessionDiscount'
  | 'exchangeCoupons'
  | 'tip'
  | 'total'
  | 'tender';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-sbm-sales-tran-rpt-detail',
  standalone: true,
  templateUrl: './sbm-sales-tran-rpt-detail.component.html',
  styleUrls: ['./sbm-sales-tran-rpt-detail.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SbmSalesTranRptDetailComponent implements OnInit {

  @Input() rptDetail: ContractTransactionDetail[] = [];
  @Input() categorizedBy: string = 'L';

  sortedRptDetail: ContractTransactionDetail[] = [];
  sortColumn: SortColumn = 'date';
  sortDirection: SortDirection = 'desc';

  constructor() { }

  ngOnInit(): void {
    this.applySort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rptDetail']) {
      this.applySort();
    }
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    }
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySort();
  }

  isSortedBy(column: SortColumn): boolean {
    return this.sortColumn === column;
  }

  getSortDirectionSymbol(column: SortColumn): string {
    if (!this.isSortedBy(column)) {
      return '';
    }

    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  getTotal(detail: ContractTransactionDetail): number {
    return (
      (detail.sales ?? 0) -
      (detail.salesTax ?? 0) -
      (detail.envTax ?? 0) -
      (detail.vendorCoupons ?? 0) -
      (detail.exchangeCoupons ?? 0)
    );
  }

  private applySort(): void {
    const items = [...(this.rptDetail || [])];
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      const valueA = this.getSortValue(a, this.sortColumn);
      const valueB = this.getSortValue(b, this.sortColumn);

      if (valueA < valueB) {
        return -1 * direction;
      }

      if (valueA > valueB) {
        return 1 * direction;
      }

      return 0;
    });

    this.sortedRptDetail = items;
  }

  private getSortValue(detail: ContractTransactionDetail, column: SortColumn): number | string {
    switch (column) {
      case 'ticketId':
        return Number(detail.ticketNumber ?? 0);
      case 'date':
        return new Date(detail.transactionDate ?? 0).getTime();
      case 'mdseSales':
        return Number(detail.sales ?? 0);
      case 'tax':
        return Number(detail.salesTax ?? 0);
      case 'envTax':
        return Number(detail.envTax ?? 0);
      case 'concessionDiscount':
        return Number(detail.vendorCoupons ?? 0);
      case 'exchangeCoupons':
        return Number(detail.exchangeCoupons ?? 0);
      case 'tip':
        return Number(detail.tipAmount ?? 0);
      case 'total':
        return this.getTotal(detail);
      case 'tender':
        return (detail.tenderTypeDescription ?? '').toLowerCase();
      default:
        return '';
    }
  }

}
