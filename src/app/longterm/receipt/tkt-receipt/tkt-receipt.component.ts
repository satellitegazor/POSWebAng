import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketTender } from 'src/app/models/ticket.tender';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import {
  LTC_SingleTransactionResultsModel,
  LTC_Ticket
} from '../../models/ticket.list';
import { PosApiService } from '../../services/pos-api-service';
import { LTC_HoursOfOperation } from '../../models/store.location';

type TicketItem = LTC_Ticket['items'][number];

interface DepartmentGroup {
  id: number;
  name: string;
  items: TicketItem[];
}

interface ReceiptTotals {
  totalItems: number;
  itemTotal: number;
  totalSalesTax: number;
  totalEnvTax: number;
  totalSavings: number;
  grandTotal: number;
  tipAmount: number;
}

@Component({
  selector: 'app-tkt-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tkt-receipt.component.html',
  styleUrl: './tkt-receipt.component.css'
})
export class TktReceiptComponent implements OnInit {
  transactionId = 0;
  frmSalesTrnRpt = false;
  src = '';
  readonly refundTenderTypes = ['XR', 'RC', 'CR', 'MR'];
  public ticket: LTC_Ticket = {} as LTC_Ticket;
  public signature: LTC_SingleTransactionResultsModel['SignatureData'] =
    {} as LTC_SingleTransactionResultsModel['SignatureData'];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly posApiService: PosApiService,
    private readonly logonDataService: LogonDataService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.transactionId = Number(params['TxnId'] ?? 0);
      this.frmSalesTrnRpt =
        String(params['frmSalesTrnRpt'] ?? '').toLowerCase() === 'true';
      this.src = String(params['src'] ?? '').toUpperCase();

      if (!this.transactionId) {
        return;
      }

