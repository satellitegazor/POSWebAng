import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-menu',
  standalone: false,
  templateUrl: './admin-menu.component.html',
  styleUrl: './admin-menu.component.css'
})
export class AdminMenuComponent {
  constructor(private router: Router) {}

  gotoAssocMaint() {
    this.router.navigate(['/assocmaint']);
  }

  gotoItemBtnMenu() {
    this.router.navigate(['/itembtnmenu']);
  }

  gotoSplInstr() {
    this.router.navigate(['/splinstr']);
  }
}
