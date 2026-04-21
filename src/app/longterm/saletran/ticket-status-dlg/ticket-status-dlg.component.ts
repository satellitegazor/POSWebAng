import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';

import {
  LoadTicketStatLocRequest,
  LoadTicketStatLocResultModel,
  LTC_RackLocation,
  LTC_TicketStatus,
  TicketStatusLocationData,
} from '../../models/ticket.status.location.models';
import { PosApiService, UpdateTicketStatusLocationRequest } from '../../services/pos-api-service';
import { Store } from '@ngrx/store';
import { TktObjState } from '../../../app.state';
import { getSavedTicketResult, getTktObjSelector } from '../store/ticketstore/ticket.selector';
import { SaveTicketResultsModel } from '../../../models/ticket.split';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-ticket-status-dlg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-status-dlg.component.html',
  styleUrls: ['./ticket-status-dlg.component.css']
})
export class TicketStatusDlgComponent implements OnInit, OnDestroy {
  @Input() title = 'Ticket Status';
  @Input() ticketStatus: TicketStatusLocationData = new TicketStatusLocationData();
  @Input() ticketStatuses: LTC_TicketStatus[] = [
    { tktStatusId: 1, tktStatusCode: 'NOTREADY', description: 'Not Ready', displayOrder: 1, active: true },
    { tktStatusId: 2, tktStatusCode: 'READY', description: 'Ready for Pick Up', displayOrder: 2, active: true },
    { tktStatusId: 3, tktStatusCode: 'PICKEDUP', description: 'Picked Up', displayOrder: 3, active: true },
  ];
  @Input() rackLocations: LTC_RackLocation[] = [];
  @Input() showBalanceFields = false;

  editableTicketStatus: TicketStatusLocationData = new TicketStatusLocationData();
  readyByDateValue = '';
  nextPaymentDueValue = '';
  readyByTimeValue = '16:00';
  isReadyByTimePopupOpen = false;
  currentUserId = '';
  private readonly _destroy$ = new Subject<void>();

  private _initialState = '';

  readonly readyByTimeOptions: string[] = [
    '07:00', '08:00', '09:00', '10:00',
    '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00',
  ];

  tktStatRequest: LoadTicketStatLocRequest = new LoadTicketStatLocRequest();
  tktStatResult: LoadTicketStatLocResultModel = new LoadTicketStatLocResultModel();
  saveTktRsltMdl: SaveTicketResultsModel = {} as SaveTicketResultsModel;
  tktSaveResultMessage: string = '';
  businessFunctionCode: string = '';

  constructor(public activeModal: NgbActiveModal, 
    private _salesTranSvc: PosApiService,
    private _store: Store<TktObjState>,
    private _toastService: ToastService) {}

