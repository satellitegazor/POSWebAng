import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SalesTransactionCheckoutItem } from 'src/app/longterm/models/salesTransactionCheckoutItem';
import { saleTranDataInterface } from '../../store/ticketstore/rticket.state';
import { Store } from '@ngrx/store';
import { addSaleItem, saveTicketDetail, updateCheckoutTotals } from '../../store/ticketstore/ticket.action';
import { DailyExchRate } from 'src/app/models/exchange.rate';
import { CPOSAppType, UtilService } from 'src/app/services-misc/util.service';
import { PosCurrencyDirective } from 'src/app/directives/pos-currency.directive';
import { PosCurrency3Directive } from 'src/app/directives/pos-currency.directive.3';
import { GlobalConstants } from 'src/app/global/global.constants';
import { LogonDataService } from 'src/app/global/logon-data-service.service';

interface MiscDeptOption {
  id: number;
  name: string;
}

interface AddMiscItemDialogResult {
  departmentId: number;
  itemDescription: string;
  price: number;
  taxPct: number;
  envTaxPct: number;
  tags: number;
}

@Component({
  selector: 'app-rov-add-misc-item-dlg',
  standalone: true,
  imports: [CommonModule, FormsModule, PosCurrencyDirective, PosCurrency3Directive],
  templateUrl: './rov-add-misc-item-dlg.component.html',
  styleUrls: ['./rov-add-misc-item-dlg.component.css']
})
export class RovAddMiscItemDlgComponent {

  data: unknown;
  public allSaleItems: SalesTransactionCheckoutItem[] = [];
  public dailyExchRate: DailyExchRate = {} as DailyExchRate;

  showEnvTax = false;
  showTags = false;

  selectedDepartmentId = 0;
  itemDescription = '';
  price: number | null = null;
  taxPct: number | null = null;
  envTaxPct: number | null = null;
  tags: number | null = null;
  defaultCurrSymbl: string = '$';

  public transactionId: number = 0;
  public individualId: number = 0;

  constructor(private activeModal: NgbActiveModal,
    private _store: Store<saleTranDataInterface>,
    private _utilSvc: UtilService,
    private _logonDataSvc: LogonDataService) { }

  ngOnInit(): void {
    this.defaultCurrSymbl = this._utilSvc.currencySymbols.get(this.dailyExchRate.dfltCurrCode) || '$';
  }

  get departmentOptions(): MiscDeptOption[] {
    const rawData = this.data as any;
    const source = Array.isArray(rawData) ? rawData : Array.isArray(rawData?.departmentNames) ? rawData.departmentNames : [];

    return source.map((item: any, index: number) => {
      if (typeof item === 'string') {
        return { id: index + 1, name: item };
      }

      return {
        id: Number(item?.departmentUID ?? item?.id ?? index + 1),
        name: String(item?.departmentName ?? item?.name ?? '').trim()
      };
    }).filter((opt: MiscDeptOption) => opt.name.length > 0);
  }

  confirm(): void {
    const result: AddMiscItemDialogResult = {
      departmentId: this.selectedDepartmentId,
      itemDescription: this.itemDescription.trim(),
      price: this.price ?? 0,
      taxPct: this.taxPct ?? 0,
      envTaxPct: this.envTaxPct ?? 0,
      tags: this.tags ?? 0
    };



    try {

      let newMiscItem = SalesTransactionCheckoutItem.deepCopy(this.allSaleItems.filter(itm => itm.departmentUID === result.departmentId)[0]);
      newMiscItem.departmentUID = result.departmentId;
      newMiscItem.salesItemDesc = result.itemDescription;
      newMiscItem.unitPrice = this.defaultCurrSymbl == '$' ? result.price : parseFloat((result.price / this.dailyExchRate.exchangeRate).toCPOSFixed(2));
      newMiscItem.fcUnitPrice = this.defaultCurrSymbl == '$' ? parseFloat((result.price * this.dailyExchRate.exchangeRate).toCPOSFixed(2)) : result.price;
      newMiscItem.salesTaxPct = result.taxPct;
      newMiscItem.envrnmtlTaxPct = result.envTaxPct;
      newMiscItem.noOfTags = result.tags;
      newMiscItem.isMiscellaneous = true;
      newMiscItem.salesItemUID = -1 * new Date().getTime() % 1000; // Generate a temporary unique ID for the misc item (negative to avoid conflicts with real items)
      newMiscItem.quantity = 1;
      newMiscItem.couponLineItemDollarAmount = 0;
      newMiscItem.discountAmount = 0;
      newMiscItem.fcCouponLineItemDollarAmount = 0;
      newMiscItem.fcDiscountAmount = 0;
      newMiscItem.ticketDetailId = -1 * new Date().getTime() % 1000; // Generate a temporary unique ID for the ticket detail (negative to avoid conflicts with real items)


      this._store.dispatch(addSaleItem({ saleItem: newMiscItem, defCurrSymbl: this.defaultCurrSymbl, dailyExchRateObj: this.dailyExchRate }));

      if (this.transactionId > 0) {
        // If transactionId is present, means ticket is already saved once and we are adding item to existing ticket, so we need to update served by associate for the new item
        const individualUid = this.individualId;
        this._store.dispatch(saveTicketDetail({
          uid: individualUid,
          appType: CPOSAppType.LongTerm,
          request: {
            appType: CPOSAppType.LongTerm,
            transactionId: this.transactionId,
            ticketDetailId: newMiscItem.ticketDetailId,
            salesItemUID: newMiscItem.salesItemUID,
            seqNbr: 0,
            itemDescription: newMiscItem.salesItemDesc,
            quantity: newMiscItem.quantity,
            unitPrice: newMiscItem.unitPrice,
            fcUnitPrice: newMiscItem.fcUnitPrice,
            salesTaxPct: newMiscItem.salesTaxPct,
            envTaxPct: newMiscItem.envrnmtlTaxPct,
            discountAmount: newMiscItem.discountAmount,
            fcDiscountAmount: newMiscItem.fcDiscountAmount,
            couponLineItemDollarAmount: newMiscItem.couponLineItemDollarAmount,
            fcCouponLineItemDollarAmount: newMiscItem.fcCouponLineItemDollarAmount,
            lineItemDollarDisplayAmount: newMiscItem.lineItemDollarDisplayAmount,
            fcLineItemDollarDisplayAmount: newMiscItem.fcLineItemDollarDisplayAmount,
            lineItemTaxAmount: newMiscItem.lineItemTaxAmount,
            fcLineItemTaxAmount: newMiscItem.fcLineItemTaxAmount,
            lineItemEnvTaxAmount: newMiscItem.lineItemEnvTaxAmount,
            fcLineItemEnvTaxAmount: newMiscItem.fcLineItemEnvTaxAmount,
            lineItmKatsaCpnAmt: newMiscItem.lineItmKatsaCpnAmt,
            fcLineItmKatsaCpnAmt: newMiscItem.fcLineItmKatsaCpnAmt,
            deptUID: newMiscItem.departmentUID,
            srvdByAssocVal: newMiscItem.srvdByAssociateVal,
            isMisc: newMiscItem.isMiscellaneous,
            isFulfilled: false,
            isForeignCurr: this.defaultCurrSymbl != '$',
            isDefaultUSD: this.defaultCurrSymbl == '$',
            noOfTags: newMiscItem.noOfTags,
            maintUserId: individualUid,
            cliTimeVar: GlobalConstants.GetClientTimeVariance(),
            active: true
          }
        }));
      }

      this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc}));

    } finally {
      this.activeModal.close(result);
    }
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

}
