import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ROV_SalesTranRptDetail } from '../../../../models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    selector: 'app-rov-sales-tran-rpt-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.css'],
    imports: [CommonModule, FormsModule]
})
export class RovSalesTranRptDetailComponent implements OnInit {

  @Input() rptDetail: ROV_SalesTranRptDetail[] = [];
  @Input() categorizedBy: string = 'L';

  sortedRptDetail: ROV_SalesTranRptDetail[] = [];
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

  getTotal(detail: ROV_SalesTranRptDetail): number {
    return (
      (detail.sales ?? 0) -
      (detail.salesTax ?? 0) -
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

  private getSortValue(detail: ROV_SalesTranRptDetail, column: SortColumn): number | string {
    switch (column) {
      case 'ticketId':
        return Number(detail.ticketNumber ?? 0);
      case 'date':
        return new Date(detail.transactionDate ?? 0).getTime();
      case 'mdseSales':
        return Number(detail.sales ?? 0);
      case 'tax':
        return Number(detail.salesTax ?? 0);
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
