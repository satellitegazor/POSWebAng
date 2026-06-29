import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CouponType } from '../../../../../global/global.constants';
import { RovLogonDataService } from "../../../../rov-logon-data.service"
import { updateRovCheckoutTotals, upsertRovSaleItemExchCpn, upsertRovSaleItemVndCpn, upsertRovTranExchCpn } from '../../../../store/ticketstore/rticket.action';
import { RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { currSymbls } from '../../../../../models/CurrencySymbols';
import { ToastService, ToastType } from '../../../../../services-misc/toast.service';
import { ROV_POSTicketSplit } from "../../../../models/rticket.split"
import { getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { UtilService } from '../../../../../services-misc/util.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getTktObjSelector } from '../../../../../longterm/saletran/store/ticketstore/ticket.selector';

@Component({
    selector: 'app-rov-coupons',
    templateUrl: './rov-coupons.component.html',
    styleUrls: ['./rov-coupons.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class RovCouponsModalDlgComponent implements OnInit, AfterViewInit {

  @ViewChild('amountInput') amountInput!: ElementRef<HTMLInputElement>;

  public CpnType: CouponType = CouponType.exchCpnItem;
  public Title: string = "";
  public ItemName: string = "";
  public SaleItemId: number = 0;
  public TktDtlId: number = 0;
  public DiscountName: string = "";
  public DiscountPct: number = 0;
  public DiscountAmt: number = 0;
  public MaxDiscAmt: number = 0;

  constructor(private modal: NgbModal, 
    private rovLogonDataSvc: RovLogonDataService, 
    private _store: Store<RovSaleTranDataInterface>, 
    private toastSvc: ToastService,
    private _utilSvc: UtilService) { }

  public dfltCurrSymbl: string = '$'
  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'
  public isOconusLocation: boolean = false;
  tktObj: ROV_POSTicketSplit = {} as ROV_POSTicketSplit;
  //public CurrSymbl: string = '$';

  ngOnInit(): void {
    this.exchRate = this.rovLogonDataSvc.getExchangeRate();
    this.dfltCurrCode = this.rovLogonDataSvc.getDfltCurrCode();
    this.isOconusLocation = this.rovLogonDataSvc.getIsForeignCurr();

    this.dfltCurrSymbl =  this._utilSvc.currencySymbols.get(this.dfltCurrCode) ?? '$';

    this._store.select(getRTktObjSelector).subscribe(tktObj => {
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

  ngAfterViewInit(): void {
    // Delay focus slightly to ensure modal content is fully rendered and interactive.
    setTimeout(() => this.amountInput?.nativeElement?.focus(), 0);
  }


  public Apply() {
    if(!this.Validate()) {
      return;
    }
    switch(this.CpnType) {
      case(CouponType.exchCpnItem): {

        this._store.dispatch(upsertRovSaleItemExchCpn({logonDataSvc: this.rovLogonDataSvc, saleItemId: this.SaleItemId, tktDtlId: this.TktDtlId, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
      }
      break;
      case(CouponType.vndCpnItem):{
        this._store.dispatch(upsertRovSaleItemVndCpn({logonDataSvc: this.rovLogonDataSvc, saleItemId: this.SaleItemId, tktDtlId: this.TktDtlId, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
      }
      break;
      case(CouponType.exchCpnTran): {
        this._store.dispatch(upsertRovTranExchCpn({logonDataSvc: this.rovLogonDataSvc, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
      }
      break;
    }
    this._store.dispatch(updateRovCheckoutTotals({ logonDataSvc: this.rovLogonDataSvc }));
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
          : item.dCLineItemDollarDisplayAmount;

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
