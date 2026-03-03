import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CouponType } from 'src/app/global/global.constants';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LocationConfig } from '../../../models/location-config';
import { SalesTransactionCheckoutItem } from '../../../models/salesTransactionCheckoutItem';
import { updateSaleitems, updateTaxExempt } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector, getTicketTotals, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInitialState, saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { CouponsModalDlgComponent } from '../coupons/coupons.component';
import { TipsModalDlgComponent } from '../tips-modal-dlg/tips-modal-dlg.component';
import { currSymbls } from 'src/app/models/CurrencySymbols';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-checkout-items',
  templateUrl: './checkout-items.component.html',
  styleUrls: ['./checkout-items.component.css'],
  standalone: false
})
export class CheckoutItemsComponent implements OnInit, OnChanges {

  modalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    centered: true
  };

  constructor(private _store: Store<saleTranDataInterface>,
    private _logonDataSvc: LogonDataService,
    private _modalService: NgbModal,
    private _router: Router,
    private _utilSvc: UtilService) { }

  allowTips: boolean = false;
  useShipHandling: boolean = false;
  tktDtlItems: SalesTransactionCheckoutItem[] = [];
  locationConfig: LocationConfig = {} as LocationConfig;

  subTotalDC: number = 0;
  subTotalNDC: number = 0;
  exchCpnTotal: number = 0;
  exchCpnTotalNDC: number = 0;
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

  shippingHandling: number = 0;
  shippingHandlingFC: number = 0

  isOConusLocation: boolean = false;

  dcCurrSymbl: string | undefined;
  ndcCurrSymbl: string | undefined;

  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'


  ngOnInit(): void {

    this.locationConfig = this._logonDataSvc.getLocationConfig();
    this.allowTips = this._logonDataSvc.getAllowTips();
    this.isOConusLocation = this._logonDataSvc.getIsForeignCurr();
    this.useShipHandling = this._logonDataSvc.getLocationConfig().useShipHndlng;

    this._store.select(getCheckoutItemsSelector).subscribe(saleItems => {
      this.tktDtlItems = (saleItems ?? []); //.slice().reverse(); // Reverse to display in correct order

      //this.calcCheckoutTotals();
      this.calculateTotals();
    });

    if(this.useShipHandling) {
      this._store.select(getTktObjSelector).subscribe(tktObj => {
        if(tktObj) {
          this.shippingHandling = tktObj.shipHandling;
          this.shippingHandlingFC = tktObj.shipHandlingFC ?? 0;
        }
      })  
    }


    this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode());
    this.ndcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getNonDfltCurrCode());

    this.exchRate = this._logonDataSvc.getExchangeRate();
    this.dfltCurrCode = this._logonDataSvc.getDfltCurrCode();
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

    this._store.select(getTicketTotals).subscribe(tktTotals => {
      this.subTotalDC = tktTotals.subTotalDC;
      this.subTotalNDC = tktTotals.subTotalNDC;
      this.exchCpnTotal = tktTotals.totalExchCpnAmtDC;
      this.exchCpnTotalNDC = tktTotals.totalExchCpnAmtNDC ?? 0;
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
    this._store.dispatch(updateTaxExempt({ taxExempt: this.taxExempt }));
  }

  btnAddRemove() {
    this._router.navigateByUrl('/salestran');
  }

  btnCancelClicked() {
    this._router.navigateByUrl('/salestran');
  }

  public calcCheckoutTotals() {

    this.subTotalDC = 0;
    this.exchCpnTotal = 0;
    this.saleTaxTotal = 0;
    this.tipsTotal = 0;
    this.grandTotal = 0;
    this.totalSavings = 0;

    for (let k = 0; k < this.tktDtlItems.length; k++) {

      let exchCpnTotal = Number(Number((this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity) * this.tktDtlItems[k].exchangeCouponDiscountPct * 0.01).toFixed(2));
      let saleTaxTotal = Number(Number((this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity) * this.tktDtlItems[k].salesTaxPct * 0.01).toFixed(2));
      let vndDiscountTotal = this.tktDtlItems[k].discountAmount | 0;
      let subTotal = Number(Number(this.tktDtlItems[k].unitPrice * this.tktDtlItems[k].quantity).toFixed(2));

      this.subTotalDC += subTotal;
      this.exchCpnTotal += exchCpnTotal;
      this.saleTaxTotal += saleTaxTotal;
      this.vndDiscountTotal += vndDiscountTotal;

      var checkOutItem: SalesTransactionCheckoutItem = { ...this.tktDtlItems[k] };
      checkOutItem.lineItemDollarDisplayAmount = checkOutItem.quantity * Number(Number(subTotal - exchCpnTotal - vndDiscountTotal + saleTaxTotal).toFixed(2));
      checkOutItem.lineItemTaxAmount = checkOutItem.quantity * Number(Number(saleTaxTotal).toFixed(2));
      checkOutItem.discountAmount = checkOutItem.quantity * Number(Number(exchCpnTotal + vndDiscountTotal).toFixed(2));

    }

    this.grandTotal = Number(Number(this.subTotalDC - this.exchCpnTotal + this.saleTaxTotal).toFixed(2));
    this.totalSavings = Number(Number(this.exchCpnTotal + this.vndDiscountTotal).toFixed(2));
  }

  public DisplayVendorDiscPopUp(saleItemId: number, tktDetailId: number, itemName: string, vndCpnAmountDC: number, vendorCouponDiscountPct: number,
    MaxDiscAmt: number) {
    const modalRef = this._modalService.open(CouponsModalDlgComponent, this.modalOptions);

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

    const modalRef = this._modalService.open(CouponsModalDlgComponent, this.modalOptions);

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

    const modalRef = this._modalService.open(CouponsModalDlgComponent, this.modalOptions);
    modalRef.componentInstance.DiscountName = "Exchange Discount";
    modalRef.componentInstance.Title = "Exchange Coupon";
    modalRef.componentInstance.CpnType = CouponType.exchCpnTran;
    modalRef.componentInstance.MaxDiscAmt = MaxDiscAmt;

  }

  public DisplayTipsPopUp() {
    const modalRef = this._modalService.open(TipsModalDlgComponent, this.modalOptions);
    modalRef.componentInstance.tndrCode = "";
  }
}
