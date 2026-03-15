import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import {
  LTC_RackLocation,
  LTC_TicketStatus,
  TicketStatusLocationData,
} from '../../models/ticket.status.location.models';

@Component({
  selector: 'app-ticket-status-dlg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-status-dlg.component.html',
  styleUrl: './ticket-status-dlg.component.css'
})
export class TicketStatusDlgComponent implements OnInit {
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

  private _initialState = '';

  readonly readyByTimeOptions: string[] = [
    '07:00', '08:00', '09:00', '10:00',
    '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00',
  ];

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.editableTicketStatus = this._cloneTicketStatus(this.ticketStatus);
    this.readyByDateValue = this._formatDateForInput(this.editableTicketStatus.readyByDate);
    this.nextPaymentDueValue = this._formatDateForInput(this.editableTicketStatus.payByDueDate);
    this.readyByTimeValue = this._formatTimeForInput(this.editableTicketStatus.readyByDate) || this.readyByTimeOptions[9];
    this.showBalanceFields = this.showBalanceFields || (this.editableTicketStatus.balanceDue ?? 0) > 0;
    this._initialState = this._snapshotState();
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
    return this._formatAmount(this.editableTicketStatus.balanceDue);
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

    this.activeModal.close(savedTicketStatus);
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

  trackByTicketStatusId(_: number, status: LTC_TicketStatus): number {
    return status.tktStatusId;
  }

  trackByRackLocationId(_: number, location: LTC_RackLocation): number {
    return location.rckLocationUID;
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
