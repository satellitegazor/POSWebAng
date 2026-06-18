import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LogonDataService } from '../../global/logon-data-service.service';
import { PosApiService } from '../services/pos-api-service';
import { UpdateTicketStatusLocationRequest } from "../models/misc.models";
import {
  LoadTicketStatLocRequest,
  LoadTicketStatLocResultModel,
  PickUpStatusMasterData,
  TicketStatusLocationData
} from '../models/ticket.status.location.models';

@Component({
  selector: 'app-ticket-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-status.component.html',
  styleUrl: './ticket-status.component.css'
})
export class TicketStatusComponent implements OnInit {
  ticketStatusResult: LoadTicketStatLocResultModel | null = null;
  loading = false;
  locationName = '';
  vendorName = '';
  vendorNumber = '';
  pageSize = 25;
  pageNum = 1;
  fromDate = '';
  toDate = '';
  lastName = '';
  firstName = '';
  readonly pageSizeOptions = [25, 50, 100];
  readonly readyByTimeOptions = this.buildReadyByTimeOptions();
  openReadyByTimePopupTicketId: number | null = null;
  openTicketStatusPopupTicketId: number | null = null;
  private selectedTicketStatusByTranId: Record<number, number> = {};
  private selectedTicketStatusLabelByTranId: Record<number, string> = {};
  persistedStatusByTranId: Record<number, boolean> = {};

  constructor(
    private posApiService: PosApiService,
    private logonDataService: LogonDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const locCnfg = this.logonDataService.getLocationConfig();
    this.locationName = locCnfg?.locationName || '';
    this.vendorName = locCnfg?.vendorName || '';
    this.vendorNumber = locCnfg?.vendorNumber || '';

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.fromDate = this.formatDateInput(firstDay);
    this.toDate = this.formatDateInput(today);

    this.onRefreshClick();
  }

