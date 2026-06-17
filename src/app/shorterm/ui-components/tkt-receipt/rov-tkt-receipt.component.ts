import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { TicketTender } from '../../../models/ticket.tender';
import { LogonDataService } from '../../../global/logon-data-service.service';
import { ToastService } from '../../../services-misc/toast.service';
import { Actions, ofType } from '@ngrx/effects';
import { ROV_POSTicketSplit } from '../../models/rticket.split';
import { ROV_SingleTransactionIDResults, ROV_SingleTransactionResultsModel, ROV_Ticket} from '../../models/models';

import { PosApiService } from '../../../longterm/services/pos-api-service';
import { TktObjState } from '../../../app.state';
import { Store } from '@ngrx/store';
import { addTabSerialToTktObj, loadTicket, loadTicketSuccess, updateCheckoutTotals } from "../../store/ticketstore/rticket.action";
import { CPOSWebSvcService } from '../../../services-pinpad/cposweb-svc.service';
import { CustomerSearchComponent } from "../../../longterm/customer-search/customer-search.component";
import { RovApiService } from '../../short-term.service';
import { RovLogonDataService } from '../../rov-logon-data.service';
import { ROV_Event } from 'src/app/longterm/models/ticket.list';

type TicketItem = ROV_POSTicketSplit['tktList'][number];

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
  selector: 'app-rov-tkt-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rov-tkt-receipt.component.html',
  styleUrl: './rov-tkt-receipt.component.css'
})
export class RovTktReceiptComponent implements OnInit {
  transactionId = 0;
  frmSalesTrnRpt = false;
  src = '';
  isLoading = true;
  readonly refundTenderTypes = ['XR', 'RC', 'CR', 'MR'];
  public ticket: ROV_Ticket = {} as ROV_Ticket;
  public signature: ROV_SingleTransactionResultsModel['signatureData'] =
    {} as ROV_SingleTransactionResultsModel['signatureData'];

  bDisplayAddlTagsBtn: boolean = false;
  bDisplayCheckoutBtn: boolean = false;
  bDisplayTicketStatusBtn: boolean = false;
  bDisplayCancelTicketBtn: boolean = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly rovApiSvc: RovApiService,
    private readonly rovLogonDataService: RovLogonDataService,
    private readonly toastService: ToastService,
    private readonly _tktObjStore: Store<TktObjState>,
    private readonly _cposWebSvc: CPOSWebSvcService,
    private actions$: Actions,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;

