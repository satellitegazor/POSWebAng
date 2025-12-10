import { Component, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { CouponType } from 'src/app/global/global.constants';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { upsertSaleItemExchCpn, upsertSaleItemVndCpn, upsertTranExchCpn } from '../../store/ticketstore/ticket.action';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { currSymbls } from 'src/app/models/CurrencySymbols';

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

  constructor(private modal: NgbModal, private logonDataSvc: LogonDataService, private _store: Store<saleTranDataInterface>) { }

  public dfltCurrSymbl: string = '$'
  public exchRate: number = 1;
  public dfltCurrCode: string = 'USD'

  ngOnInit(): void {
    this.exchRate = this.logonDataSvc.getExchangeRate();
    this.dfltCurrCode = this.logonDataSvc.getDfltCurrCode();

    this.dfltCurrSymbl = currSymbls.find(x => x.key == this.dfltCurrCode)?.value ?? '$';
  }


  public Apply() {
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
    this.modal.dismissAll('');
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
