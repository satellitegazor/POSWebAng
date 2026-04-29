import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LogonDataService } from '../../global/logon-data-service.service';
import { GlobalConstants } from '../../global/global.constants';
import { LTC_TransactionDetails } from '../../longterm/models/ticket.list';
import { PinValidateComponent } from '../../longterm/pin-validate/pin-validate.component';
import { PosApiService } from '../../longterm/services/pos-api-service';
import { VendorLoginResultsModel } from '../../models/vendor.login.results.model';
import { UtilService } from '../../services/util.service';

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

  public searchText: string = '';
  public currentPage: number = 1;
  public readonly pageSize = 10;

  get filteredTranDtls(): LTC_TransactionDetails[] {
    if (!this.searchText.trim()) {
      return this.tranDtls;
    }
    const term = this.searchText.toLowerCase().trim();
    return this.tranDtls.filter(t =>
      String(t.ticketNumber ?? '').toLowerCase().includes(term) ||
      String(t.tenderType ?? '').toLowerCase().includes(term) ||
      String(t.customerName ?? '').toLowerCase().includes(term) ||
      String(t.customerPhone ?? '').toLowerCase().includes(term) ||
      String(t.ticketStatusDesc ?? '').toLowerCase().includes(term) ||
      String(t.rackLocationDesc ?? '').toLowerCase().includes(term)
    );
  }

  get pagedTranDtls(): LTC_TransactionDetails[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTranDtls.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTranDtls.length / this.pageSize);
  }

  get pageStart(): number {
    return this.filteredTranDtls.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredTranDtls.length);
  };

  constructor(private activatedRoute: ActivatedRoute,
    private _router: Router,
    private _logonDataSvc: LogonDataService,
    private _saleTranSvc: PosApiService,
    private _utilSvc: UtilService,
    private _modalService: NgbModal) {

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
    this.currentPage = 1;
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

  btnSalesTran(evt: Event): void {
    evt.preventDefault();
    this._logonDataSvc.setTranIsRefund(false);
    this.navigateToSalesTran(false);
  }

  btnRefundTran(evt: Event): void {
    evt.preventDefault();
    this._logonDataSvc.setTranIsRefund(true);
    this.navigateToSalesTran(true);
  }

  private navigateToSalesTran(isRefund: boolean): void {
    const locConfig = this._logonDataSvc.getLocationConfig();

    if (locConfig.pinReqdForSalesTran) {
      const modalRef = this._modalService.open(PinValidateComponent, { backdrop: 'static', keyboard: false });
      modalRef.result.then((loginResult?: VendorLoginResultsModel) => {
        if (loginResult?.isAuthorized) {
          if (isRefund) {
            this._router.navigate(['/salestran'], { queryParams: { isrefund: true } });
          } else {
            this._router.navigate(['/salestran']);
          }
        }
      }).catch(() => undefined);
    } else {
      if (isRefund) {
        this._router.navigate(['/salestran'], { queryParams: { isrefund: true } });
      } else {
        this._router.navigate(['/salestran']);
      }
    }
  }

  btnTicketLookup(evt: Event): void {
    evt.preventDefault();
    this._router.navigate(['/ticketlookup']);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  cancelTicket(transactionId: number): void {
    const config = this._logonDataSvc.getLocationConfig();
    const guid = GlobalConstants.PUT_GUID;
    const uid = config.individualUID?.toString() ?? '';
    this._saleTranSvc.cancelTicket(transactionId, uid).subscribe({
      next: () => {
      }
    });
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
