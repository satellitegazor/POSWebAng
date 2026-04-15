import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocationConfigState } from '../../../saletran/store/locationconfigstore/locationconfig.state';
import { SalesTranRptDetailComponent } from '../detail/detail.component';
import { SalesTranRptSummaryComponent } from '../summary/summary.component';
import { getLocationConfigSelector } from 'src/app/longterm/saletran/store/locationconfigstore/locationconfig.selector';
import { filter, switchMap, take } from 'rxjs';
import { SalesTranService } from 'src/app/longterm/saletran/services/sales-tran.service';
import { ContractSummaryGrouped, ContractTransactionDetail, SalesTranRptSummaryByFacility, VendorContractSummaryResultsModel } from 'src/app/models/saletran.report.model';
import { LogonDataService } from 'src/app/global/logon-data-service.service';

@Component({
  selector: 'app-sales-tran-rpt-page',
  standalone: false,  templateUrl: './sales-tran-rpt-page.component.html',
  styleUrls: ['./sales-tran-rpt-page.component.css']
})
export class SalesTranRptPageComponent implements OnInit {

  locationId: number = 0;
  contractId: number = 0;
  facilityNumber: string = '';
  fromDate: string = '';
  toDate: string = '';
  uid: string = '';
  vendorName: string = '';
  vendorNumber: string = '';
  locationName: string = '';
  contractNumber: string = '';
  associateName: string = '';

  rptSummary: ContractSummaryGrouped[] = [];
  rptDetail: ContractTransactionDetail[] = [];
  
  summaryBy: 'F' | 'L' | 'A' = 'A';
  transType: 'A' | 'S' | 'R' = 'A';
  categorizedByCode: 'F' | 'L' | 'A' = 'L';  rptSummaryByFacility: SalesTranRptSummaryByFacility[] = [];
  readonly transTypeLabels: Record<'A' | 'S' | 'R', string> = {
    A: 'All Transactions',
    S: 'Sale Only',
    R: 'Refund Only'
  };
  CategorizedBy: string = '';
  saleTranReportData: VendorContractSummaryResultsModel = {} as VendorContractSummaryResultsModel;

  get transTypeLabel(): string {
    return this.transTypeLabels[this.transType];
  }

  constructor(private locationConfigStore: Store<LocationConfigState>, 
    private salesTranSvc: SalesTranService,
    private _logonDataSvc: LogonDataService) {
  }

  public ngOnInit(): void {
    this.initializeDateRange();
    this.updateCategorizedBy('L');

    this.locationConfigStore.select(getLocationConfigSelector).pipe(
      filter(cfg => cfg != null),          // skip until store is populated
      take(1),                             // complete after first valid emission
      switchMap(cfg => {
        this.locationId = cfg!.locationUID || 0;
        this.contractId = cfg!.contractUID || 0;
        this.facilityNumber = cfg!.facilityNumber || '';
        this.uid = String(cfg!.individualUID || '');
        this.vendorName = cfg!.vendorName || '';
        this.vendorNumber = cfg!.vendorNumber || '';
        this.locationName = cfg!.locationName || '';
        this.contractNumber = cfg!.contractNumber || '';
        this.associateName = cfg!.associateName || '';
        this.updateCategorizedBy(this.summaryBy);

        return this.salesTranSvc.getSaleTranReport(
          this.contractId,
          this.locationId,
          cfg!.individualUID || 0,
          this.facilityNumber,
          this.fromDate,
          this.toDate,
          this.uid,
          0   // DBVal — set as needed
        );
      })
    ).subscribe(reportObj => {

      this.saleTranReportData = reportObj;
      this.onTransTypeChange('A');
    });


  }

  private RenderSummaryReport(): void {
    // handle report result

    if (this.summaryBy === 'F') {
      this.groupByFacility();
    }

    let totalSales = this.rptSummary.reduce((acc, curr) => acc + curr.sales, 0);
    this.rptSummary.forEach(summary => {
      summary.pct = totalSales > 0 ? (summary.sales / totalSales) * 100 : 0;
    });


  }

  private initializeDateRange(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    this.fromDate = this.formatDate(firstDay);

    const lastDay = new Date(year, month + 1, 0);
    this.toDate = this.formatDate(lastDay);
  }

  openNativeDatePicker(input: HTMLInputElement): void {
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };
    if (pickerInput.showPicker) {
      pickerInput.showPicker();
      return;
    }
    input.focus();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSummaryByChange(value: 'F' | 'L' | 'A'): void {
    if (this.summaryBy === value) return;
    this.summaryBy = value;
    this.updateCategorizedBy(value);

    // TODO: reload report data filtered by summaryBy
  }

  private updateCategorizedBy(value: 'F' | 'L' | 'A'): void {
    this.categorizedByCode = value;

    switch (value) {
      case 'F':
        this.CategorizedBy = this.facilityNumber;
        break;
      case 'L':
        this.CategorizedBy = this.locationName + "-" + this.facilityNumber;
        break;
      case 'A':
        this.CategorizedBy = this.associateName;
        break;
    }
  }

  onTransTypeChange(value: 'A' | 'S' | 'R'): void {
    this.transType = value;

    if (!this.saleTranReportData?.summary) {
      return;
    }

    //Filter data based on Sale or Refund transactions
    if (this.transType === 'A') {
      this.rptSummary = this.saleTranReportData.summary.heading;
      this.rptDetail = this.saleTranReportData.summary.details;
    } else {
      const isRefund = this.transType === 'R';
      let tenderTypes = this._logonDataSvc.getTenderTypes().types.filter(t => t.isRefundType === isRefund);
      this.rptSummary = this.saleTranReportData.summary.heading.filter(summary => tenderTypes.some(t => t.tenderTypeCode === summary.tenderTypeCode));
      this.rptDetail = this.saleTranReportData.summary.details.filter(detail => tenderTypes.some(t => t.tenderTypeCode === detail.tenderTypeCode));
    }
    this.RenderSummaryReport();
  }

  private groupByFacility(): void {
    
    const grouped = new Map<string, { nbrTrans: number; nbrTenders: number; totalSales: number }>();

    // Group and sum by facility
    this.rptSummary.forEach(summary => {
      const key = summary.facilityNumber;
      if (!grouped.has(key)) {
        grouped.set(key, { nbrTrans: 0, nbrTenders: 0, totalSales: 0 });
      }
      const group = grouped.get(key)!;
      group.nbrTrans += summary.nbrTrans;
      group.nbrTenders += summary.nbrTender;
      group.totalSales += summary.sales;
    });

    // Calculate total sales for percentage
    const totalSales = Array.from(grouped.values()).reduce((acc, curr) => acc + curr.totalSales, 0);

    // Convert to array of SalesTranRptSummaryByFacility
    this.rptSummaryByFacility = Array.from(grouped.entries()).map(([facilityNumber, data]) => {
      const item = new SalesTranRptSummaryByFacility();
      item.facilityNumber = facilityNumber;
      item.nbrTrans = data.nbrTrans;
      item.nbrTenders = data.nbrTenders;
      item.totalSales = data.totalSales;
      item.pct = totalSales > 0 ? (data.totalSales / totalSales) * 100 : 0;
      return item;
    });
  }

}