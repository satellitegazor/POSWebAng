import { Component, OnInit } from '@angular/core';
import { ModalRef } from '@independer/ng-modal';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { upsertSaleItemExchCpn, upsertSaleItemVndCpn } from '../../store/ticketstore/ticket.action';
import { tktObjInterface } from '../../store/ticketstore/ticket.state';

@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css']
})
export class CouponsModalDlgComponent implements OnInit {

  public Title: string = "";
  public ItemName: string = "";
  public SaleItemId: number = 0;
  public TktDtlId: number = 0;
  public DiscountName: string = "";
  public DiscountPct: number = 0;
  public DiscountAmt: number = 0;
  public IsItemExchCoupon: boolean = false;

  constructor(private modal: ModalRef, private logonDataSvc: LogonDataService, private _store: Store<tktObjInterface>) { }

  ngOnInit(): void {

  }


  public Apply() {
    if(this.IsItemExchCoupon) {
      this._store.dispatch(upsertSaleItemExchCpn({logonDataSvc: this.logonDataSvc, saleItemId: this.SaleItemId, tktDtlId: this.TktDtlId, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
    }
    else {
      this._store.dispatch(upsertSaleItemVndCpn({logonDataSvc: this.logonDataSvc, saleItemId: this.SaleItemId, tktDtlId: this.TktDtlId, cpnPct: this.DiscountPct, cpnAmt: this.DiscountAmt}));
    }
    this.modal.close('');
  }

  public Cancel() {
    this.modal.close('');
  }

  public percentChanged() {
    this.DiscountAmt = 0;
  }

  public amountChanged() {
    this.DiscountPct = 0;
  }

}
