import { compileDeclareNgModuleFromMetadata } from "@angular/compiler";
import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "src/app/global/global.constants";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj, addCustomerId, addNewCustomer, addTender, updateSaleitems, updateCheckoutTotals, addServedByAssociate, upsertAssocTips, delSaleitemZeroQty, updateTaxExempt, upsertSaleItemExchCpn, upsertSaleItemVndCpn } from "./ticket.action";

import { tktObjInitialState, tktObjInterface } from "./ticket.state";

export const _tktObjReducer = createReducer(
   tktObjInitialState,
   on(initTktObj, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            locationUID: action.locConfig.locationUID,
            individualUID: action.individualUID,
            cliTimeVar: GlobalConstants.GetClientTimeVariance(),
            transactionDate: new Date(Date.now())
         }
      }
   }),
   on(addSaleItem, (state, action) => {

      var newCheckOutItem: SalesTransactionCheckoutItem = JSON.parse(JSON.stringify(action.saleItem));
      var _tktObj = { ...state.tktObj };
      var _totalSaleAmt = 0;
      _tktObj.tktList.forEach(k => {
         _totalSaleAmt += k.lineItemDollarDisplayAmount;
      })

      newCheckOutItem.ticketDetailId = _tktObj.tktList.length;
      newCheckOutItem.lineItemTaxAmount = state.tktObj.taxExempted ? 0 : newCheckOutItem.unitPrice * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01;
      newCheckOutItem.lineItemDollarDisplayAmount = (newCheckOutItem.unitPrice * newCheckOutItem.quantity) + newCheckOutItem.lineItemTaxAmount;

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: [...state.tktObj?.tktList,
               newCheckOutItem],
            totalSale: _totalSaleAmt
         }
      };
   }),
   on(incSaleitemQty, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.map(itm => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
                  return {
                     ...itm,
                     quantity: itm.quantity + 1
                  }
               }
               else {
                  return itm;
               }
            })
         }
      }
   }),

   on(decSaleitemQty, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.map(itm => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId && itm.quantity > 1) {
                  return {
                     ...itm,
                     quantity: itm.quantity - 1
                  }
               }
               else {
                  return itm;
               }
            })
         }
      }

   }),

   on(delSaleitemZeroQty, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.filter(itm => (itm.salesItemUID != action.saleItemId && itm.ticketDetailId != action.tktDtlId))
         }
      }
   }),

   on(addCustomerId, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            customerId: action.custId
         }
      }
   }),
   on(addNewCustomer, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            customer: action.custObj,
            updateCustomer: true
         }
      }
   }),
   on(addTender, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: [...state.tktObj.ticketTenderList,
            action.tndrObj]
         }
      }
   }),

   on(updateCheckoutTotals, (state, action) => {

      let ExchCouponsAfterTax = action.logonDataSvc.getExchCouponAfterTax();
      let VendCouponsAfterTax = action.logonDataSvc.getVendorCouponAfterTax();

      var updatedTktList: SalesTransactionCheckoutItem[] = JSON.parse(JSON.stringify([...state.tktObj.tktList]));
      let totalSale: number = 0;
      let totalSaleFC: number = 0;

      const taxExepted = state.tktObj.taxExempted;

      for (let k = 0; k < updatedTktList.length; k++) {

         let subTotal = (updatedTktList[k].unitPrice * updatedTktList[k].quantity);
         let exchCpnTotal = (updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01;
         let saleTaxTotal = (updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01;
         let vndDiscountTotal = updatedTktList[k].discountAmount | 0;

         updatedTktList[k].lineItemDollarDisplayAmount = (subTotal - exchCpnTotal - vndDiscountTotal + saleTaxTotal);
         updatedTktList[k].lineItemTaxAmount = saleTaxTotal;
         updatedTktList[k].discountAmount = exchCpnTotal + vndDiscountTotal;

         totalSale += updatedTktList[k].lineItemDollarDisplayAmount;

         let subTotalFC = (updatedTktList[k].dCUnitPrice * updatedTktList[k].quantity);
         let exchCpnTotalFC = (updatedTktList[k].dCUnitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01;
         let saleTaxTotalFC = (updatedTktList[k].dCUnitPrice * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01;
         let vndDiscountTotalFC = updatedTktList[k].dCDiscountAmount | 0;

         updatedTktList[k].dCLineItemDollarDisplayAmount = (subTotalFC - exchCpnTotalFC - vndDiscountTotalFC + saleTaxTotalFC);
         updatedTktList[k].dCLineItemTaxAmount = saleTaxTotalFC;
         updatedTktList[k].dCDiscountAmount = exchCpnTotalFC + vndDiscountTotalFC;

         totalSaleFC += updatedTktList[k].dCLineItemDollarDisplayAmount;
      }

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList,
            totalSale: totalSale,
            totalSaleFC: totalSaleFC
         }
      }

   }),

   on(updateSaleitems, (state, action) => {

      const updatedTktList = state.tktObj.tktList.map(stateItem => stateItem.salesItemUID == action.item.salesItemUID ? action.item : stateItem);

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList
         }
      }
   }),

   on(addServedByAssociate, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.map(itm => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.indx) {
                  return {
                     ...itm,
                     srvdByAssociateVal: action.srvdById
                  }
               }
               else {
                  return itm;
               }
            })
         }
      }
   }),
   on(upsertAssocTips, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            associateTips: action.assocTipsList
         }
      }
   }),
   on(updateTaxExempt, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            taxExempted: action.taxExempt
         }
      }
   }),
   on(upsertSaleItemExchCpn, (state, action) => {

      let exchRate = action.logonDataSvc.getExchangeRate();
      let dfltCurr = action.logonDataSvc.getDfltCurrCode();
      let IsForeignCurr = action.logonDataSvc.getIsForeignCurr();
      let lineItemGrantTotal: number = 0, lineitemGrandTotalNDC: number = 0;
      let cpnPct = 0, exchDiscAmtDC = 0, exchDiscAmtNDC = 0;
      let tktItem: SalesTransactionCheckoutItem = state.tktObj.tktList.filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0];
      let updateCpn: boolean = false;

      let lineItemTaxAmount: number = 0;
      let lineItemEnvTaxAmount: number = 0;
      let lineItemDollarDisplayAmount: number = 0;

      let dCLineItemTaxAmount: number = 0;
      let fCLineItemEnvTaxAmount: number = 0;
      let dCCouponLineItemDollarAmount: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = tktItem.dCUnitPrice * tktItem.quantity;

      if (action.cpnPct > 0) {
         exchDiscAmtDC = lineItemGrantTotal * action.cpnPct / 100;
         exchDiscAmtNDC = lineitemGrandTotalNDC * action.cpnPct / 100;
      }

      if (state.tktObj.taxExempted) {
         lineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;

         dCLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;
      }

      if (state.tktObj.taxExempted) {
         lineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;
         lineItemDollarDisplayAmount = (lineItemGrantTotal) - exchDiscAmtDC;

         dCLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;
         dCCouponLineItemDollarAmount = (lineitemGrandTotalNDC) - exchDiscAmtDC;
      }
      else {
         if (action.logonDataSvc.getExchCouponAfterTax()) {
            lineItemTaxAmount = (lineItemGrantTotal) * tktItem.salesTaxPct / 100;
            lineItemEnvTaxAmount = (lineItemGrantTotal) * tktItem.envrnmtlTaxPct / 100;
            lineItemDollarDisplayAmount = (lineItemGrantTotal + lineItemTaxAmount + lineItemEnvTaxAmount) - exchDiscAmtDC;

            dCLineItemTaxAmount = (lineitemGrandTotalNDC) * tktItem.salesTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * tktItem.envrnmtlTaxPct / 100;
            dCCouponLineItemDollarAmount = (lineitemGrandTotalNDC + dCLineItemTaxAmount + fCLineItemEnvTaxAmount) - exchDiscAmtDC;
         }
         else {
            lineItemTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.salesTaxPct / 100;
            lineItemEnvTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.envrnmtlTaxPct / 100;
            lineItemDollarDisplayAmount = (lineItemGrantTotal + lineItemTaxAmount + lineItemEnvTaxAmount);

            dCLineItemTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.salesTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100;
            dCCouponLineItemDollarAmount = (lineitemGrandTotalNDC + dCLineItemTaxAmount + fCLineItemEnvTaxAmount);
         }
      }
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            updateCoupons: updateCpn,
            tktList: state.tktObj.tktList.map(itm => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
                  return {
                     ...itm,
                     exchangeCouponDiscountPct: itm.exchangeCouponDiscountPct > 0 ? action.cpnPct : itm.exchangeCouponDiscountPct,
                     lineItemDollarDisplayAmount: lineItemDollarDisplayAmount,
                     lineItemTaxAmount: lineItemTaxAmount,
                     lineItemEnvTaxAmount: lineItemEnvTaxAmount,

                     dCLineItemTaxAmount: dCLineItemTaxAmount,
                     fCLineItemEnvTaxAmount: fCLineItemEnvTaxAmount,
                     dCCouponLineItemDollarAmount: dCCouponLineItemDollarAmount,

                     exchCpnAmountDC: exchDiscAmtDC,
                     exchCpnAmountNDC: exchDiscAmtNDC,
                  }
               }
               else {
                  return {
                     ...itm
                  }
               }
            })
         }
      }
   }),
   on(upsertSaleItemVndCpn, (state, action) => {

      let exchRate = action.logonDataSvc.getExchangeRate();
      let dfltCurr = action.logonDataSvc.getDfltCurrCode();
      let IsForeignCurr = action.logonDataSvc.getIsForeignCurr();
      let lineItemGrantTotal: number = 0, lineitemGrandTotalNDC: number = 0;
      let cpnPct = 0, vndDiscAmtDC = 0, vndDiscAmtNDC = 0;
      let tktItem: SalesTransactionCheckoutItem = state.tktObj.tktList.filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0];
      let updateCpn: boolean = false;

      let lineItemTaxAmount: number = 0;
      let lineItemEnvTaxAmount: number = 0;
      let lineItemDollarDisplayAmount: number = 0;

      let dCLineItemTaxAmount: number = 0;
      let fCLineItemEnvTaxAmount: number = 0;
      let dCCouponLineItemDollarAmount: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = tktItem.dCUnitPrice * tktItem.quantity;

      if (action.cpnPct > 0) {
         vndDiscAmtDC = lineItemGrantTotal * action.cpnPct / 100;
         vndDiscAmtNDC = lineitemGrandTotalNDC * action.cpnPct / 100;
      }
      else if (action.cpnAmt > 0) {
         vndDiscAmtDC = action.cpnAmt;
         vndDiscAmtNDC = action.cpnAmt * action.logonDataSvc.getExchangeRate();
      }

      if (state.tktObj.taxExempted) {
         lineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;

         dCLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;
      }

      if (state.tktObj.taxExempted) {
         lineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;
         lineItemDollarDisplayAmount = lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC);

         dCLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;
         dCCouponLineItemDollarAmount = lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);
      }
      else {

         if (action.logonDataSvc.getVendorCouponAfterTax()) {
            lineItemTaxAmount = (lineItemGrantTotal) * tktItem.salesTaxPct / 100;
            lineItemEnvTaxAmount = (lineItemGrantTotal) * tktItem.envrnmtlTaxPct / 100;
            lineItemDollarDisplayAmount = (lineItemGrantTotal + lineItemTaxAmount + lineItemEnvTaxAmount) - (vndDiscAmtDC + tktItem.exchCpnAmountDC);

            dCLineItemTaxAmount = (lineitemGrandTotalNDC) * tktItem.salesTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * tktItem.envrnmtlTaxPct / 100;
            dCCouponLineItemDollarAmount = (lineitemGrandTotalNDC + dCLineItemTaxAmount + fCLineItemEnvTaxAmount) - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);

         } else {

            lineItemTaxAmount = (lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC)) * tktItem.salesTaxPct / 100;
            lineItemEnvTaxAmount = (lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC)) * tktItem.envrnmtlTaxPct / 100;
            lineItemDollarDisplayAmount = (lineItemGrantTotal + lineItemTaxAmount + lineItemEnvTaxAmount);

            dCLineItemTaxAmount = (lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC)) * tktItem.salesTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100;
            dCCouponLineItemDollarAmount = (lineitemGrandTotalNDC + dCLineItemTaxAmount + fCLineItemEnvTaxAmount);
         }
      }
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            updateCoupons: updateCpn,
            tktList: state.tktObj.tktList.map(itm => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
                  return {
                     ...itm,
                     exchangeCouponDiscountPct: itm.exchangeCouponDiscountPct > 0 ? action.cpnPct : itm.exchangeCouponDiscountPct,
                     lineItemDollarDisplayAmount: lineItemDollarDisplayAmount,
                     lineItemTaxAmount: lineItemTaxAmount,
                     lineItemEnvTaxAmount: lineItemEnvTaxAmount,

                     dCLineItemTaxAmount: dCLineItemTaxAmount,
                     fCLineItemEnvTaxAmount: fCLineItemEnvTaxAmount,
                     dCCouponLineItemDollarAmount: dCCouponLineItemDollarAmount,

                     vndCpnAmountDC: vndDiscAmtDC,
                     vndCpnAmountNDC: vndDiscAmtNDC,
                  }
               }
               else {
                  return {
                     ...itm
                  }
               }
            })
         }
      }
   })
);



export function TktObjReducer(state: tktObjInterface, action: Action) {
   return _tktObjReducer(state, action);

}