    this.activatedRoute.queryParams
      .pipe(
        switchMap((params) => {
          this.transactionId = Number(params['txnid'] ?? 0);
          this.frmSalesTrnRpt =
            String(params['frmSalesTrnRpt'] ?? '').toLowerCase() === 'true';
          this.src = String(params['src'] ?? '').toUpperCase();

          if (!this.transactionId) {
            return EMPTY;
          }

          return this.rovApiSvc
            .getSingleTransaction(
              this.rovLogonDataService.getRovEventConfig().individualUID,
              this.transactionId,
              false,
              0,
              false,
              false
            )
            .pipe(
              switchMap((data: ROV_SingleTransactionResultsModel) => {
                
                data.ticket?.tenders.length == 0 ? this.bDisplayCheckoutBtn = true : this.bDisplayCheckoutBtn = false;
                let busFuncCode = this.rovLogonDataService.getRovEventConfig().busFuncCode;
                (busFuncCode == 'BUSFNC_LNDRYCLN' || busFuncCode == 'BUSFNC_LNDRYCLN_WALT') ? this.bDisplayAddlTagsBtn = true : this.bDisplayAddlTagsBtn = false;
                (busFuncCode == 'BUSFNC_LNDRYCLN' || busFuncCode == 'BUSFNC_LNDRYCLN_WALT') ? this.bDisplayCancelTicketBtn = true : this.bDisplayCancelTicketBtn = false;
                (busFuncCode == 'BUSFNC_LNDRYCLN' || busFuncCode == 'BUSFNC_LNDRYCLN_WALT') ? this.bDisplayTicketStatusBtn = true : this.bDisplayTicketStatusBtn = false;

                (data.ticket?.balanceDue ?? 0) > 0 ? this.bDisplayCancelTicketBtn = true : this.bDisplayCancelTicketBtn = false;
                const ticket = this.ensureTicketDefaults(
                  this.toCamelCaseKeys<ROV_Ticket>(data.ticket)
                );
                this.ticket = ticket;

                const signature =
                  this.toCamelCaseKeys<ROV_SingleTransactionResultsModel['signatureData']>(
                    data.signatureData
                  );

                return this.rovApiSvc
                  .GetRovEvent(this.ticket.eventId, String())
                  .pipe(
                    map((evt: ROV_Event) => {
                      const normalizedEvent = this.toCamelCaseKeys<ROV_Event>(
                        evt
                      );

                      return {
                        ticket: {
                          ...ticket,
                          event: normalizedEvent ?? ticket.event
                        },
                        signature
                      };
                    }),
                    catchError(() =>
                      of({
                        ticket,
                        signature
                      })
                    )
                  );
              }),
              finalize(() => {
                this.isLoading = false;
              })
            );
        })
      )
      .subscribe(({ ticket, signature }) => {
        this.ticket = ticket;
        this.signature = signature;
      });
  }

  private ensureTicketDefaults(ticket: ROV_Ticket): ROV_Ticket {
    const safeTicket = (ticket ?? {}) as ROV_Ticket;

    safeTicket.event = (safeTicket.event ?? {}) as ROV_Ticket['event'];
    safeTicket.customer = (safeTicket.customer ?? {}) as ROV_Ticket['customer'];
    safeTicket.ticketCancel = (safeTicket.ticketCancel ?? {}) as ROV_Ticket['ticketCancel'];
    safeTicket.ticketStatus = (safeTicket.ticketStatus ?? {}) as ROV_Ticket['ticketStatus'];
    safeTicket.items = safeTicket.items ?? [];
    safeTicket.tenders = safeTicket.tenders ?? [];
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
    return Number(this.ticket?.transactionId ?? 0) > 0;
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

  // getAddressLines(): string[] {

  //       const suite = this.ticket.event?.suiteNbr?.trim() ?? '';
  //   const fullAddress = `${address1}${suite ? `, Suite: ${suite},` : ''}`;
  //   const lines: string[] = [];

  //   let working = fullAddress;
  //   while (working.length > 52) {
  //     lines.push(working.substring(0, 49));
  //     working = working.substring(49);
  //   }

  //   if (working.length > 0) {
  //     lines.push(working);
  //   }

  //   return lines;
  // }

  // getCityStateZip(): string {
  //   const city = this.ticket.location?.city ?? '';
  //   const state = this.ticket.location?.stateProvice ?? '';
  //   const postalCode = this.ticket.location?.postalCode ?? '';
  //   return [city, state, postalCode].filter(Boolean).join(', ');
  // }

  // getHoursText(hours: LTC_HoursOfOperation): string {
  //   if (!hours) {
  //     return '';
  //   }

  //   const dayFrom = (hours.dayFrom ?? '').substring(0, 3);
  //   const dayTo = hours.dayTo ? ` - ${(hours.dayTo ?? '').substring(0, 3)}: ` : ': ';
  //   const timeRange =
  //     hours.timeFrom !== 'ByAptOnly'
  //       ? `${hours.timeFrom ?? ''} - ${hours.timeTo ?? ''}`
  //       : 'By Appointment Only';

  //   return `${dayFrom}${dayTo}${timeRange}`;
  // }

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

    let tenderTypes = this.rovLogonDataService.getTenderTypes();

    const tenderType = tenderTypes.types.find((tt) => tt.tenderTypeCode === tender.tenderTypeCode);
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

  btnPrintReceiptClick(event: Event): void {
    event.preventDefault();

    if (!this.hasTicketData) {
      this.toastService.warning('Receipt is not ready to print yet.');
      return;
    }

    window.print();
  }

  btnEReceiptClick(event: Event): void {
    event.preventDefault();

    if (!this.hasTicketData) {
      this.toastService.warning('Receipt data is not available yet.');
      return;
    }

    const defaultEmail = (this.ticket.customer as any)?.cEmailAddress?.trim()
      || this.rovLogonDataService.getRovEventConfig().assocEmail?.trim()
      || '';
    const emailAddress = window.prompt('Enter email address for the e-receipt.', defaultEmail);

    if (emailAddress === null) {
      return;
    }

    const normalizedEmail = emailAddress.trim();
    if (!normalizedEmail) {
      this.toastService.warning('Email address is required to send an e-receipt.');
      return;
    }

    const individualUid = String(this.rovLogonDataService.getRovEventConfig().individualUID ?? '');
    this.rovApiSvc.sendEmail(individualUid, {
      EmailAddress: normalizedEmail,
      Subject: `Receipt ${this.ticket.ticketNumber || this.ticket.transactionId}`,
      EmailContent: this.buildReceiptEmailContent()
    }).subscribe({
      next: (result) => {
        if (result?.success) {
          this.toastService.success('E-receipt sent successfully.');
          return;
        }

        this.toastService.error(result?.returnMsg || 'Failed to send e-receipt.');
      },
      error: () => {
        this.toastService.error('Failed to send e-receipt.');
      }
    });
  }
  modalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      centered: true
  };

  

  btnPrintAddlTags(event: Event): void {
    event.preventDefault();

    if (!this.hasTicketData) {
      this.toastService.warning('Receipt is not ready to print yet.');
      return;
    }

    window.print();
  }

  btnCheckout(event: Event): void {
    event.preventDefault();
    this._tktObjStore.dispatch(loadTicket({ tranId: this.transactionId, eventId: this.rovLogonDataService.getRovEventConfig().eventID, indivId: this.rovLogonDataService.getRovEventConfig().individualUID }))

      this._cposWebSvc.pinpadHeartbeat("PING").subscribe(data => {
          if (data.IsSuccess) {
              this._tktObjStore.dispatch(addTabSerialToTktObj({ tabSerialNum: data.TabMachineName, ipAddress: data.IpAddress }));
          }
      });

      this.actions$.pipe(ofType(loadTicketSuccess)).subscribe(() => {
          setTimeout((logonDataSvc, tktObjStore, routr) => {
              routr.navigate(['/checkout']);
              tktObjStore.dispatch(updateCheckoutTotals({ logonDataSvc: logonDataSvc }))
          }, 800, this.rovLogonDataService, this._tktObjStore, this.router);
      });
    
  }

  btnCancelTicket(event: Event): void {
    event.preventDefault();
    this.toastService.info('Cancel Ticket action is not configured in this receipt screen.');
  }

  btnTranDetails(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/trandtls']);
  }

  btnTktLookup(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/ticketlookup']);
  }

  btnSalesTranReportClick(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/rptsalestran']);
  }

  btnSalesTranClick(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/salestran']);
  }

  private buildReceiptEmailContent(): string {
    const transactionDate = this.ticket.transactionDate
      ? new Date(this.ticket.transactionDate).toLocaleString()
      : '';

    return [
      `${this.ticket.event?.eventName ?? 'Store Receipt'}`,
      `Ticket #: ${this.ticket.ticketNumber ?? ''}`,
      `Transaction #: ${this.ticket.transactionId ?? ''}`,
      transactionDate ? `Date: ${transactionDate}` : '',
      `Grand Total: $${this.formatCurrency(this.receiptTotals.grandTotal + (this.busFunUID === 9 && !this.isRefund ? this.receiptTotals.tipAmount : 0))}`
    ].filter(Boolean).join('\n');
  }

}
