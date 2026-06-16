import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LTC_Associates } from '../../../models/location.associates';
import { PosApiService } from '../../../services/pos-api-service';
import { LTC_SettlementDetails, SettlementReportResultModel } from '../models';
import { LogonDataService } from '../../../../global/logon-data-service.service';
import { ToastService } from '../../../../services/toast.service';
import { SendEmailRequest } from '../../../../models/misc-models';

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
  indivId: number = 0;
  public SaleAssocList: LTC_Associates[] = [];
  showEmailPopup: boolean = false;
  selectedEmailOption: 'self' | 'manager' | 'custom' = 'self';
  customEmailAddress: string = '';
  emailSubmitError: string = '';
  emailSubmitSuccess: string = '';
  isSendingEmail: boolean = false;

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
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const locCnfg = this.logonDataSvc.getLocationConfig();
    this.indivId = locCnfg.individualUID || 0;
    const month = this.getMonthToken();
    this.getSettlmntRptData(locCnfg.contractUID, month, String(locCnfg.individualUID), locCnfg.locationUID);
  }

  getSettlmntRptData(cid: number = 0, month: string = '', uid: string = '', lid: number = 0): void {

    const locCnfg = this.logonDataSvc.getLocationConfig();
    // Clear previous results so stale Fee Summary data is not displayed during/after refresh.
    this.stlmtRptDataMdl = null;
    this.SaleAssocList = [];

    this.posApiService.getSettlementReport(cid, month, uid, lid, locCnfg.rgnCode)
      .subscribe({
        next: result => {
          this.stlmtRptDataMdl = result;
          if (result.selectedMonth) this.selectedMonth = result.selectedMonth;
          if (result.selectedYear) this.selectedYear = result.selectedYear;

          this.loadAssociateEmails(lid, Number(uid) || this.indivId);
        },
        error: () => {
          this.stlmtRptDataMdl = null;
          this.toastService.error('Unable to refresh settlement report for the selected month.');
        }
      });
  }

  private loadAssociateEmails(locationId: number, individualUID: number): void {
    this.posApiService.getLocationAssociates(locationId, String(individualUID)).subscribe({
      next: data => {
        this.SaleAssocList = data?.associates ?? [];
      },
      error: () => {
        this.SaleAssocList = [];
      }
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
    this.selectedEmailOption = this.selfAssociateEmail ? 'self' : (this.managerAssociateEmail ? 'manager' : 'custom');
    this.customEmailAddress = '';
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';
    this.showEmailPopup = true;
  }

  closeEmailPopup(): void {
    this.showEmailPopup = false;
    this.isSendingEmail = false;
  }

  submitEmailPopup(): void {
    this.emailSubmitError = '';
    this.emailSubmitSuccess = '';

    const recipientEmail = this.getSelectedRecipientEmail();
    if (!recipientEmail) {
      this.emailSubmitError = 'Please select a valid email option.';
      return;
    }

    if (!this.isValidEmail(recipientEmail)) {
      this.emailSubmitError = 'Please enter a valid email address.';
      return;
    }

    const request: SendEmailRequest = {
      EmailAddress: recipientEmail,
      Subject: this.buildEmailSubject(),
      EmailContent: this.buildSettlementReportHtml()
    };

    const uid = this.logonDataSvc.getLocationConfig()?.individualUID || this.indivId;
    this.isSendingEmail = true;
    this.posApiService.sendEmail(String(uid), request).subscribe({
      next: result => {
        this.isSendingEmail = false;
        if (result?.success) {
          this.emailSubmitSuccess = 'Email sent successfully.';
          this.showEmailPopup = false;
          this.toastService.success('Email sent successfully.');
          return;
        }

        this.emailSubmitError = result?.returnMsg || 'Unable to send email.';
      },
      error: () => {
        this.isSendingEmail = false;
        this.emailSubmitError = 'Unable to send email.';
      }
    });
  }

  get selfAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => assoc.individualUID === this.indivId)?.emailAddress?.trim() || '';
  }

  get managerAssociateEmail(): string {
    return this.SaleAssocList.find(assoc => (assoc.code || '').toUpperCase() === 'RLTYP_CONC_MNGR')?.emailAddress?.trim() || '';
  }

  private getSelectedRecipientEmail(): string {
    if (this.selectedEmailOption === 'self') {
      return this.selfAssociateEmail;
    }
    if (this.selectedEmailOption === 'manager') {
      return this.managerAssociateEmail;
    }
    return (this.customEmailAddress || '').trim();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private buildEmailSubject(): string {
    const fromDate = this.stlmtRptDataMdl?.fromDate || '';
    const toDate = this.stlmtRptDataMdl?.toDate || '';
    return `Settlement Report - ${this.displayLocationName} (${fromDate} to ${toDate})`;
  }

  private buildSettlementReportHtml(): string {
    const safe = (val: string) => this.escapeHtml(val || '');
    const gt = this.grandTotals;
    const sr = this.stlmtRptDataMdl?.settlementReport;
    const groups = this.facilityGroups;
    const fromDate = this.stlmtRptDataMdl?.fromDate || '';
    const toDate = this.stlmtRptDataMdl?.toDate || '';
    const paymentDueLabel = this.isPACRegion
      ? (this.isReimbursementDue ? 'Reimbursement Due Concession' : 'Payment Due AAFES (A+A1+A2) - B')
      : `Payment Due AAFES (A+A1${this.isNBFF ? '+A2' : ''})`;
    const paymentDueValue = this.isPACRegion ? this.paymentDueAafesPac : this.paymentDueAafes;

    const settlementSummaryRows = groups.map(group => {
      const detailRows = group.details.map(d => `
        <tr>
          <td style="border:1px solid #dee2e6; padding:6px;">${safe(group.facilityNumber)}</td>
          <td style="border:1px solid #dee2e6; padding:6px;">${safe(d.businessDescription)}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatCurrency(d.grossSales))}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatDeduction(d.less))}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatCurrency(d.netSales))}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatCurrency(d.feeId === 1 ? d.netExchangeFeeFlat : d.netExchangeFeePrcnt))}</td>
        </tr>`).join('');

      const totalRow = `
        <tr style="background:#f1f5f9; font-weight:700;">
          <td style="border:1px solid #dee2e6; padding:6px;">${safe(group.facilityNumber)}</td>
          <td style="border:1px solid #dee2e6; padding:6px;">Totals</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatCurrency(group.totGrSales))}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatDeduction(group.totLess))}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatCurrency(group.totNSales))}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(this.formatCurrency(group.totNExFee))}</td>
        </tr>`;

      return `${detailRows}${totalRow}`;
    }).join('');

    const accountingRows = this.nonPacAccountingRows.map(row => {
      const concessionVal = row.concessionPaymentConditional ? '***' : this.formatCurrency(row.concessionPayment);
      const otherVal = row.otherPayment > 0 ? this.formatCurrency(row.otherPayment) : 'N/A';

      return `
        <tr>
          <td style="border:1px solid #dee2e6; padding:6px;">${safe(row.facilityNumber)}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(concessionVal)}</td>
          <td style="border:1px solid #dee2e6; padding:6px; text-align:right;">${safe(otherVal)}</td>
        </tr>`;
    }).join('');

    const feeSummaryRows = this.isPACRegion
      ? `
        <tr><td style="padding:6px; border:1px solid #dee2e6;">Net Exchange Fee (A)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(gt.totNExFee))}</td></tr>
        <tr><td style="padding:6px; border:1px solid #dee2e6;">Equipment Rental (A1)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(gt.totEqipfee))}</td></tr>
        <tr><td style="padding:6px; border:1px solid #dee2e6;">Insurance Amount (A2)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(sr?.insuranceFee ?? 0))}</td></tr>
        <tr><td style="padding:6px; border:1px solid #dee2e6;">Net Amount Due Concession (B)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(this.tenderSummary.netAmtDueCncsn))}</td></tr>`
      : `
        <tr><td style="padding:6px; border:1px solid #dee2e6;">Net Exchange Fee (A)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(gt.totNExFee))}</td></tr>
        <tr><td style="padding:6px; border:1px solid #dee2e6;">Equipment Rental (A1)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(gt.totEqipfee))}</td></tr>
        ${this.isNBFF && (sr?.camChrgAmt ?? 0) !== 0
          ? `<tr><td style="padding:6px; border:1px solid #dee2e6;">CAM Charges (A2)</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(sr?.camChrgAmt ?? 0))}</td></tr>`
          : ''}`;

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#1f2937;">
        <div style="padding:12px; border:1px solid #d1d5db; border-radius:8px; margin-bottom:16px; background:#f8fafc;">
          <h2 style="margin:0 0 8px 0; color:#0d6efd;">Settlement Report</h2>
          <div><strong>Location:</strong> ${safe(this.displayLocationName)} (${safe(this.facNumber)})</div>
          <div><strong>Vendor Number:</strong> ${safe(this.displayVendorNumber)}</div>
          <div><strong>Contract Number:</strong> ${safe(this.stlmtRptDataMdl?.contract?.contractNumber || '')}</div>
          <div><strong>Date Range:</strong> ${safe(fromDate)} to ${safe(toDate)}</div>
        </div>

        <h3 style="margin:0 0 8px 0; color:#0d6efd;">Settlement Summary</h3>
        <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
          <thead>
            <tr style="background:#e9ecef;">
              <th style="border:1px solid #dee2e6; padding:6px; text-align:left;">Facility</th>
              <th style="border:1px solid #dee2e6; padding:6px; text-align:left;">Department</th>
              <th style="border:1px solid #dee2e6; padding:6px; text-align:right;">Net Merchandise Sales</th>
              <th style="border:1px solid #dee2e6; padding:6px; text-align:right;">Less Net Concession Discounts</th>
              <th style="border:1px solid #dee2e6; padding:6px; text-align:right;">Fee Based Sales</th>
              <th style="border:1px solid #dee2e6; padding:6px; text-align:right;">Net Exchange Fee</th>
            </tr>
          </thead>
          <tbody>
            ${settlementSummaryRows || `<tr><td colspan="6" style="border:1px solid #dee2e6; padding:8px; text-align:center;">No settlement summary data available.</td></tr>`}
          </tbody>
        </table>

        <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:16px;">
          <div style="flex:1; min-width:320px;">
            <h3 style="margin:0 0 8px 0; color:#0d6efd;">Sales Tax (For Information Purpose Only)</h3>
            <table style="width:100%; border-collapse:collapse;">
              <tbody>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Tax Collected</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(gt.taxCollected))}</td></tr>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Tax Refunded</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatDeduction(gt.taxRefunded))}</td></tr>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Net Sales Tax</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(this.netTaxes))}</td></tr>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Tax-Exempt Sales</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(gt.noTaxSales))}</td></tr>
              </tbody>
            </table>
          </div>

          <div style="flex:1; min-width:320px;">
            <h3 style="margin:0 0 8px 0; color:#0d6efd;">Fee Summary</h3>
            <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
              <tbody>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Refund Transaction Count</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${sr?.rfndTranCount ?? 0}</td></tr>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Cancelled Tickets Count</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${sr?.cnclTktsCount ?? 0}</td></tr>
                <tr><td style="padding:6px; border:1px solid #dee2e6;">Exchange Coupons Count</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${sr?.exchCpnsCount ?? 0}</td></tr>
                ${feeSummaryRows}
                <tr style="background:#fff3cd; font-weight:700;"><td style="padding:6px; border:1px solid #dee2e6;">${safe(paymentDueLabel)}</td><td style="padding:6px; border:1px solid #dee2e6; text-align:right;">${safe(this.formatCurrency(paymentDueValue))}</td></tr>
              </tbody>
            </table>

            ${accountingRows
              ? `<h4 style="margin:12px 0 8px 0; color:#0d6efd;">For Accounting Purpose</h4>
                 <table style="width:100%; border-collapse:collapse;">
                   <thead>
                     <tr style="background:#e9ecef;">
                       <th style="border:1px solid #dee2e6; padding:6px; text-align:left;">Facility</th>
                       <th style="border:1px solid #dee2e6; padding:6px; text-align:right;">Concession Payments (223-01)</th>
                       <th style="border:1px solid #dee2e6; padding:6px; text-align:right;">Other Payments (223-02)</th>
                     </tr>
                   </thead>
                   <tbody>${accountingRows}</tbody>
                 </table>`
              : ''}
          </div>
        </div>
      </div>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  goToReportsMenu(): void {
    this.router.navigate(['/rptmenu']);
  }

  goToSalesTransaction(): void {
    this.router.navigate(['/salestran']);
  }
}
