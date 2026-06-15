// privacy-act-confirmation.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-mandate-training',
  imports: [CommonModule, FormsModule],
  templateUrl: './mandate-training.component.html',
  styleUrl: './mandate-training.component.css'
})
export class MandateTrainingComponent {
  public vendorName: string = '';
  public businessDate: string = '';

  confirmed = false;

  constructor(public activeModal: NgbActiveModal) { }

  continue() {
    if (this.confirmed) {
      this.activeModal.close('confirmed');
    }
  }
}