  loadTicketStatusLocations(uid: number, request: LoadTicketStatLocRequest): void {
    this.loading = true;

    this.posApiService.loadTicketStatLoc(uid, request).subscribe({
      next: (result: LoadTicketStatLocResultModel) => {
        const normalizedStatuses = (result.ticketStatuses ?? []).map((status) => ({
          ...status,
          tktStatusId: this.resolveCanonicalStatusId(this.getStatusId(status), status)
        }));

        const normalizedTickets = (result.tickets ?? []).map((ticket) => ({
          ...ticket,
          tktStatusId: this.normalizeTicketStatusId(ticket.tktStatusId, normalizedStatuses)
        }));

        this.ticketStatusResult = {
          ...result,
          ticketStatuses: normalizedStatuses,
          tickets: normalizedTickets
        };

        this.selectedTicketStatusByTranId = {};
        this.selectedTicketStatusLabelByTranId = {};
        this.persistedStatusByTranId = {};
        for (const ticket of normalizedTickets) {
          this.selectedTicketStatusByTranId[ticket.transactionID] = Number(ticket.tktStatusId) || 0;
          this.selectedTicketStatusLabelByTranId[ticket.transactionID] = this.resolveStatusDescriptionById(ticket.tktStatusId) || 'Not Ready';
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ticket status locations', error);
        this.loading = false;
      }
    });
  }

  onRefreshClick(): void {
    this.pageNum = 1;
    this.fetchTicketStatusData();
  }

  onPageSizeChange(): void {
    this.pageNum = 1;
    this.fetchTicketStatusData();
  }

  previousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }
    this.pageNum -= 1;
    this.fetchTicketStatusData();
  }

  nextPage(): void {
    if (!this.canGoNext) {
      return;
    }
    this.pageNum += 1;
    this.fetchTicketStatusData();
  }

  get tickets(): TicketStatusLocationData[] {
    return this.ticketStatusResult?.tickets ?? [];
  }

  get ticketStatuses(): PickUpStatusMasterData[] {
    return (this.ticketStatusResult?.ticketStatuses ?? [])
      .filter((status) => status.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  get hasTickets(): boolean {
    return this.tickets.length > 0;
  }

  get totalRowCount(): number {
    return this.ticketStatusResult?.totalRowCount ?? this.tickets.length;
  }

  get entryInfo(): string {
    if (!this.totalRowCount) {
      return 'No entries found';
    }

    const fromEntry = (this.pageNum - 1) * this.pageSize + 1;
    const toEntry = Math.min(fromEntry + this.tickets.length - 1, this.totalRowCount);
    return `Showing ${fromEntry} to ${toEntry} of ${this.totalRowCount} entries`;
  }

  get canGoPrevious(): boolean {
    return this.pageNum > 1;
  }

  get canGoNext(): boolean {
    return this.pageNum * this.pageSize < this.totalRowCount;
  }

  get readyByTimeOptionRows(): string[][] {
    const rows: string[][] = [];

    for (let index = 0; index < this.readyByTimeOptions.length; index += 3) {
      rows.push(this.readyByTimeOptions.slice(index, index + 3));
    }

    return rows;
  }

  formatDateInput(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatShortDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  formatPhone(value: string | null | undefined): string {
    if (!value) {
      return 'N/A';
    }

    const digits = value.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return value;
  }

  getReadyByTime(ticket: TicketStatusLocationData): string {
    if (!ticket.readyByDate) {
      return '16:00';
    }

    const readyByDate = ticket.readyByDate instanceof Date ? ticket.readyByDate : new Date(ticket.readyByDate);
    if (Number.isNaN(readyByDate.getTime())) {
      return '16:00';
    }

    return `${String(readyByDate.getHours()).padStart(2, '0')}:${String(readyByDate.getMinutes()).padStart(2, '0')}`;
  }

  onReadyByDateChange(ticket: TicketStatusLocationData, value: string): void {
    if (!value) {
      ticket.readyByDate = null;
      this.persistTicketStatusChange(ticket);
      return;
    }

    const time = this.getReadyByTime(ticket);
    ticket.readyByDate = new Date(`${value}T${time}:00`);
    this.persistTicketStatusChange(ticket);
  }

  onReadyByTimeChange(ticket: TicketStatusLocationData, value: string): void {
    const dateValue = this.formatDateInput(ticket.readyByDate || this.fromDate);
    ticket.readyByDate = dateValue ? new Date(`${dateValue}T${value}:00`) : null;
    this.persistTicketStatusChange(ticket);
  }

  isReadyByTimePopupOpen(ticket: TicketStatusLocationData): boolean {
    return this.openReadyByTimePopupTicketId === ticket.transactionID;
  }

  toggleReadyByTimePopup(ticket: TicketStatusLocationData): void {
    this.openTicketStatusPopupTicketId = null;
    this.openReadyByTimePopupTicketId = this.isReadyByTimePopupOpen(ticket)
      ? null
      : ticket.transactionID;
  }

  selectReadyByTime(ticket: TicketStatusLocationData, time: string): void {
    this.onReadyByTimeChange(ticket, time);
    this.openReadyByTimePopupTicketId = null;
  }

  getTicketStatusDescription(ticket: TicketStatusLocationData): string {
    const selectedLabel = this.selectedTicketStatusLabelByTranId[ticket.transactionID];
    if (selectedLabel) {
      return selectedLabel;
    }

    const currentStatusId = this.getCurrentTicketStatusId(ticket);
    return this.resolveStatusDescriptionById(currentStatusId) || 'Not Ready';
  }

  isTicketStatusPopupOpen(ticket: TicketStatusLocationData): boolean {
    return this.openTicketStatusPopupTicketId === ticket.transactionID;
  }

  toggleTicketStatusPopup(ticket: TicketStatusLocationData): void {
    this.openReadyByTimePopupTicketId = null;
    this.openTicketStatusPopupTicketId = this.isTicketStatusPopupOpen(ticket)
      ? null
      : ticket.transactionID;
  }

  canSelectTicketStatus(ticket: TicketStatusLocationData, status: PickUpStatusMasterData): boolean {
    return this.getStatusId(status) >= this.getCurrentTicketStatusId(ticket);
  }

  selectTicketStatus(ticket: TicketStatusLocationData, status: PickUpStatusMasterData): void {
    const selectedStatusId = this.normalizeTicketStatusId(this.getStatusId(status), this.ticketStatuses);
    this.selectedTicketStatusLabelByTranId[ticket.transactionID] = this.getStatusDescription(status) || 'Not Ready';
    this.selectedTicketStatusByTranId[ticket.transactionID] = selectedStatusId;

    if (this.ticketStatusResult?.tickets?.length) {
      this.ticketStatusResult = {
        ...this.ticketStatusResult,
        tickets: this.ticketStatusResult.tickets.map((currentTicket) =>
          currentTicket.transactionID === ticket.transactionID
            ? { ...currentTicket, tktStatusId: selectedStatusId }
            : currentTicket
        )
      };
    }

    this.persistTicketStatusChange(ticket, selectedStatusId);
    this.openTicketStatusPopupTicketId = null;
  }

  onRackLocationChange(ticket: TicketStatusLocationData, value: string): void {
    ticket.rckLocDesc = (value || '').trim().toUpperCase();
    this.syncRackLocationFromDescription(ticket);
    this.persistTicketStatusChange(ticket);
  }

  isTicketStatusSelected(ticket: TicketStatusLocationData, status: PickUpStatusMasterData): boolean {
    return this.getCurrentTicketStatusId(ticket) === this.getStatusId(status);
  }

  openTransaction(ticket: TicketStatusLocationData): void {
    const transactionId = Number(ticket?.transactionID ?? 0);
    if (!transactionId) {
      return;
    }

    this.router.navigate(['/ltktrcpt'], {
      queryParams: {
        txnid: transactionId,
        frmSalesTrnRpt: false
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.openReadyByTimePopupTicketId === null && this.openTicketStatusPopupTicketId === null) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target?.closest('.ready-time-picker') && !target?.closest('.ticket-status-picker')) {
      this.openReadyByTimePopupTicketId = null;
      this.openTicketStatusPopupTicketId = null;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.openReadyByTimePopupTicketId = null;
    this.openTicketStatusPopupTicketId = null;
  }

  private fetchTicketStatusData(): void {
    const locCnfg = this.logonDataService.getLocationConfig();
    const request = new LoadTicketStatLocRequest();
    request.locationId = locCnfg?.locationUID || 0;
    request.tranId = 0;
    request.fromDate = this.fromDate;
    request.toDate = this.toDate;
    request.lastName = this.lastName.toLowerCase().trim();
    request.firstName = this.firstName.toLowerCase().trim();
    request.pageSize = this.pageSize;
    request.pageNum = this.pageNum;

    this.loadTicketStatusLocations(locCnfg?.individualUID || 0, request);
  }

  private buildReadyByTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 7; hour <= 21; hour += 1) {
      options.push(`${String(hour).padStart(2, '0')}:00`);
    }
    return options;
  }

  private getCurrentTicketStatusId(ticket: TicketStatusLocationData): number {
    const selectedStatusId = this.selectedTicketStatusByTranId[ticket.transactionID];
    if (selectedStatusId) {
      return selectedStatusId;
    }

    return this.normalizeTicketStatusId(ticket.tktStatusId, this.ticketStatuses);
  }

  private normalizeTicketStatusId(statusId: number | null | undefined, availableStatuses: PickUpStatusMasterData[]): number {
    const normalizedStatusId = this.resolveCanonicalStatusId(statusId);

    if (availableStatuses.some((status) => this.getStatusId(status) === normalizedStatusId)) {
      return normalizedStatusId;
    }

    const notReadyStatusId = this.toStatusId(
      this.getStatusId(availableStatuses.find((status) => (status.tktStatusCode || '').toUpperCase() === 'NOTREADY'))
    );
    const firstStatusId = this.getStatusId(availableStatuses[0]);

    return this.resolveCanonicalStatusId(notReadyStatusId || firstStatusId || 1);
  }

  private toStatusId(value: number | string | null | undefined): number {
    return Number(value) || 0;
  }

  private getStatusId(status: PickUpStatusMasterData | null | undefined): number {
    if (!status) {
      return 0;
    }

    const runtimeStatus = status as unknown as {
      tktStatusId?: number | string;
      tktStatusID?: number | string;
      statusId?: number | string;
      ticketStatusId?: number | string;
      id?: number | string;
      tktStatusCode?: string;
      description?: string;
      tktStatusDesc?: string;
      statusDescription?: string;
      desc?: string;
      name?: string;
    };

    const rawStatusId = this.toStatusId(
      runtimeStatus.tktStatusId
        ?? runtimeStatus.tktStatusID
        ?? runtimeStatus.statusId
        ?? runtimeStatus.ticketStatusId
        ?? runtimeStatus.id
        ?? 0
    );

    return this.resolveCanonicalStatusId(rawStatusId, status);
  }

  private getStatusDescription(status: PickUpStatusMasterData | null | undefined): string {
    if (!status) {
      return '';
    }

    const runtimeStatus = status as unknown as { description?: string; tktStatusDesc?: string; statusDescription?: string; desc?: string; name?: string };
    return (runtimeStatus.description ?? runtimeStatus.tktStatusDesc ?? runtimeStatus.statusDescription ?? runtimeStatus.desc ?? runtimeStatus.name ?? '').trim();
  }

  private resolveStatusDescriptionById(statusId: number | string | null | undefined): string {
    const normalizedStatusId = this.toStatusId(statusId);
    const selectedStatus = this.ticketStatuses.find((status) => this.getStatusId(status) === normalizedStatusId);
    return this.getStatusDescription(selectedStatus);
  }

  private resolveCanonicalStatusId(
    statusId: number | string | null | undefined,
    status: PickUpStatusMasterData | null | undefined = null
  ): number {
    const parsedId = this.toStatusId(statusId);
    if (parsedId === 1 || parsedId === 2 || parsedId === 3) {
      return parsedId;
    }

    const statusCode = String((status as { tktStatusCode?: string } | null)?.tktStatusCode ?? '').toUpperCase();
    if (statusCode === 'NOTREADY') {
      return 1;
    }
    if (statusCode === 'READY') {
      return 2;
    }
    if (statusCode === 'PICKEDUP') {
      return 3;
    }

    const statusDescription = this.getStatusDescription(status).toUpperCase();
    if (statusDescription.includes('NOT READY')) {
      return 1;
    }
    if (statusDescription.includes('READY')) {
      return 2;
    }
    if (statusDescription.includes('PICKED UP') || statusDescription.includes('PICKEDUP')) {
      return 3;
    }

    return parsedId || 1;
  }

  private persistTicketStatusChange(ticket: TicketStatusLocationData, statusIdOverride?: number): void {
    const locCnfg = this.logonDataService.getLocationConfig();
    const userId = String(locCnfg?.individualUID ?? '');

    if (!userId || !ticket?.transactionID) {
      return;
    }

    const statusId = statusIdOverride ?? this.getCurrentTicketStatusId(ticket);
    this.persistedStatusByTranId[ticket.transactionID] = false;

    const request: UpdateTicketStatusLocationRequest = {
      transactionId: ticket.transactionID,
      readyByDate: ticket.readyByDate ?? null,
      statusId,
      rackLocationId: ticket.rackLocationId ?? 0,
      rckLocDesc: (ticket.rckLocDesc || '').trim(),
      payByDueDate: ticket.payByDueDate ?? null,
      locationId: ticket.locationUID || locCnfg?.locationUID || 0,
      userId
    };

    this.posApiService.updateTktStatRacLoc(userId, request).subscribe({
      next: () => {
        this.selectedTicketStatusByTranId[ticket.transactionID] = statusId;
        this.persistedStatusByTranId[ticket.transactionID] = true;
      },
      error: (error) => {
        this.persistedStatusByTranId[ticket.transactionID] = false;
        console.error('Failed to persist ticket status/location change', error);
      }
    });
  }

  private syncRackLocationFromDescription(ticket: TicketStatusLocationData): void {
    const rackDesc = (ticket.rckLocDesc || '').trim().toLowerCase();
    const rackLocation = (this.ticketStatusResult?.rackLocations ?? [])
      .find((location) => (location.description || '').trim().toLowerCase() === rackDesc);

    ticket.rackLocationId = rackLocation?.rckLocationUID ?? 0;
    if (rackLocation?.description) {
      ticket.rckLocDesc = rackLocation.description;
    }
  }

}
