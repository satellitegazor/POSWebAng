import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TktObjState } from 'src/app/app.state';
import { Store } from '@ngrx/store';
import { addRefundReason } from '../store/ticketstore/ticket.action';


interface RefundReason {
  code: string;
  label: string;
}

@Component({
  selector: 'app-rov-refund-reason-dlg',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rov-refund-reason-dlg.component.html',
  styleUrls: ['./rov-refund-reason-dlg.component.css']
})
export class RovRefundReasonDlgComponent implements OnInit {
  readonly refundReasons: RefundReason[] = [
    { code: 'DD', label: 'Defective/Damaged' },
    { code: 'DS', label: 'Dissatisfied with Service' },
    { code: 'WS', label: 'Wrong Size/Color' },
    { code: 'CM', label: 'Customer Changed Mind' },
    { code: 'OT', label: 'Other, Please Specify' }
  ];

  selectedReasonCode: string = '';
  otherReason: string = '';
  isDropdownOpen: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private _store: Store<TktObjState>,
    private router: Router
  ) {}

  ngOnInit(): void {}

  selectReason(reason: RefundReason): void {
    this.selectedReasonCode = reason.code;
    this.isDropdownOpen = false;

    if (reason.code !== 'OT') {
      this.otherReason = '';
    }
  }

  get selectedReasonLabel(): string {
    const reason = this.refundReasons.find(r => r.code === this.selectedReasonCode);
    return reason ? reason.label : 'Select a Reason';
  }

  get showOtherReasonField(): boolean {
    return this.selectedReasonCode === 'OT';
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  ok(): void {
    if (!this.selectedReasonCode) {
      return;
    }

    const result = {
      reasonCode: this.selectedReasonCode,
      reasonLabel: this.selectedReasonLabel,
      otherReason: this.otherReason
    };

    this._store.dispatch(addRefundReason({ refundCode: result.reasonCode, refundReason: result.otherReason }));

    this.activeModal.close(result);
  }

  cancel(): void {
    this.activeModal.dismiss('cancelled');
    this.router.navigate(['/mainmenu']);
  }
}
