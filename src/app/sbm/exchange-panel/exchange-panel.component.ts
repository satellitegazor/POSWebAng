import { Component, Input } from '@angular/core';
import { ContractsGroupedByExchange } from '../models/contract.models';

@Component({
  selector: 'app-exchange-panel',
  templateUrl: './exchange-panel.component.html',
  styleUrls: ['./exchange-panel.component.css'],
  standalone: false
})
export class ExchangePanelComponent {
  @Input() exchangeData!: ContractsGroupedByExchange;

  public get emailAddress(): string {
    return this.exchangeData?.sbmEmailAddr?.trim() || 'Click to add Email Address';
  }
}