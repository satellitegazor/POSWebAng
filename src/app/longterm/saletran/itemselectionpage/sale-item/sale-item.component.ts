import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { LogonDataService } from 'src/app/global/logon-data-service.service';
import { SharedSubjectService } from '../../../../shared-subject/shared-subject.service';
import { CheckoutItemsComponent } from '../../checkout/checkout-items/checkout-items.component';
import { SaleItem } from '../../../models/sale.item';
import { SalesTransactionCheckoutItem } from '../../../models/salesTransactionCheckoutItem';
import { addSaleItem, saveTicketDetail, updateCheckoutTotals, updateServedByAssociate } from '../../store/ticketstore/ticket.action';
import { getCheckoutItemsCount, getTranIdTicketNumber } from '../../store/ticketstore/ticket.selector';
import { saleTranDataInterface } from '../../store/ticketstore/ticket.state';
import { Observable, Subject } from 'rxjs';
import { CPOSAppType, UtilService } from 'src/app/services-misc/util.service';

 
@Component({
    selector: 'app-sale-item',
    templateUrl: './sale-item.component.html',
    styleUrls: ['./sale-item.component.css'],
    standalone: false
})
export class SaleItemComponent implements OnInit {

    constructor(private _logonDataSvc: LogonDataService, private _store: Store<saleTranDataInterface>, private _utilSvc: UtilService) { }
    @Input() saleItemList: SaleItem[] = [];
    @Input() salesItemListRefreshEvent: Observable<boolean> = new Observable<boolean>();
    activeId: number = 0;
    dcCurrSymbl: string = '';

    transactionId: number = 0;
    ticketNumber: number = 0;
    
    ngOnInit(): void {

      this.dcCurrSymbl = this._utilSvc.currencySymbols.get(this._logonDataSvc.getDfltCurrCode()) || '';
      if(this.saleItemList.length > 0) {
        this.activeId = this.saleItemList[0].salesItemID;
      }

      this.salesItemListRefreshEvent.subscribe(data => {
        //console.log('subscription called salesitmListRefresh: ' + data);
        if(data) {
          this.activeId = this.saleItemList[0].salesItemID;
        }
      });

      this._store.select(getTranIdTicketNumber).subscribe(data => {
        //console.log('tranId: ' + data.tranId + ' ticketNumber: ' + data.ticketNumber);
        this.transactionId = data.tranId;
        this.ticketNumber = data.ticketNumber;
      });
    }
    
    public salesItemClick(event: Event, itemId: number): void {
        
        const saleCheckoutItem = this.getSaleCheckOutItem(
          this.saleItemList.filter(itm => itm.salesItemID == itemId)[0]);

        saleCheckoutItem.srvdByAssociateText = this._logonDataSvc.getLTVendorLogonData().associateName;
        this._store.dispatch(addSaleItem({saleItem: saleCheckoutItem, defCurrSymbl: this.dcCurrSymbl, dailyExchRateObj: this._logonDataSvc.getDailyExchRate()}));       


        if(this.transactionId > 0) {
          // If transactionId is present, means ticket is already saved once and we are adding item to existing ticket, so we need to update served by associate for the new item
          const individualUid = Number(this._logonDataSvc.getLTVendorLogonData().individualUID || 0);
          this._store.dispatch(saveTicketDetail({
            uid: individualUid,
            appType: CPOSAppType.LongTerm,
            request: {
              appType: CPOSAppType.LongTerm,
              transactionId: this.transactionId,
              ticketDetailId: saleCheckoutItem.ticketDetailId,
              salesItemUID: saleCheckoutItem.salesItemUID,
              seqNbr: 0,
              itemDescription: saleCheckoutItem.salesItemDesc,
              quantity: saleCheckoutItem.quantity,
              unitPrice: saleCheckoutItem.unitPrice,
              fcUnitPrice: saleCheckoutItem.fcUnitPrice,
              salesTaxPct: saleCheckoutItem.salesTaxPct,
              envTaxPct: saleCheckoutItem.envrnmtlTaxPct,
              discountAmount: saleCheckoutItem.discountAmount,
              fcDiscountAmount: saleCheckoutItem.fcDiscountAmount,
              couponLineItemDollarAmount: saleCheckoutItem.couponLineItemDollarAmount,
              fcCouponLineItemDollarAmount: saleCheckoutItem.fcCouponLineItemDollarAmount,
              lineItemDollarDisplayAmount: saleCheckoutItem.lineItemDollarDisplayAmount,
              fcLineItemDollarDisplayAmount: saleCheckoutItem.fcLineItemDollarDisplayAmount,
              lineItemTaxAmount: saleCheckoutItem.lineItemTaxAmount,
              fcLineItemTaxAmount: saleCheckoutItem.fcLineItemTaxAmount,
              lineItemEnvTaxAmount: saleCheckoutItem.lineItemEnvTaxAmount,
              fcLineItemEnvTaxAmount: saleCheckoutItem.fcLineItemEnvTaxAmount,
              lineItmKatsaCpnAmt: saleCheckoutItem.lineItmKatsaCpnAmt,
              fcLineItmKatsaCpnAmt: saleCheckoutItem.fcLineItmKatsaCpnAmt,
              deptUID: saleCheckoutItem.departmentUID,
              srvdByAssocVal: saleCheckoutItem.srvdByAssociateVal,
              isMisc: saleCheckoutItem.isMiscellaneous,
              isFulfilled: false,
              isForeignCurr: this._logonDataSvc.getIsForeignCurr(),
              isDefaultUSD: this._logonDataSvc.getDfltCurrCode() == 'USD',
              noOfTags: saleCheckoutItem.noOfTags,
              maintUserId: individualUid,
              cliTimeVar: this._logonDataSvc.getLTVendorLogonData().cliTimeVar,
              active: true
            }
          }));
        }

        if(this._logonDataSvc.getAllowTips()) {
          
          this._store.dispatch(updateServedByAssociate({ saleItemId: saleCheckoutItem.salesItemUID, indx: 0, 
            indLocId: saleCheckoutItem.srvdByAssociateVal, srvdByAssociateName: saleCheckoutItem.srvdByAssociateText}))
        }
      this._store.dispatch(updateCheckoutTotals({ logonDataSvc: this._logonDataSvc }));
    }

