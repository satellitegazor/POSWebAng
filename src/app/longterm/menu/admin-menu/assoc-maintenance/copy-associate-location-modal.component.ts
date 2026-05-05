import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LTCOtherContractLocations } from '../../../models/location.associates';

@Component({
  selector: 'app-copy-associate-location-modal',
  templateUrl: './copy-associate-location-modal.component.html',
  styleUrls: ['./copy-associate-location-modal.component.css'],
  standalone: false
})
export class CopyAssociateLocationModalComponent {

    @Input() locations: LTCOtherContractLocations[] = [];
    @Input() selectedLocationUID: string = '';
    @Output() yes = new EventEmitter<string>();
    @Output() no = new EventEmitter<void>();

    constructor(public activeModal: NgbActiveModal) {}

    onYes() {
        this.activeModal.close(this.selectedLocationUID);
    }

    onNo() {
        this.activeModal.dismiss();
    }
}
