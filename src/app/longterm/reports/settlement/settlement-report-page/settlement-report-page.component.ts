import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PosApiService } from '../../../services/pos-api-service';
import { LTC_SettlementDetails, SettlementReportResultModel } from '../models';
import { LogonDataService } from '../../../../global/logon-data-service.service';

export interface FacilityGroup {
  facilityNumber: string;
  details: LTC_SettlementDetails[];
  feeId: number;
  feePerc: number;
  totGrSales: number;
  totLess: number;
  totNSales: number;
  totExFeeFlat: number;
  totExFeePrcnt: number;
  totExFee: number;
  totExCou: number;
  totNExFeeFlat: number;
  totNExFeePrcnt: number;
  totNExFee: number;
  totEqipfee: number;
  taxCollected: number;
  taxRefunded: number;
  noTaxSales: number;
  envTax: number;
}

export interface TenderSummary {
  msTndrCnt: number; msTranCnt: number; msTotals: number; percMSfee: number; netMSTotals: number;
  gcTndrCnt: number; gcTranCnt: number; gcTotals: number;
  xcTndrCnt: number; xcTranCnt: number; xcTotals: number; percXCfee: number; netXCTotals: number;
  ccTndrCnt: number; ccTranCnt: number; ccTotals: number;
  caTndrCnt: number; caTranCnt: number; caTotals: number;
  ckTndrCnt: number; ckTranCnt: number; ckTotals: number;
  tndrCntTot: number; tranCntTot: number; gTndrTot: number;
  dueCncsn: number; netAmtDueCncsn: number;
}

export interface NonPacAccountingRow {
  facilityNumber: string;
  concessionPayment: number;
  concessionPaymentConditional: boolean;
  otherPayment: number;
}

@Component({
  selector: 'app-settlement-report-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settlement-report-page.component.html',
  styleUrls: ['./settlement-report-page.component.css']
})
export class SettlementReportPageComponent implements OnInit {

  stlmtRptDataMdl: SettlementReportResultModel | null = null;
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  readonly months = [
    { value: 1, label: 'January' },  { value: 2, label: 'February' },
    { value: 3, label: 'March' },    { value: 4, label: 'April' },
    { value: 5, label: 'May' },      { value: 6, label: 'June' },
    { value: 7, label: 'July' },     { value: 8, label: 'August' },
    { value: 9, label: 'September' },{ value: 10, label: 'October' },
    { value: 11, label: 'November' },{ value: 12, label: 'December' }
  ];

  get years(): number[] {
    const cur = new Date().getFullYear();
    return [cur - 2, cur - 1, cur];
  }

  constructor(
    private posApiService: PosApiService,
    private logonDataSvc: LogonDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const locCnfg = this.logonDataSvc.getLocationConfig();
    const month = this.getMonthToken();
    this.getSettlmntRptData(locCnfg.contractUID, month, String(locCnfg.individualUID), locCnfg.locationUID);
  }

  getSettlmntRptData(cid: number = 0, month: string = '', uid: string = '', lid: number = 0): void {
    
    const locCnfg = this.logonDataSvc.getLocationConfig();
    this.posApiService.getSettlementReport(cid, month, uid, lid, locCnfg.rgnCode)
      .subscribe(result => {
        this.stlmtRptDataMdl = result;
        if (result.selectedMonth) this.selectedMonth = result.selectedMonth;
        if (result.selectedYear) this.selectedYear = result.selectedYear;
      });
  }

  refreshReport(): void {
    const locCnfg = this.logonDataSvc.getLocationConfig();
    const month = this.getMonthToken();
    this.getSettlmntRptData(locCnfg.contractUID, month, String(locCnfg.individualUID), locCnfg.locationUID);
  }

  private getMonthToken(): string {
    return `${this.selectedYear}${String(this.selectedMonth).padStart(2, '0')}`;
  }

  get hasSettlementData(): boolean {
    return (this.stlmtRptDataMdl?.settlementReport?.settlementDetails?.length ?? 0) > 0;
    
  }

