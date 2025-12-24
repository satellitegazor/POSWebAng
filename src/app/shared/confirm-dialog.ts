// confirm-dialog.component.ts
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-confirm-dialog',
    standalone: false,
    template: `
    <div class="modal-header">
      <h4 class="modal-title">Unsaved Changes</h4>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="activeModal.close()">Leave</button>
    </div>
  `
})
export class ConfirmDialogComponent {
    message: string = 'Are you sure?';

    constructor(public activeModal: NgbActiveModal) { }
}