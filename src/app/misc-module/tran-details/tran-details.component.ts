import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LTC_TransactionDetails } from 'src/app/longterm/models/ticket.list';
import { PosApiService } from 'src/app/longterm/services/pos-api-service';
import { UtilService } from 'src/app/services/util.service';

@Component({
    selector: 'app-tran-details',
    templateUrl: './tran-details.component.html',
    styleUrls: ['./tran-details.component.css'],
    standalone: false
})
export class TranDetailsComponent implements OnInit {

  public readonly sortableColumns = {
    ticketNumber: 'Ticket Number',
    customerName: 'Customer Name',
    customerPhone: 'Customer Phone',
    ticketStatusDesc: 'Ticket Status',
    tranTotalAmount: 'Total Amount',
    dropOffDate: 'Tran Date'
  } as const;

  public activeSortColumn: keyof typeof this.sortableColumns | null = null;
  public sortDirection: 'asc' | 'desc' = 'asc';

  public custId: number = 0;
  public tranDtls: LTC_TransactionDetails[] = [];
  public currSymbl: string = '';

  constructor(private activatedRoute: ActivatedRoute,
    private _router: Router,
    private _logonDataSvc: LogonDataService,
    private _saleTranSvc: PosApiService,
  private _utilSvc: UtilService) { 

    }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: { [x: string]: number; }) => {

      this.custId = params['custid'];

      this._logonDataSvc.getLocationId();

      let indivId = this._logonDataSvc.getLocationConfig().individualUID;
       
      this.currSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getLocationConfig().defaultCurrency ?? '') ?? '';
      this._saleTranSvc.getTransactionDetails(indivId.toString(), 0, '', '', '', 
        this._logonDataSvc.getLocationConfig().contractUID,
        this._logonDataSvc.getLocationConfig().locationUID, 0, 0, '', 
        this.custId).subscribe(retVal => {
          this.tranDtls = retVal.data;
          this.applySort();
        })  
      })
  }

  sortBy(column: keyof typeof this.sortableColumns) {
    if (this.activeSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.activeSortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySort();
  }

  getSortIndicator(column: keyof typeof this.sortableColumns): string {
    if (this.activeSortColumn !== column) {
      return '';
    }

    return this.sortDirection === 'asc' ? '▲' : '▼';
  }

  private applySort() {
    if (!this.activeSortColumn || !this.tranDtls?.length) {
      return;
    }

    const column = this.activeSortColumn;
    const direction = this.sortDirection === 'asc' ? 1 : -1;

    this.tranDtls = [...this.tranDtls].sort((a, b) => {
      const left = this.getSortValue(a, column);
      const right = this.getSortValue(b, column);

      if (left < right) {
        return -1 * direction;
      }
      if (left > right) {
        return 1 * direction;
      }
      return 0;
    });
  }

  private getSortValue(
    tran: LTC_TransactionDetails,
    column: keyof typeof this.sortableColumns
  ): string | number {
    switch (column) {
      case 'ticketNumber':
      case 'tranTotalAmount':
        return Number(tran[column] ?? 0);
      case 'dropOffDate':
        return new Date(tran.dropOffDate as unknown as string).getTime() || 0;
      case 'customerName':
      case 'customerPhone':
      case 'ticketStatusDesc':
      default:
        return String(tran[column] ?? '').toLowerCase().trim();
    }
  }

  tranSelected(tranId: number) {
    this._router.navigateByUrl('/ltktrcpt?frmSalesTrnRpt=false&txnid=' + tranId);    
  }

  formatTranDateLocal(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatAmount(value: number | string | null | undefined): string {
    const amount = Number(value ?? 0);
    if (isNaN(amount)) {
      return '0.00';
    }

    return amount.toFixed(2);
  }
}
