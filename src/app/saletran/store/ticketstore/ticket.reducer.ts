import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "src/app/global/global.constants";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj, addCustomerId, addNewCustomer, addTender, updateSaleitems, updateCheckoutTotals, addServedByAssociate, upsertAssocTips, delSaleitemZeroQty } from "./ticket.action";

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

      var newCheckOutItem = JSON.parse(JSON.stringify(action.saleItem));
      var _tktObj = { ...state.tktObj };
      var _totalSaleAmt = 0;
      _tktObj.tktList.forEach(k => {
         _totalSaleAmt += k.lineItemDollarDisplayAmount;
      })

      newCheckOutItem.ticketDetailId = _tktObj.tktList.length;

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
               if(itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
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
               if(itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId && itm.quantity > 1) {
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

      var updatedTktList: SalesTransactionCheckoutItem[] = JSON.parse(JSON.stringify([...state.tktObj.tktList]));
      let totalSale: number = 0;
      let totalSaleFC: number = 0;

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
   })
);



export function TktObjReducer(state: tktObjInterface, action: Action) {
   return _tktObjReducer(state, action);

}