      this.posApiService
        .getSingleTransaction(
          this.logonDataService.getLocationConfig().individualUID,
          this.transactionId,
          false,
          0,
          '',
          0,
          0
        )
        .subscribe((data: LTC_SingleTransactionResultsModel) => {
          this.ticket = this.ensureTicketDefaults(this.toCamelCaseKeys<LTC_Ticket>(data.ticket));
          this.signature = this.toCamelCaseKeys<LTC_SingleTransactionResultsModel['SignatureData']>(
            data.SignatureData
          );

          this.posApiService.getLTCStoreLocation(data.ticket.locationUID, String(data.ticket.individualLocationUID))
            .subscribe((storeLocation) => {
              const normalizedLocation = this.toCamelCaseKeys<LTC_Ticket['location']>(storeLocation.location);
              this.ticket.location = normalizedLocation ?? this.ticket.location;
            });
        });
    });
  }

  private ensureTicketDefaults(ticket: LTC_Ticket): LTC_Ticket {
    const safeTicket = (ticket ?? {}) as LTC_Ticket;

    safeTicket.location = (safeTicket.location ?? {}) as LTC_Ticket['location'];
    safeTicket.customer = (safeTicket.customer ?? {}) as LTC_Ticket['customer'];
    safeTicket.ticketCancel = (safeTicket.ticketCancel ?? {}) as LTC_Ticket['ticketCancel'];
    safeTicket.ticketStatus = (safeTicket.ticketStatus ?? {}) as LTC_Ticket['ticketStatus'];
    safeTicket.items = safeTicket.items ?? [];
    safeTicket.tenders = safeTicket.tenders ?? [];

    safeTicket.location.hoursOfOperations = safeTicket.location.hoursOfOperations ?? [];

    return safeTicket;
  }

  private toCamelCaseKeys<T>(value: unknown): T {
    if (Array.isArray(value)) {
      return value.map((item) => this.toCamelCaseKeys(item)) as T;
    }

    if (value instanceof Date || value === null || value === undefined || typeof value !== 'object') {
      return value as T;
    }

    const result: Record<string, unknown> = {};

    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      const normalizedKey = this.camelKey(key);
      result[normalizedKey] = this.toCamelCaseKeys(nestedValue);
    });

    return result as T;
  }

  private camelKey(key: string): string {
    if (!key) {
      return key;
    }

    return key.charAt(0).toLowerCase() + key.slice(1);
  }

  get hasTicketData(): boolean {
    return Number(this.ticket?.transactionID ?? 0) > 0;
  }

  get busFunUID(): number {
    return this.ticket?.items?.[0]?.businessFunctionUID ?? 0;
  }

  get numOfPiecesLabel(): string {
    const totalTags = this.ticket.items.reduce((sum, item) => {
      return sum + (item.noOfTags ?? 0) * (item.quantity ?? 0);
    }, 0);

    return totalTags > 0 ? `${totalTags} Pieces` : '';
  }

  get isRefund(): boolean {
    return (this.ticket.tenders ?? []).some((tender: TicketTender) =>
      this.refundTenderTypes.includes((tender.tenderTypeCode ?? '').toUpperCase())
    );
  }

  get hasCancelledTicket(): boolean {
    return (this.ticket.ticketCancel?.ticketCancelId ?? 0) !== 0;
  }

  get isSysCancelled(): boolean {
    const cancelCode = this.ticket.ticketCancel?.ticketCancelTypeCode ?? '';
    return cancelCode === 'SC' || cancelCode === 'TO';
  }

  get groupedItems(): DepartmentGroup[] {
    const groups = new Map<number, DepartmentGroup>();

    (this.ticket.items ?? []).forEach((item) => {
      const id = item.departmentUID ?? 0;
      if (!groups.has(id)) {
        groups.set(id, {
          id,
          name: item.deptName ?? '',
          items: []
        });
      }

      groups.get(id)?.items.push(item);
    });

    return Array.from(groups.values());
  }

  get receiptTotals(): ReceiptTotals {
    let totalItems = 0;
    let itemTotal = 0;
    let totalSalesTax = 0;
    let totalEnvTax = 0;
    let totalSavings = 0;
    let grandTotal = 0;

    (this.ticket.items ?? []).forEach((item) => {
      totalItems += item.quantity ?? 0;
      itemTotal +=
        (item.lineItemDollarDisplayAmount ?? 0) -
        (item.lineItemTaxAmount ?? 0) -
        (item.lineItemEnvTaxAmount ?? 0);
      totalSalesTax += item.lineItemTaxAmount ?? 0;
      totalEnvTax += item.lineItemEnvTaxAmount ?? 0;
      totalSavings +=
        (item.couponLineItemDollarAmount ?? 0) +
        (item.discountAmount ?? 0) +
        (item.lineItmKatsaCpnAmt ?? 0);
      grandTotal += item.lineItemDollarDisplayAmount ?? 0;
    });

    grandTotal += (this.ticket.shipHandling ?? 0) + (this.ticket.shipHandlingTaxAmt ?? 0);

    const tipAmount = (this.ticket.tenders ?? []).reduce((sum, tender) => {
      return sum + (tender.tipAmount ?? 0);
    }, 0);

    return {
      totalItems,
      itemTotal,
      totalSalesTax,
      totalEnvTax,
      totalSavings,
      grandTotal,
      tipAmount
    };
  }

  get hasSignatureImage(): boolean {
    return Boolean(this.ticket.isSignCaptured && this.signature?.SignData?.SignData);
  }

  get signatureImageSrc(): string {
    const signData = this.signature?.SignData?.SignData ?? '';
    return signData ? `data:image/jpg;base64,${signData}` : '';
  }

  get signatureStatement(): string {
    const tenderWithSignStatement = (this.ticket.tenders ?? []).find(
      (tender) => (tender.signatureType ?? '').trim().length > 0
    );

    return tenderWithSignStatement?.signatureType ?? '';
  }

  getAddressLines(): string[] {

    const address1 = this.ticket.location?.addressLine1 ?? '';
    const suite = this.ticket.location?.suiteNbr?.trim() ?? '';
    const fullAddress = `${address1}${suite ? `, Suite: ${suite},` : ''}`;
    const lines: string[] = [];

    let working = fullAddress;
    while (working.length > 52) {
      lines.push(working.substring(0, 49));
      working = working.substring(49);
    }

    if (working.length > 0) {
      lines.push(working);
    }

    return lines;
  }

  getCityStateZip(): string {
    const city = this.ticket.location?.city ?? '';
    const state = this.ticket.location?.stateProvice ?? '';
    const postalCode = this.ticket.location?.postalCode ?? '';
    return [city, state, postalCode].filter(Boolean).join(', ');
  }

  getHoursText(hours: LTC_HoursOfOperation): string {
    if (!hours) {
      return '';
    }

    const dayFrom = (hours.dayFrom ?? '').substring(0, 3);
    const dayTo = hours.dayTo ? ` - ${(hours.dayTo ?? '').substring(0, 3)}: ` : ': ';
    const timeRange =
      hours.timeFrom !== 'ByAptOnly'
        ? `${hours.timeFrom ?? ''} - ${hours.timeTo ?? ''}`
        : 'By Appointment Only';

    return `${dayFrom}${dayTo}${timeRange}`;
  }

  getInstructionLines(): string[] {
    const lines: string[] = [];
    let markerIndex = 0;

    this.groupedItems.forEach((group) => {
      group.items.forEach((item) => {
        const instruction = (item.instruction ?? '').trim();
        if (instruction) {
          markerIndex += 1;
          lines.push(`[*${markerIndex}] ${instruction}`);
        }

        const addlInstruction = (item.addlInstruction ?? '').trim();
        if (addlInstruction) {
          if (!instruction) {
            markerIndex += 1;
            lines.push(`[*${markerIndex}] ${addlInstruction}`);
          } else {
            lines.push(addlInstruction);
          }
        }
      });
    });

    return lines;
  }

  itemMarker(item: TicketItem, index: number): string {
    const hasInstruction = (item.instruction ?? '').trim().length > 0;
    const hasAddlInstruction = (item.addlInstruction ?? '').trim().length > 0;

    if (!hasInstruction && !hasAddlInstruction) {
      return '';
    }

    return `[*${index}]`;
  }

  displayTenderName(tender: TicketTender): string {

    let tenderTypes = this.logonDataService.getTenderTypes();

    const tenderType = tenderTypes.types.find(tt => tt.tenderTypeCode === tender.tenderTypeCode);
    if (tenderType) {
      return tenderType.tenderTypeDesc;
    }
    return '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value ?? 0);
  }

  formatMaskedCard(cardEndingNbr: string): string {
    if (!cardEndingNbr) {
      return '';
    }

    return `************${cardEndingNbr}`;
  }

}
