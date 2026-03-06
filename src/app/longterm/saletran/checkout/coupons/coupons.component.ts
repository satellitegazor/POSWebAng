import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CouponType } from 'src/app/global/global.constants';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { updateCheckoutTotals, upsertSaleItemExchCpn, upsertSaleItemVndCpn, upsertTranExchCpn } from '../../store/ticketstore/ticket.action';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { currSymbls } from 'src/app/models/CurrencySymbols';
import { ToastService, ToastType } from 'src/app/services/toast.service';
import { TicketSplit } from 'src/app/models/ticket.split';
import { getTktObjSelector } from '../../store/ticketstore/ticket.selector';

@Component({
    selector: 'app-coupons',
    templateUrl: './coupons.component.html',
    styleUrls: ['./coupons.component.css'],
    standalone: false
})
export class CouponsModalDlgComponent implements OnInit {

  public CpnType: CouponType = CouponType.exchCpnItem;
  public Title: string = "";
  public ItemName: string = "";
  public SaleItemId: number = 0;
  public TktDtlId: number = 0;
  public DiscountName: string = "";
  public DiscountPct: number = 0;
  public DiscountAmt: number = 0;
  public MaxDiscAmt: number = 0;

  constructor(private modal: NgbModal, private logonDataSvc: LogonDataService, 
    private _store: Store<saleTranDataInterface>, private toastSvc: ToastService) { }

  public dfltCurrSymbl: string = '$'
  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'
  public isOconusLocation: boolean = false;
  tktObj: TicketSplit = {} as TicketSplit;
  public CurrSymbl: string = '$';

  ngOnInit(): void {
    this.exchRate = this.logonDataSvc.getExchangeRate();
    this.dfltCurrCode = this.logonDataSvc.getDfltCurrCode();
    this.isOconusLocation = this.logonDataSvc.getIsForeignCurr();

    this.dfltCurrSymbl = currSymbls.find(x => x.key == this.dfltCurrCode)?.value ?? '$';

    this._store.select(getTktObjSelector).subscribe(tktObj => {
      if(tktObj) {
        this.tktObj = tktObj;
        if(this.CpnType == CouponType.exchCpnTran) {
          this.DiscountAmt = this.tktObj.tCouponAmt ?? 0;
          this.DiscountPct = this.tktObj.tCouponPerc ?? 0;
        }
        else if(this.CpnType == CouponType.exchCpnItem) {
          if(this.tktObj.tCouponAmt > 0 || this.tktObj.tCouponPerc > 0) {
            this.toastSvc.show('The whole ticket exchange coupon has already been applied to this transaction. Only one exchange coupon can be applied per transaction.', "error");
            this.modal.dismissAll('');
          }
        }
      }
    });

  }


  public Apply() {
    if(!this.Validate()) {
      return;
    }
    switch(this.CpnType) {
      case(CouponType.exchCpnItem): {

        this._store.dispatch(upsertSaleItemExchCpn({logonDataSvc: this.logonDataSvc, saleItemId: this.SaleItemId, tktDtlId: this.TktDtlId, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
      }
      break;
      case(CouponType.vndCpnItem):{
        this._store.dispatch(upsertSaleItemVndCpn({logonDataSvc: this.logonDataSvc, saleItemId: this.SaleItemId, tktDtlId: this.TktDtlId, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
      }
      break;
      case(CouponType.exchCpnTran): {
        this._store.dispatch(upsertTranExchCpn({logonDataSvc: this.logonDataSvc, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
      }
      break;
    }
    this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this.logonDataSvc }));
    this.modal.dismissAll('');
  }

  public Validate(): boolean {
    if(this.DiscountPct <= 0 && this.DiscountAmt <= 0) {
      this.toastSvc.show('Please enter a discount amount or percentage value', "error");
      return false;
    }
    if(this.DiscountPct < 0 || this.DiscountAmt < 0) {
      this.toastSvc.show('Discount values cannot be negative', "error");
      return false;
    }
    if(this.DiscountPct > 100) {
      this.toastSvc.show('Discount percentage cannot be greater than 100', "error");
      return false;
    }
    if(this.CpnType != CouponType.exchCpnTran && this.DiscountAmt > this.MaxDiscAmt) {
      this.toastSvc.show('Discount amount cannot be greater than the maximum allowed', "error");
      return false;
    }

    if(this.CpnType == CouponType.exchCpnTran) {
      if (this.DiscountAmt > (this.MaxDiscAmt)) {
        this.toastSvc.show('Discount amount cannot be greater than the total transaction amount', "error");
        return false;
      }
      const items = this.tktObj?.tktList ?? [];
      if (items.length === 0) {
        this.toastSvc.show('No sale items available for exchange coupon', "error");
        return false;
      }

      const totalBaseDC = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      if (totalBaseDC <= 0) {
        this.toastSvc.show('Invalid sale item totals for exchange coupon', "error");
        return false;
      }

      const totalCouponDC = this.DiscountPct > 0
        ? 0
        : parseFloat((this.DiscountAmt * (this.dfltCurrCode === 'USD' ? 1 : this.exchRate)).toCPOSFixed(2));

      let remainingCouponDC = totalCouponDC;
      let remainingBaseDC = totalBaseDC;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemBaseDC = item.unitPrice * item.quantity;
        const isLast = i === items.length - 1;

        let itemDiscDC = 0;
        if (this.DiscountPct > 0) {
          itemDiscDC = parseFloat((itemBaseDC * this.DiscountPct / 100).toCPOSFixed(2));
        } else {
          if (!isLast) {
            itemDiscDC = parseFloat((totalCouponDC * (itemBaseDC / totalBaseDC)).toCPOSFixed(2));
            remainingCouponDC = parseFloat((remainingCouponDC - itemDiscDC).toCPOSFixed(2));
            remainingBaseDC = parseFloat((remainingBaseDC - itemBaseDC).toCPOSFixed(2));
          } else {
            itemDiscDC = parseFloat(remainingCouponDC.toCPOSFixed(2));
          }
        }

        const itemDisplay = this.dfltCurrCode === 'USD'
          ? item.lineItemDollarDisplayAmount
          : item.fcLineItemDollarDisplayAmount;

        if (itemDiscDC > itemDisplay) {
          this.toastSvc.show('Exchange coupon cannot be applied as it results in negative lineItemDollarDisplayAmount', "error");
          return false;
        }
      }

      return true;
    }

    return true;
  }

  public Cancel() {
    this.modal.dismissAll('');
  }

  public percentChanged() {
    this.DiscountAmt = 0;
  }

  public amountChanged() {
    this.DiscountPct = 0;
  }

}
