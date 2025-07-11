import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CouponType } from 'src/app/global/global.constants';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { LocationConfig } from '../../models/location-config';
import { SalesTransactionCheckoutItem } from '../../models/salesTransactionCheckoutItem';
import { updateSaleitems, updateTaxExempt } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsSelector, getTicketTotals, getTktObjSelector } from '../../store/ticketstore/ticket.selector';
import { tktObjInitialState, saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { CouponsModalDlgComponent } from '../coupons/coupons.component';
import { TipsModalDlgComponent } from '../tips-modal-dlg/tips-modal-dlg.component';
import { currSymbls } from 'src/app/models/CurrencySymbols';

@Component({
    selector: 'app-checkout-items',
    templateUrl: './checkout-items.component.html',
    styleUrls: ['./checkout-items.component.css'],
    standalone: false
})
export class CheckoutItemsComponent implements OnInit {

  constructor(private _store: Store<saleTranDataInterface>, 
    private _logonDataSvc: LogonDataService,
    private _modalService: NgbModal,
    private _router: Router) { }

  allowTips: boolean = false;
  tktDtlItems: SalesTransactionCheckoutItem[] = [];
  locationConfig: LocationConfig = {} as LocationConfig;

  subTotal: number = 0;
  exchCpnTotal: number = 0;
  saleTaxTotal: number = 0;
  tipsTotal: number = 0;
  grandTotal: number = 0;
  totalSavings: number = 0;
  vndDiscountTotal: number = 0;
  taxExempt: boolean = false;


  public dfltCurrSymbl: string = '$'
  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'


  ngOnInit(): void {

    this.locationConfig = this._logonDataSvc.getLocationConfig();
    this.allowTips = this._logonDataSvc.getAllowTips();

    this._store.select(getCheckoutItemsSelector).subscribe(saleItems => {
      this.tktDtlItems = saleItems == null ? [] : saleItems;

      this.updateCheckoutTotals();
    })

    this.dfltCurrSymbl = currSymbls.find(x => x.key == this._logonDataSvc.getDfltCurrCode())?.value ?? '$'; 
    this.exchRate = this._logonDataSvc.getExchangeRate();
    this.dfltCurrCode = this._logonDataSvc.getDfltCurrCode();
    
    this._store.select(getTicketTotals).subscribe(tktTotals => {
      this.subTotal = tktTotals.subTotalDC;
      this.exchCpnTotal = tktTotals.totalExchCpnAmtDC;
      this.grandTotal = tktTotals.grandTotalDC;
      this.totalSavings = tktTotals.totalSavingsDC??0;
      this.saleTaxTotal = tktTotals.totalTaxDC??0;
      this.tipsTotal = tktTotals.tipTotalDC;
    })



  }

  TaxExemptChanged() {
    this._store.dispatch(updateTaxExempt({taxExempt: this.taxExempt}));
  }

  btnAddRemove() {
    this._router.navigateByUrl('/salestran');
  }

  btnCancelClicked() {
    this._router.navigateByUrl('/salestran');
  }

  public updateCheckoutTotals() {

    this.subTotal = 0;
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

      this.subTotal += subTotal;
      this.exchCpnTotal += exchCpnTotal;
      this.saleTaxTotal += saleTaxTotal;
      this.vndDiscountTotal += vndDiscountTotal;

      var checkOutItem: SalesTransactionCheckoutItem = {...this.tktDtlItems[k]};
      checkOutItem.lineItemDollarDisplayAmount = Number(Number(subTotal - exchCpnTotal - vndDiscountTotal + saleTaxTotal).toFixed(2));
      checkOutItem.lineItemTaxAmount = Number(Number(saleTaxTotal).toFixed(2));
      checkOutItem.discountAmount = Number(Number(exchCpnTotal + vndDiscountTotal).toFixed(2));

    }
    this.grandTotal = Number(Number(this.subTotal - this.exchCpnTotal + this.saleTaxTotal).toFixed(2));
    this.totalSavings = Number(Number(this.exchCpnTotal + this.vndDiscountTotal).toFixed(2));

  }

  public DisplayVendorDiscPopUp(saleItemId: number, tktDetailId: number, itemName: string) {
    const modalRef = this._modalService.open(CouponsModalDlgComponent);
    
      modalRef.componentInstance.SaleItemId = saleItemId;
      modalRef.componentInstance.TktDtlId = tktDetailId;
      modalRef.componentInstance.ItemName = itemName;
      modalRef.componentInstance.DiscountName = "Vendor Discount";
      modalRef.componentInstance.Title = "Vendor Coupon";
      modalRef.componentInstance.CpnType = CouponType.vndCpnItem;
    
  }

  public DisplayExchDiscPopUp(saleItemId: number, tktDetailId: number, itemName: string) {
    const modalRef = this._modalService.open(CouponsModalDlgComponent);
    
    modalRef.componentInstance.SaleItemId = saleItemId;
    modalRef.componentInstance.TktDtlId = tktDetailId;
    modalRef.componentInstance.ItemName = itemName;
    modalRef.componentInstance.DiscountName = "Exchange Discount";
    modalRef.componentInstance.Title = "Exchange Coupon";
    modalRef.componentInstance.CpnType = CouponType.exchCpnItem;
    
  }
  public DisplayExchTranDiscPopUp() {
    const modalRef = this._modalService.open(CouponsModalDlgComponent);
      modalRef.componentInstance.DiscountName = "Exchange Discount";
      modalRef.componentInstance.Title = "Exchange Coupon";
      modalRef.componentInstance.CpnType = CouponType.exchCpnTran;
   
  }

  public DisplayTipsPopUp() {
    const modalRef = this._modalService.open(TipsModalDlgComponent)
    modalRef.componentInstance.tndrCode = "";    
  }
}
