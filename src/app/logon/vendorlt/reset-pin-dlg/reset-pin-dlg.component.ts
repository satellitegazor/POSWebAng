import { Component } from '@angular/core';
import { LogonSvc } from '../../logonsvc.service';
import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reset-pin-dlg',
  imports: [FormsModule],
  templateUrl: './reset-pin-dlg.component.html',
  styleUrl: './reset-pin-dlg.component.css'
})
export class ResetPinDlgComponent {
  constructor(private modalRef: NgbActiveModal, 
    private logonSvc: LogonSvc, 
    private router: Router) { 

  }

public Cancel() {
    this.modalRef.dismiss();
}

public Logon() {

  if (!this.newpin || !this.verifypin) {
    alert('Please enter both PIN and Verify PIN');
    return;
  }

  if(this.newpin != this.verifypin) {
      alert('New Pin and Confirm Pin do not match.');
      return;
  } 

    this.modalRef.close({newPin: this.newpin});
  }
verifypin: string = '';
newpin: string = '';

}
