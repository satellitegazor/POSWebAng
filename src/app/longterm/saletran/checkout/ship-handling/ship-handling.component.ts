import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PosCurrencyDirective } from '../../../../directives/pos-currency.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalesTranService } from '../../services/sales-tran.service';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Store } from '@ngrx/store';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import { getTktObjSelector } from '../../store/ticketstore/ticket.selector';

@Component({
  selector: 'app-ship-handling',
  imports: [FormsModule, PosCurrencyDirective],
  templateUrl: './ship-handling.component.html',
  styleUrl: './ship-handling.component.css'
})
export class ShipHandlingComponent {
  dfltCurrSymbl = '€';
  shipHandlingAmountUIVal: number | null = null;
  shipHandlingTaxPctUIVal: number | null = null;
  isOConusLocation: boolean = false;

  shipHandlingAmountDC: number = 0;
  shipHandlingTaxDC: number = 0;
  shipHandlingAmountFC: number = 0;
  shipHandlingTaxFC: number = 0;

  constructor(private modal: NgbModal, private _saleTranSvc: SalesTranService, 
    private _logonDataSvc: LogonDataService,
    private _store: Store<saleTranDataInterface>, 
    private router: Router, private utilSvc: UtilService) {
      this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
  }
  
  ngOnInit(): void {
    var locCnfg = this._logonDataSvc.getLocationConfig();
    this.dfltCurrSymbl = this.utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) ?? '';

    this._store.select(getTktObjSelector).subscribe(tktObj => {
      if(tktObj) {
        this.shipHandlingAmountUIVal =  this.dfltCurrSymbl == '$' ? tktObj.shipHandling : tktObj.shipHandlingFC ?? 0;
        this.shipHandlingTaxPctUIVal = this.dfltCurrSymbl == '$' ? (tktObj.shipHandlingTaxAmt / tktObj.shipHandling) * 100 : (tktObj.shipHandlingFC ? (tktObj.shipHandlingTaxAmtFC / tktObj.shipHandlingFC) * 100 : 0);
      }
    });
  }
  Continue() {
    // TODO: wire into checkout flow
    if(this.dfltCurrSymbl == '$') {
      this.shipHandlingAmountDC = this.shipHandlingAmountUIVal ?? 0;
      this.shipHandlingTaxDC = (this.shipHandlingTaxPctUIVal ?? 0) > 0 ? (this.shipHandlingAmountDC * (this.shipHandlingTaxPctUIVal ?? 0) / 100) : 0;
    } else {
      this.shipHandlingAmountFC = this.shipHandlingAmountUIVal ?? 0;
      this.shipHandlingTaxFC = (this.shipHandlingTaxPctUIVal ?? 0) > 0 ? (this.shipHandlingAmountFC * (this.shipHandlingTaxPctUIVal ?? 0) / 100) : 0;
    }
  }

  Cancel() {
    // TODO: close dialog
  }

}