  get facilityGroups(): FacilityGroup[] {
    const details = this.stlmtRptDataMdl?.settlementReport?.settlementDetails ?? [];
    const map = new Map<string, LTC_SettlementDetails[]>();
    for (const d of details) {
      if (!map.has(d.facilityNumber)) map.set(d.facilityNumber, []);
      map.get(d.facilityNumber)!.push(d);
    }
    return Array.from(map.entries()).map(([fn, dets]) => this.buildFacilityGroup(fn, dets));
  }

  private buildFacilityGroup(facilityNumber: string, details: LTC_SettlementDetails[]): FacilityGroup {
    const g: FacilityGroup = {
      facilityNumber, details,
      feeId: details[0]?.feeId ?? 0,
      feePerc: details[0]?.feeType ?? 0,
      totGrSales: 0, totLess: 0, totNSales: 0,
      totExFeeFlat: 0, totExFeePrcnt: 0, totExFee: 0, totExCou: 0,
      totNExFeeFlat: 0, totNExFeePrcnt: 0, totNExFee: 0, totEqipfee: 0,
      taxCollected: 0, taxRefunded: 0, noTaxSales: 0, envTax: 0
    };
    for (const d of details) {
      g.totGrSales += d.grossSales;
      g.totLess += d.less;
      g.totNSales += d.netSales;
      const flat = Math.round(d.exchangeFeeFlat * 100) / 100;
      const prcnt = Math.round(d.exchangeFeePrcnt * 100) / 100;
      g.totExFeeFlat += flat;
      g.totExFeePrcnt += prcnt;
      const feeMode = this.resolveFeeMode(d.feeId, flat, prcnt);
      g.totExFee += feeMode === 1 ? flat : feeMode === 2 ? prcnt : 0;
      g.totExCou += d.exchangeCoupons;
      const nFlat = Math.round(d.netExchangeFeeFlat * 100) / 100;
      const nPrcnt = Math.round(d.netExchangeFeePrcnt * 100) / 100;
      g.totNExFeeFlat += nFlat;
      g.totNExFeePrcnt += nPrcnt;
      g.totNExFee += feeMode === 1 ? nFlat : feeMode === 2 ? nPrcnt : 0;
      g.totEqipfee += d.rentalFee;
      g.taxCollected += d.totalSalesTax;
      g.taxRefunded += d.totalRefundTax;
      g.noTaxSales += d.noTaxSales;
      g.envTax += d.envTax;

      // Keep group fee id aligned with inferred data when backend sends 0/unknown fee id.
      if (g.feeId === 0 && feeMode !== 0) {
        g.feeId = feeMode;
      }
    }

    if (g.feeId === 0) {
      g.feeId = this.resolveFeeMode(0, g.totExFeeFlat, g.totExFeePrcnt);
    }

    return g;
  }

  private resolveFeeMode(feeId: number, flatValue: number, percentValue: number): number {
    if (feeId === 1 || feeId === 2 || feeId === 3) {
      return feeId;
    }

    // Legacy parity: when fee id is missing/0, infer from populated amount.
    if (percentValue !== 0 && flatValue === 0) {
      return 2;
    }
    if (flatValue !== 0 && percentValue === 0) {
      return 1;
    }
    if (percentValue !== 0 && flatValue !== 0) {
      return 2;
    }
    return 0;
  }

