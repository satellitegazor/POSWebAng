import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CouponType } from '../../../../../global/global.constants';
import { LogonDataService } from '../../../../../global/logon-data-service.service';
import { EventConfig } from '../../../../models/event.config';
import { Rov_SalesTranCheckoutItem } from '../../../../models/r-salestran-checkout-item';
import { updateRovSaleitems, updateRovTaxExempt } from "../../../../store/ticketstore/rticket.action"
import { getRCheckoutItemsSelector, getRTicketTotals, getRTktObjSelector } from '../../../../store/ticketstore/rticket.selector';
import { RovTktObjInitialState, RovSaleTranDataInterface } from '../../../../store/ticketstore/rticket.state';
import { RovCouponsModalDlgComponent } from '../coupons/rov-coupons.component';

import { currSymbls } from '../../../../../models/CurrencySymbols';
import { UtilService } from '../../../../../services-misc/util.service';
import { RovShipHandlingComponent } from '../ship-handling/rov-ship-handling.component';
import { RovLogonDataService } from '../../../../rov-logon-data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rov-checkout-items',
  templateUrl: './rov-checkout-items.component.html',
  styleUrls: ['./rov-checkout-items.component.css'],    
  imports: [CommonModule, FormsModule, RovCouponsModalDlgComponent, RovShipHandlingComponent]
})
export class RovCheckoutItemsComponent implements OnInit, OnChanges {

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };


  constructor(private _store: Store<RovSaleTranDataInterface>,
    private _rovLogonDataSvc: RovLogonDataService,
    private _modalService: NgbModal,
    private _router: Router,
    private _utilSvc: UtilService) { }

  
  useShipHandling: boolean = false;
  tktDtlItems: Rov_SalesTranCheckoutItem[] = [];
  evtConfig: EventConfig = {} as EventConfig;

  subTotalDC: number = 0;
  subTotalNDC: number = 0;
  tranExchCpnAmtDC: number = 0;
  tranExchCpnAmtNDC: number = 0;
  saleTaxTotal: number = 0;
  saleTaxTotalNDC: number = 0;
  tipsTotal: number = 0;
  tipsTotalNDC: number = 0;
  grandTotal: number = 0;
  grandTotalNDC: number = 0;
  totalSavings: number = 0;
  totalSavingsNDC: number = 0;
  vndDiscountTotal: number = 0;
  taxExempt: boolean = false;

  shipHandlingDC: number = 0;
  shipHandlingNDC: number = 0;
  shipHandlingTaxAmtDC: number = 0;
  shipHandlingTaxAmtNDC: number = 0;

  isOConusLocation: boolean = false;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;

  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'


  ngOnInit(): void {

    this.evtConfig = this._rovLogonDataSvc.getRovEventConfig();
    this.isOConusLocation = this._rovLogonDataSvc.getIsForeignCurr();
    this.useShipHandling = this._rovLogonDataSvc.getRovEventConfig().useShipHndlng;
    this.exchRate = this._rovLogonDataSvc.getExchangeRate();
    this.dfltCurrCode = this._rovLogonDataSvc.getDfltCurrCode();
    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this.dfltCurrCode);
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._rovLogonDataSvc.getNonDfltCurrCode());

    this._store.select(getRCheckoutItemsSelector).subscribe(saleItems => {
      this.tktDtlItems = (saleItems ?? []); //.slice().reverse(); // Reverse to display in correct order

      //this.calcCheckoutTotals();
      this.calculateTotals();
    });

    if(this.useShipHandling) {
      this._store.select(getRTktObjSelector).subscribe(tktObj => {
        if(tktObj) {
          this.shipHandlingDC = this.dfltCurrCode == 'USD' ? tktObj.shipHandling : tktObj.shipHandlingFC;
          this.shipHandlingTaxAmtDC = this.dfltCurrCode == 'USD' ? tktObj.shipHandlingTaxAmt : tktObj.shipHandlingTaxAmtFC ?? 0;
          this.shipHandlingNDC = this.dfltCurrCode != 'USD' ? tktObj.shipHandling : tktObj.shipHandlingFC;
          this.shipHandlingTaxAmtNDC = this.dfltCurrCode != 'USD' ? tktObj.shipHandlingTaxAmt : tktObj.shipHandlingTaxAmtFC ?? 0;
        }
      })  
    }



  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tktDtlItems'] && !changes['tktDtlItems'].firstChange) {
      this.calculateTotals();
    }
  }

  private calculateTotals(): void {
    if (!this.tktDtlItems || this.tktDtlItems.length === 0) {
      return;
    }

    this._store.select(getRTicketTotals).subscribe(tktTotals => {
      this.subTotalDC = tktTotals.subTotalDC;
      this.subTotalNDC = tktTotals.subTotalNDC;
      this.tranExchCpnAmtDC = tktTotals.tranExchCpnAmtDC;
      this.tranExchCpnAmtNDC = tktTotals.tranExchCpnAmtNDC ?? 0;
      this.grandTotal = tktTotals.grandTotalDC;
      this.grandTotalNDC = tktTotals.grandTotalNDC;
      this.totalSavings = tktTotals.totalSavingsDC ?? 0;
      this.totalSavingsNDC = tktTotals.totalSavingsNDC ?? 0;
      this.saleTaxTotal = tktTotals.totalTaxDC ?? 0;
      this.saleTaxTotalNDC = tktTotals.totalTaxNDC ?? 0;
      this.tipsTotal = tktTotals.tipTotalDC;
      this.tipsTotalNDC = tktTotals.tipTotalNDC ?? 0;
    })
  }

  TaxExemptChanged() {
    this._store.dispatch(updateRovTaxExempt({ taxExempt: this.taxExempt }));
  }

  btnAddRemove() {
    this._router.navigateByUrl('/rov/ritemsel');
  }

  btnCancelClicked() {
    this._router.navigateByUrl('/rov/ritemsel');
  }

  public calcCheckoutTotals() {

    this.subTotalDC = 0;
    this.tranExchCpnAmtDC = 0;
    this.saleTaxTotal = 0;
    this.tipsTotal = 0;
    this.grandTotal = 0;
    this.totalSavings = 0;

    for (let k = 0; k < this.tktDtlItems.length; k++) {

      let exchCpnTotal = Number(Number((this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity) * this.tktDtlItems[k].exchangeCouponDiscountPct * 0.01).toCPOSFixed(2));
      let saleTaxTotal = Number(Number((this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity) * this.tktDtlItems[k].salesTaxPct * 0.01).toCPOSFixed(2));
      let vndDiscountTotal = this.tktDtlItems[k].discountAmount | 0;
      let subTotal = Number(Number(this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity).toCPOSFixed(2));

      this.subTotalDC += subTotal;
      this.tranExchCpnAmtDC += exchCpnTotal;
      this.saleTaxTotal += saleTaxTotal;
      this.vndDiscountTotal += vndDiscountTotal;

      // var checkOutItem: SalesTransactionCheckoutItem = { ...this.tktDtlItems[k] };
      // checkOutItem.lineItemDollarDisplayAmount = checkOutItem.quantity * Number(Number(subTotal - exchCpnTotal - vndDiscountTotal + saleTaxTotal).toCPOSFixed(2));
      // checkOutItem.lineItemTaxAmount = checkOutItem.quantity * Number(Number(saleTaxTotal).toCPOSFixed(2));
      // checkOutItem.discountAmount = checkOutItem.quantity * Number(Number(exchCpnTotal + vndDiscountTotal).toCPOSFixed(2));

    }

    this.grandTotal = Number(Number(this.subTotalDC - this.tranExchCpnAmtDC + this.saleTaxTotal).toCPOSFixed(2));
    this.totalSavings = Number(Number(this.tranExchCpnAmtDC + this.vndDiscountTotal).toCPOSFixed(2));
  }

  public DisplayVendorDiscPopUp(saleItemId: number, tktDetailId: number, itemName: string, vndCpnAmountDC: number, vendorCouponDiscountPct: number,
    MaxDiscAmt: number) {
    const modalRef = this._modalService.open(RovCouponsModalDlgComponent, this.modalOptions);

    modalRef.componentInstance.SaleItemId = saleItemId;
    modalRef.componentInstance.TktDtlId = tktDetailId;
    modalRef.componentInstance.ItemName = itemName;
    modalRef.componentInstance.DiscountName = "Vendor Discount";
    modalRef.componentInstance.Title = "Vendor Coupon";
    modalRef.componentInstance.CpnType = CouponType.vndCpnItem;
    modalRef.componentInstance.DiscountPct = vendorCouponDiscountPct;
    modalRef.componentInstance.DiscountAmt = vndCpnAmountDC;
    modalRef.componentInstance.MaxDiscAmt = MaxDiscAmt;

  }

  public DisplayExchDiscPopUp(saleItemId: number, tktDetailId: number, itemName: string,
    exchCpnAmountUSD: number, exchangeCouponDiscountPct: number, MaxDiscAmt: number) {

    const modalRef = this._modalService.open(RovCouponsModalDlgComponent, this.modalOptions);

    modalRef.componentInstance.SaleItemId = saleItemId;
    modalRef.componentInstance.TktDtlId = tktDetailId;
    modalRef.componentInstance.ItemName = itemName;
    modalRef.componentInstance.DiscountName = "Exchange Discount";
    modalRef.componentInstance.Title = "Exchange Coupon";
    modalRef.componentInstance.CpnType = CouponType.exchCpnItem;
    modalRef.componentInstance.DiscountPct = exchangeCouponDiscountPct;
    modalRef.componentInstance.DiscountAmt = exchCpnAmountUSD;
    modalRef.componentInstance.MaxDiscAmt = MaxDiscAmt;

  }

  public DisplayExchTranDiscPopUp(MaxDiscAmt: number) {

    const modalRef = this._modalService.open(RovCouponsModalDlgComponent, this.modalOptions);
    modalRef.componentInstance.DiscountName = "Exchange Discount";
    modalRef.componentInstance.Title = "Exchange Coupon";
    modalRef.componentInstance.CpnType = CouponType.exchCpnTran;
    modalRef.componentInstance.MaxDiscAmt = MaxDiscAmt;

  }



  public DisplayShippingHandlingPopUp() {
    const modalRef = this._modalService.open(RovShipHandlingComponent, this.modalOptions);
  }
}