  ngOnInit(): void {

    this._store.select(getSavedTicketResult)
      .pipe(takeUntil(this._destroy$))
      .subscribe(data => {
        this.saveTktRsltMdl = data;
        this.tktSaveResultMessage = this.saveTktRsltMdl.ticketNumber > 0 ? ('Ticket save Successful')  : 'Ticket saving...';
        this.showBalanceFields = (this.saveTktRsltMdl.balanceDue ?? 0) > 0;
      });

    this._store.select(getTktObjSelector)
      .pipe(takeUntil(this._destroy$))
      .subscribe(tktObj => {

        this.tktStatRequest = new LoadTicketStatLocRequest();
        this.tktStatRequest.locationId = tktObj?.locationUID ?? 0;
        this.tktStatRequest.tranId = tktObj?.transactionID ?? 0;
        this.currentUserId = (tktObj?.individualUID ?? 0).toString();
        const userId: number = tktObj?.individualUID ?? 0;

        this._salesTranSvc.loadTicketStatLoc(userId, this.tktStatRequest)
          .pipe(takeUntil(this._destroy$))
          .subscribe(result => {
            if (result && result.results && result.results.success) {
              this.tktStatResult = result as LoadTicketStatLocResultModel;
            }
          });
      });

    this.editableTicketStatus = this._cloneTicketStatus(this.ticketStatus);
    this.readyByDateValue = '';  // Start with blank date, don't auto-populate from input
    this.nextPaymentDueValue = this._formatDateForInput(this.editableTicketStatus.payByDueDate);
    this.readyByTimeValue = '16:00';  // Keep as 16:00 default, don't override with input time
    
    this._initialState = this._snapshotState();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  get hasChanges(): boolean {
    return this._snapshotState() !== this._initialState;
  }

  get hasRackLocationSuggestions(): boolean {
    return this.rackLocations.length > 0;
  }

  get pickupStatusDescription(): string {
    return this.ticketStatuses.find(status => status.tktStatusId === this.editableTicketStatus.tktStatusId)?.description ?? 'Select status';
  }

  get balanceDueDisplay(): string {
    return this._formatAmount(this.saveTktRsltMdl.balanceDue);
  }

  get readyByTimeOptionRows(): string[][] {
    const rows: string[][] = [];

    for (let index = 0; index < this.readyByTimeOptions.length; index += 4) {
      rows.push(this.readyByTimeOptions.slice(index, index + 4));
    }

    return rows;
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  save(): void {
    
    const savedTicketStatus = this._cloneTicketStatus(this.editableTicketStatus);
    savedTicketStatus.readyByDate = this._combineDateAndTime(this.readyByDateValue, this.readyByTimeValue);
    savedTicketStatus.payByDueDate = this._toDateOrNull(this.nextPaymentDueValue);
    savedTicketStatus.rckLocDesc = (savedTicketStatus.rckLocDesc || '').trim();

    const selectedRackLocation = this.rackLocations.find(location =>
      location.rckLocationUID === savedTicketStatus.rackLocationId ||
      location.description.toLowerCase() === savedTicketStatus.rckLocDesc.toLowerCase()
    );

    if (selectedRackLocation) {
      savedTicketStatus.rackLocationId = selectedRackLocation.rckLocationUID;
      savedTicketStatus.rckLocDesc = selectedRackLocation.description;
    }

    const updateRequest: UpdateTicketStatusLocationRequest = {
      transactionId: this.tktStatRequest.tranId,
      readyByDate: savedTicketStatus.readyByDate,
      statusId: savedTicketStatus.tktStatusId ?? 0,
      rackLocationId: savedTicketStatus.rackLocationId ?? 0,
      rckLocDesc: savedTicketStatus.rckLocDesc,
      payByDueDate: savedTicketStatus.payByDueDate,
      locationId: this.tktStatRequest.locationId,
      userId: this.currentUserId
    };

    this._salesTranSvc.updateTicketStatusLocation(this.currentUserId, updateRequest).subscribe(
      (response) => {
        if (response && response.results && response.results.success) {
          this.activeModal.close(savedTicketStatus);
          this._toastService.success('Ticket status updated successfully');
        } else {
          this._toastService.error('Failed to update ticket status');
          console.error('Update failed:', response?.queryMessage);
        }
      },
      (error) => {
        this._toastService.error('Failed to update ticket status');
        console.error('Update error:', error);
      }
    );
  }

  onPickupStatusChange(ticketStatusId: string | number): void {
    this.editableTicketStatus.tktStatusId = Number(ticketStatusId);
  }

  onRackLocationInput(): void {
    const rackLocation = this.rackLocations.find(location =>
      location.description.toLowerCase() === this.editableTicketStatus.rckLocDesc.trim().toLowerCase()
    );

    this.editableTicketStatus.rackLocationId = rackLocation?.rckLocationUID ?? 0;
  }

  toggleReadyByTimePopup(): void {
    this.isReadyByTimePopupOpen = !this.isReadyByTimePopupOpen;
  }

  selectReadyByTime(time: string): void {
    this.readyByTimeValue = time;
    this.isReadyByTimePopupOpen = false;
  }

  trackByTicketStatusId(_: number, status: LTC_TicketStatus): number {
    return status.tktStatusId;
  }

  trackByRackLocationId(_: number, location: LTC_RackLocation): number {
    return location.rckLocationUID;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isReadyByTimePopupOpen) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target?.closest('.ready-time-picker')) {
      this.isReadyByTimePopupOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isReadyByTimePopupOpen = false;
  }

  private _cloneTicketStatus(source: TicketStatusLocationData | null | undefined): TicketStatusLocationData {
    const clone = new TicketStatusLocationData();

    if (!source) {
      return clone;
    }

    Object.assign(clone, source, {
      dropOffDate: this._normalizeDate(source.dropOffDate) ?? clone.dropOffDate,
      readyByDate: this._normalizeDate(source.readyByDate),
      payByDueDate: this._normalizeDate(source.payByDueDate),
    });

    return clone;
  }

  private _normalizeDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const normalizedDate = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(normalizedDate.getTime()) ? null : normalizedDate;
  }

  private _formatDateForInput(value: Date | string | null | undefined): string {
    const normalizedDate = this._normalizeDate(value);

    if (!normalizedDate) {
      return '';
    }

    const month = `${normalizedDate.getMonth() + 1}`.padStart(2, '0');
    const day = `${normalizedDate.getDate()}`.padStart(2, '0');
    return `${normalizedDate.getFullYear()}-${month}-${day}`;
  }

  private _formatTimeForInput(value: Date | string | null | undefined): string {
    const normalizedDate = this._normalizeDate(value);

    if (!normalizedDate) {
      return '';
    }

    const hours = `${normalizedDate.getHours()}`.padStart(2, '0');
    const minutes = `${normalizedDate.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private _combineDateAndTime(dateValue: string, timeValue: string): Date | null {
    if (!dateValue) {
      return null;
    }

    const [year, month, day] = dateValue.split('-').map(Number);
    const [hours, minutes] = (timeValue || '00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
  }

  private _toDateOrNull(dateValue: string): Date | null {
    if (!dateValue) {
      return null;
    }

    const [year, month, day] = dateValue.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  private _formatAmount(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  }

  private _snapshotState(): string {
    return JSON.stringify({
      balanceDue: this.editableTicketStatus.balanceDue ?? 0,
      nextPaymentDueValue: this.nextPaymentDueValue,
      rackLocationId: this.editableTicketStatus.rackLocationId ?? 0,
      rackLocationDescription: (this.editableTicketStatus.rckLocDesc || '').trim().toLowerCase(),
      readyByDateValue: this.readyByDateValue,
      readyByTimeValue: this.readyByTimeValue,
      ticketStatusId: this.editableTicketStatus.tktStatusId ?? 0,
    });
  }

}