  get grandTotals(): FacilityGroup & { total: number; camChrgAmt: number } {
    const groups = this.facilityGroups;
    const camChrgAmt = this.stlmtRptDataMdl?.settlementReport?.camChrgAmt ?? 0;
    const derivedGrandFeeId = groups.some(g => g.feeId === 3)
      ? 3
      : groups.some(g => g.feeId === 2)
        ? 2
        : groups.some(g => g.feeId === 1)
          ? 1
          : 0;
    const gt: any = {
      facilityNumber: '', details: [],
      feeId: derivedGrandFeeId,
      feePerc: 0, camChrgAmt,
      totGrSales: 0, totLess: 0, totNSales: 0,
      totExFeeFlat: 0, totExFeePrcnt: 0, totExFee: 0, totExCou: 0,
      totNExFeeFlat: 0, totNExFeePrcnt: 0, totNExFee: 0, totEqipfee: 0,
      taxCollected: 0, taxRefunded: 0, noTaxSales: 0, envTax: 0, total: 0
    };
    for (const f of groups) {
      gt.totGrSales += f.totGrSales;   gt.totLess += f.totLess;
      gt.totNSales += f.totNSales;     gt.totExFeeFlat += f.totExFeeFlat;
      gt.totExFeePrcnt += f.totExFeePrcnt; gt.totExFee += f.totExFee;
      gt.totExCou += f.totExCou;       gt.totNExFeeFlat += f.totNExFeeFlat;
      gt.totNExFeePrcnt += f.totNExFeePrcnt; gt.totNExFee += f.totNExFee;
      gt.totEqipfee += f.totEqipfee;   gt.taxCollected += f.taxCollected;
      gt.taxRefunded += f.taxRefunded; gt.noTaxSales += f.noTaxSales;
      gt.envTax += f.envTax;
    }
    gt.total = gt.feeId === 3
      ? Math.max(gt.totNExFeePrcnt, gt.totNExFeeFlat) + gt.totEqipfee + camChrgAmt
      : gt.totNExFee + gt.totEqipfee + camChrgAmt;
    return gt;
  }

  get tenderSummary(): TenderSummary {
    const tndrDetails = this.stlmtRptDataMdl?.settlementReport?.oconusStlmntTndrDetails ?? [];
    const katusa = this.stlmtRptDataMdl?.settlementReport?.katusaTotals ?? 0;
    const s: TenderSummary = {
      msTndrCnt: 0, msTranCnt: 0, msTotals: 0, percMSfee: 0, netMSTotals: 0,
      gcTndrCnt: 0, gcTranCnt: 0, gcTotals: 0,
      xcTndrCnt: 0, xcTranCnt: 0, xcTotals: 0, percXCfee: 0, netXCTotals: 0,
      ccTndrCnt: 0, ccTranCnt: 0, ccTotals: 0,
      caTndrCnt: 0, caTranCnt: 0, caTotals: 0,
      ckTndrCnt: 0, ckTranCnt: 0, ckTotals: 0,
      tndrCntTot: 0, tranCntTot: 0, gTndrTot: katusa,
      dueCncsn: 0, netAmtDueCncsn: 0
    };
    for (const t of tndrDetails) {
      s.tndrCntTot += t.tenderCount;
      s.tranCntTot += t.transactionCount;
      s.gTndrTot += t.tenderTotals;
      switch (t.tenderType) {
        case 'MS': s.msTndrCnt += t.tenderCount; s.msTranCnt += t.transactionCount; s.msTotals += t.tenderTotals; break;
        case 'GC': s.gcTndrCnt += t.tenderCount; s.gcTranCnt += t.transactionCount; s.gcTotals += t.tenderTotals; break;
        case 'XC': s.xcTndrCnt += t.tenderCount; s.xcTranCnt += t.transactionCount; s.xcTotals += t.tenderTotals; break;
        case 'CC': s.ccTndrCnt += t.tenderCount; s.ccTranCnt += t.transactionCount; s.ccTotals += t.tenderTotals; break;
        case 'CA': s.caTndrCnt += t.tenderCount; s.caTranCnt += t.transactionCount; s.caTotals += t.tenderTotals; break;
        case 'CK': s.ckTndrCnt += t.tenderCount; s.ckTranCnt += t.transactionCount; s.ckTotals += t.tenderTotals; break;
      }
    }
    s.percMSfee = Math.round(0.02 * s.msTotals * 100) / 100;
    s.percXCfee = Math.round(0.02 * s.xcTotals * 100) / 100;
    s.netMSTotals = Math.round((s.msTotals - s.percMSfee) * 100) / 100;
    s.netXCTotals = Math.round((s.xcTotals - s.percXCfee) * 100) / 100;
    s.dueCncsn = s.xcTotals + s.gcTotals + s.msTotals + s.ckTotals + katusa;
    s.netAmtDueCncsn = Math.round((s.gcTotals + s.ckTotals + katusa + s.netXCTotals + s.netMSTotals) * 100) / 100;
    return s;
  }

