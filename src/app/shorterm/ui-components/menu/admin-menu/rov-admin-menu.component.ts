import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-rov-admin-menu',
  standalone: false,
  templateUrl: './rov-admin-menu.component.html',
  styleUrls: ['./rov-admin-menu.component.css']
})
export class RovAdminMenuComponent {
  constructor(private router: Router) {}

  gotoAssocMaint() {
    this.router.navigate(['/rov/rassocmaint']);
  }

  gotoItemBtnMenu() {
    this.router.navigate(['/rov/ritembtnmenu']);
  }

  gotoSplInstr() {
    this.router.navigate(['/rov/rsplinstr']);
  }
}
