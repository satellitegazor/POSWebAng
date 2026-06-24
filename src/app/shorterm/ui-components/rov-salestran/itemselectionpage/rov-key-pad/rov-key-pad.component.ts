import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosCurrencyDirective } from '../../../../../directives/pos-currency.directive';

@Component({
  selector: 'app-rov-key-pad',
  standalone: true,
  imports: [CommonModule, FormsModule, PosCurrencyDirective],
  templateUrl: './rov-key-pad.component.html',
  styleUrls: ['./rov-key-pad.component.css']
})
export class RovKeyPadComponent {

  saleItemPrice: number = 0;

  @Output() enterPressed = new EventEmitter<number>();

  appendDigit(digit: number): void {
    const currentCents = Math.round((this.saleItemPrice ?? 0) * 100);
    this.saleItemPrice = (currentCents * 10 + digit) / 100;
  }

  appendDoubleZero(): void {
    const currentCents = Math.round((this.saleItemPrice ?? 0) * 100);
    this.saleItemPrice = currentCents;
  }

  backspace(): void {
    const currentCents = Math.round((this.saleItemPrice ?? 0) * 100);
    this.saleItemPrice = Math.floor(currentCents / 10) / 100;
  }

  clear(): void {
    this.saleItemPrice = 0;
  }

  enter(): void {
    this.enterPressed.emit(this.saleItemPrice);
  }

}