  get showOconusTenders(): boolean {
    return (this.stlmtRptDataMdl?.settlementReport?.oconusStlmntTndrDetails?.length ?? 0) > 0;
  }

  get businessModels(): string {
    return this.stlmtRptDataMdl?.businessModels ?? '';
  }

  get isPACRegion(): boolean {
    return (this.stlmtRptDataMdl?.contract?.regionCode ?? '') === 'OCONP';
  }

  get frgnCurr(): boolean {
    const currencyCode = (this.stlmtRptDataMdl?.contract?.currencyCode ?? '').toUpperCase();
    return currencyCode !== '' && currencyCode !== 'USD' && currencyCode !== 'NONP' && currencyCode !== 'NONE';
  }

  get isNBFF(): boolean {
    return this.businessModels.includes('6') || !!(this.stlmtRptDataMdl?.settlementReport?.camChrgFacNbr ?? '');
  }

  get selectedLocation() {
    const locations = this.stlmtRptDataMdl?.contract?.locations ?? [];
    if (!locations.length) {
      return null;
    }

    const fallbackLocId = this.logonDataSvc.getLocationConfig()?.locationUID ?? 0;
    const locationId = this.stlmtRptDataMdl?.locationId ?? fallbackLocId;
    return locations.find(x => x.locationUID === locationId) ?? locations[0];
  }

  get useShipHandling(): boolean {
    return this.selectedLocation?.useShipHndlng ?? false;
  }

  get facNumber(): string {
    return this.selectedLocation?.facilityNumber ?? '';
  }

  get displayLocationName(): string {
    return this.selectedLocation?.locationName ?? this.stlmtRptDataMdl?.locationName ?? '';
  }

  get displayVendorNumber(): string {
    return this.stlmtRptDataMdl?.contract?.concessionaire?.vendorNumber
      || this.stlmtRptDataMdl?.contract?.vendorNumber
      || '';
  }

  get showKatusa(): boolean {
    return this.stlmtRptDataMdl?.showKatusa ?? false;
  }

  get netTaxes(): number {
    const gt = this.grandTotals;
    return gt.taxCollected - gt.taxRefunded;
  }

  get paymentDueAafes(): number {
    return this.grandTotals.total;
  }

  get paymentDueAafesPac(): number {
    const gt = this.grandTotals;
    const ts = this.tenderSummary;
    const insurance = this.stlmtRptDataMdl?.settlementReport?.insuranceFee ?? 0;
    return Math.abs((gt.totNExFee + gt.totEqipfee + insurance) - ts.netAmtDueCncsn);
  }

  get nonPacAccountingRows(): NonPacAccountingRow[] {
    if (this.isPACRegion) {
      return [];
    }

    return this.facilityGroups
      .filter(g => g.totNExFee !== 0 || g.totEqipfee > 0 || g.feeId === 3)
      .map(g => ({
        facilityNumber: g.facilityNumber,
        concessionPayment: g.totNExFee,
        concessionPaymentConditional: g.feeId === 3,
        otherPayment: g.totEqipfee
      }));
  }

  formatCurrency(value: number): string {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value < 0 ? `$(${formatted})` : `$${formatted}`;
  }

  formatDeduction(value: number): string {
    const abs = Math.abs(value);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value >= 0 ? `$(${formatted})` : `$${formatted}`;
  }

  get isReimbursementDue(): boolean {
    const gt = this.grandTotals;
    const ts = this.tenderSummary;
    const insurance = this.stlmtRptDataMdl?.settlementReport?.insuranceFee ?? 0;
    return ts.netAmtDueCncsn > (gt.totNExFee + gt.totEqipfee + insurance);
  }

  onEmail(): void {
    window.location.href = 'mailto:?subject=Settlement Report';
  }

  goToReportsMenu(): void {
    this.router.navigate(['/rptmenu']);
  }

  goToSalesTransaction(): void {
    this.router.navigate(['/salestran']);
  }
}