    private getSaleCheckOutItem(si: SaleItem): SalesTransactionCheckoutItem {

      let coItm: SalesTransactionCheckoutItem = {} as SalesTransactionCheckoutItem;      
      coItm.allowPartPay = si.allowPartPay;
      coItm.allowSaveTkt = si.allowSaveTkt;
      coItm.businessFunctionUID = si.businessFunctionUID;
      coItm.couponLineItemDollarAmount = 0;
      coItm.custInfoReq = si.custInfoReq;

      coItm.departmentUID = si.departmentUID;
      coItm.deptName = si.departmentName;
      coItm.dtlMaintTimestamp = si.maintTimestamp;
      coItm.fcUnitPrice = si.price;
      coItm.fcCouponLineItemDollarAmount = 0;
      coItm.fcDiscountAmount = 0;
      coItm.fcLineItemDollarDisplayAmount = 0;
      coItm.fcLineItemTaxAmount = 0;
      coItm.facilityUID = si.facilityUID;
      coItm.fcCouponLineItemDollarAmount = 0;
      coItm.fcLineItemEnvTaxAmount = 0;
      coItm.fcLineItmKatsaCpnAmt = 0;

      coItm.exchangeCouponDiscountPct = 0;
      coItm.envrnmtlTaxPct = si.envTax != null ? si.envTax : 0;

      coItm.lineItemDollarDisplayAmount = 0;
      coItm.lineItemEnvTaxAmount = 0;
      coItm.lineItemTaxAmount = 0;
      coItm.lineItmKatsaCpnAmt = 0;
      coItm.locationUID = si.locationUID;

      coItm.noOfTags = si.noOfTags;
      coItm.openCashDrwForTips = si.openCashDrwForTips;
            
      coItm.quantity = 1;
      coItm.salesCategoryUID = si.salesCategoryID;
      coItm.salesItemDesc = si.salesItemDescription;
      coItm.salesItemUID = si.salesItemID;
      coItm.salesTaxPct = si.salesTax;

      coItm.srvdByAssociateText = this._logonDataSvc.getLTVendorLogonData().associateName;
      coItm.srvdByAssociateVal = +this._logonDataSvc.getLocationConfig().indLocUID;
      coItm.ticketDetailId = 0;

      coItm.unitPrice = si.price;
      coItm.vendorCouponDiscountPct = 0;

      coItm.exchCpnAmountDC = 0;
      coItm.exchCpnAmountNDC = 0;
      coItm.vndCpnAmountDC = 0;
      coItm.vndCpnAmountNDC = 0;

      //coItm.saleItemTotal = 0;
      
      return coItm;
  }


}
