import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.css',
  standalone: false
})
export class MainMenuComponent {
  constructor(private router: Router) {}

  goToSalesTransaction(): void {
    this.router.navigate(['/salestran']);
  }

  goToReports(): void {
    this.router.navigate(['/reportsmenu']);
  }
}
