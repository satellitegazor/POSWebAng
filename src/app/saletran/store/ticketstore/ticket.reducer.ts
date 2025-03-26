import { state } from "@angular/animations";
import { compileDeclareNgModuleFromMetadata } from "@angular/compiler";
import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "src/app/global/global.constants";
import { AssociateSaleTips } from "src/app/models/associate.sale.tips";
import { LTC_Customer } from "src/app/models/customer";
import { TicketTender } from "src/app/models/ticket.tender";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj, addCustomerId, addNewCustomer, addTender, updateSaleitems, updateCheckoutTotals, updateServedByAssociate, upsertAssocTips, delSaleitemZeroQty, updateTaxExempt, upsertSaleItemExchCpn, upsertSaleItemVndCpn, upsertTranExchCpn, saveTicketSplitSuccess, resetTktObj, updateAssocInAssocTips, updatePartPayData, removeTndrWithSaveCode } from "./ticket.action";

import { tktObjInitialState, saleTranDataInterface } from "./ticket.state";

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

   on(removeTndrWithSaveCode, (state, action) => {
      let tndrCode: string = action.tndrCode;
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.filter(tndr => tndr.tenderTypeCode != tndrCode)
         }
      }

   }),

   

   on(resetTktObj, (state, action) => {

      let k: number = action.dummyNumber;
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: [] as SalesTransactionCheckoutItem[],
            ticketTenderList: [] as TicketTender[],
            associateTips: [] as AssociateSaleTips[],
            balanceDue: 0,
            cancelTransactionID: 0,
            customer: {} as LTC_Customer,
            customerId: 0,
            eventId: 0,
            instructions: '',
            isPartialPay: false,
            isRefund: false,
            orderFormNum: '',
            partialAmount: 0,
            partialAmountFC: 0,
            refundCode: '',
            refundReason: '',
            shipHandling: 0,
            shipHandlingFC: 0,
            shipHandlingTaxAmt: 0,
            shipHandlingTaxAmtFC: 0,
            taxExempted: false,
            tCouponAmt: 0,
            tCouponPerc: 0,
            tDCouponAmt: 0,
            totalSale: 0,
            totalSaleFC : 0,
            transactionID: 0,
            updateCoupons: false,
            updateCustomer: false,
         },
         tktTotals: {
            ...state.tktTotals,
            subTotalDC: 0,
            subTotalNDC: 0,
            grandTotalDC: 0,
            grandTotalNDC: 0,
            totalExchCpnAmtDC: 0,
            totalExchCpnAmtNDC: 0,
            totalSavingsDC: 0,
            totalSavingsNDC: 0,
            totalTaxDC: 0,
            totalTaxNDC: 0,
            tipTotalDC: 0,
            tipTotalNDC: 0
         }
      }
   }),
   on(addSaleItem, (state, action) => {

      var newCheckOutItem: SalesTransactionCheckoutItem = JSON.parse(JSON.stringify(action.saleItem));
      var _tktObj = { ...state.tktObj };
      var _totalSaleAmt = 0;
      let amtPaidDC: number = 0;
      let amtPaidNDC: number = 0;
      let lsubTotalDC: number = 0;
      let lsubTotalNDC: number = 0;
      let lgrandTotalDC: number = 0;
      let lgrandTotalNDC: number = 0;
      let ltotalExchCpnAmtDC: number = 0;
      let ltotalExchCpnAmtNDC: number = 0;
      let ltotalSavingsDC: number = 0;
      let ltotalSavingsNDC: number = 0;
      let ltotalTaxDC: number = 0;
      let ltotalTaxNDC: number = 0;

      var saleAssocAry: AssociateSaleTips[] = [];
      _tktObj.tktList.forEach(k => {
         _totalSaleAmt += k.lineItemDollarDisplayAmount;
         lgrandTotalDC += k.lineItemDollarDisplayAmount;
         lgrandTotalNDC += k.dCLineItemDollarDisplayAmount;
         ltotalExchCpnAmtDC += k.exchCpnAmountDC;
         ltotalExchCpnAmtNDC += k.exchCpnAmountNDC;
         ltotalSavingsDC += k.exchCpnAmountDC + k.dCDiscountAmount + k.lineItmKatsaCpnAmt;
         ltotalSavingsNDC += k.exchCpnAmountNDC + k.discountAmount + k.fCLineItmKatsaCpnAmt;
         ltotalTaxDC += k.lineItemTaxAmount + k.lineItemEnvTaxAmount;
         ltotalTaxNDC += k.dCLineItemTaxAmount + k.fCLineItemEnvTaxAmount;

         if(saleAssocAry.filter(assoc => assoc.indivLocId == k.srvdByAssociateVal).length > 0) {
            saleAssocAry.filter(assoc => assoc.indivLocId == k.srvdByAssociateVal).at(0)?.tipSaleItemIdList.push(k.salesItemUID);
         }
         else {
            let saleAssoc: AssociateSaleTips = new AssociateSaleTips();
            saleAssoc.indivLocId = k.srvdByAssociateVal;
            saleAssoc.firstName = k.srvdByAssociateText;
            saleAssoc.tipSaleItemIdList.push(k.salesItemUID);
            saleAssocAry.push(saleAssoc);
         }
      })


      newCheckOutItem.ticketDetailId = -1 * (_tktObj.tktList.length + 1);
      newCheckOutItem.lineItemTaxAmount = state.tktObj.taxExempted ? 0 : newCheckOutItem.unitPrice * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01;
      newCheckOutItem.lineItemDollarDisplayAmount = (newCheckOutItem.unitPrice * newCheckOutItem.quantity) + newCheckOutItem.lineItemTaxAmount;

      if(saleAssocAry.filter(assoc => assoc.indivLocId == newCheckOutItem.srvdByAssociateVal).length > 0) {
         saleAssocAry.filter(assoc => assoc.indivLocId == newCheckOutItem.srvdByAssociateVal).at(0)?.tipSaleItemIdList.push(newCheckOutItem.salesItemUID);
      }
      else {
         let saleAssoc: AssociateSaleTips = new AssociateSaleTips();
         saleAssoc.indivLocId = newCheckOutItem.srvdByAssociateVal;
         saleAssoc.tipSaleItemIdList.push(newCheckOutItem.salesItemUID);
         saleAssocAry.push(saleAssoc);
      }

      lgrandTotalDC += newCheckOutItem.lineItemDollarDisplayAmount;
      lgrandTotalNDC += newCheckOutItem.dCLineItemDollarDisplayAmount;
      ltotalExchCpnAmtDC += newCheckOutItem.exchCpnAmountDC;
      ltotalExchCpnAmtNDC += newCheckOutItem.exchCpnAmountNDC;
      ltotalSavingsDC += newCheckOutItem.exchCpnAmountDC + newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt;
      ltotalSavingsNDC += newCheckOutItem.exchCpnAmountNDC + newCheckOutItem.dCDiscountAmount + newCheckOutItem.fCLineItmKatsaCpnAmt;
      ltotalTaxDC += newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount;
      ltotalTaxNDC += newCheckOutItem.dCLineItemTaxAmount + newCheckOutItem.fCLineItemEnvTaxAmount;

      lsubTotalDC = lgrandTotalDC - ltotalTaxDC;
      lsubTotalNDC = lgrandTotalNDC - ltotalTaxNDC;

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: [...state.tktObj?.tktList,
               newCheckOutItem],
            totalSale: _totalSaleAmt,
            associateTips: saleAssocAry,
            //balanceDue: lsubTotalDC
         },
         tktTotals: {
            ...state.tktTotals,
            subTotalDC: lsubTotalDC,
            subTotalNDC: lsubTotalNDC,
            grandTotalDC: lgrandTotalDC,
            totalExchCpnAmtDC: ltotalExchCpnAmtDC,
            totalExchCpnAmtNDC: ltotalExchCpnAmtNDC,
            totalSavingsDC: ltotalSavingsDC,
            totalSavingsNDC: ltotalSavingsNDC,
            totalTaxDC: ltotalTaxDC,
            totalTaxNDC: ltotalTaxNDC,
            grandTotalNDC: lgrandTotalDC
         }
      };
   }),
   
   on(updateServedByAssociate, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.map(itm => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.indx) {
                  return {
                     ...itm,
                     srvdByAssociateVal: action.indLocId,
                     srvdByAssociateText: action.srvdByAssociateName
                  }
               }
               else {
                  return itm;
               }
            })
         }
      }
   }),

   on(updateAssocInAssocTips, (state, action) => {
      
      var assocTipsAry: AssociateSaleTips[] = [];

      state.tktObj.tktList.forEach(function(val: SalesTransactionCheckoutItem, indx: number) {
         
         let assocTips: AssociateSaleTips = new AssociateSaleTips();
         let aTips = assocTipsAry.filter(obj => obj.indivLocId == val.srvdByAssociateVal).at(0);         

         if(aTips) {
            assocTips = aTips;
            assocTips.tipSaleItemIdList.push(val.salesItemUID);
         }
         else {
            assocTips = new AssociateSaleTips();
            assocTips.indivLocId = val.srvdByAssociateVal;
            assocTips.tipSaleItemIdList.push(val.salesItemUID);
            assocTipsAry.push(assocTips)
         }         
      });

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            associateTips: assocTipsAry
         }
      }
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
            tktList: state.tktObj.tktList.filter(itm => (itm.salesItemUID != action.saleItemId && (action.tktDtlId == 0 || itm.ticketDetailId != action.tktDtlId)))
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
            action.tndrObj],
            transactionDate: new Date(Date.now())
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

         let subTotal = ((updatedTktList[k].unitPrice * updatedTktList[k].quantity) * 100) / 100;
         let exchCpnTotal = ((updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100;
         let saleTaxTotal = ((updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100;
         let vndDiscountTotal = (updatedTktList[k].discountAmount | 0 * 100) / 100;

         updatedTktList[k].lineItemDollarDisplayAmount = ((subTotal - exchCpnTotal - vndDiscountTotal + saleTaxTotal) * 100) / 100;
         updatedTktList[k].lineItemTaxAmount = saleTaxTotal;
         updatedTktList[k].discountAmount = exchCpnTotal + vndDiscountTotal;

         totalSale += updatedTktList[k].lineItemDollarDisplayAmount;

         let subTotalFC = ((updatedTktList[k].dCUnitPrice * updatedTktList[k].quantity) * 100) / 100;
         let exchCpnTotalFC = ((updatedTktList[k].dCUnitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100;
         let saleTaxTotalFC = ((updatedTktList[k].dCUnitPrice * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100;
         let vndDiscountTotalFC = (updatedTktList[k].dCDiscountAmount | 0 * 100) / 100;

         updatedTktList[k].dCLineItemDollarDisplayAmount = ((subTotalFC - exchCpnTotalFC - vndDiscountTotalFC + saleTaxTotalFC) * 100) / 100;
         updatedTktList[k].dCLineItemTaxAmount = (saleTaxTotalFC * 100) / 100;
         updatedTktList[k].dCDiscountAmount = (exchCpnTotalFC + vndDiscountTotalFC * 100) / 100;

         totalSaleFC += (updatedTktList[k].dCLineItemDollarDisplayAmount * 100) / 100;
      }

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList,
            totalSale: totalSale,
            totalSaleFC: totalSaleFC,
            //balanceDue: totalSale,
         }
      }

   }),

   on(updateSaleitems, (state, action) => {

      const updatedTktList = state.tktObj.tktList.map(stateItem => stateItem.salesItemUID == action.item.salesItemUID ? action.item : stateItem);
      let assocTips: AssociateSaleTips = new AssociateSaleTips();
      assocTips.indivLocId = action.item.srvdByAssociateVal;
      
      const updatedAssocSaleTips = state.tktObj.associateTips.map(stateTips => stateTips.indivLocId == action.item.srvdByAssociateVal ? stateTips : assocTips);

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList,
            associateTips: updatedAssocSaleTips
         }
      }
   }),

   on(upsertAssocTips, (state, action) => {

      let lineItemTotalDC = 0;
      let lineItemTotalNDC = 0;

      state.tktObj.tktList.forEach(function(val: SalesTransactionCheckoutItem) {
         lineItemTotalDC += val.lineItemDollarDisplayAmount;
         lineItemTotalNDC += val.dCLineItemDollarDisplayAmount;
      })

      

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            associateTips: action.assocTipsList,
            totalSale: lineItemTotalDC + action.totalTipAmtDC,
            totalSaleFC: lineItemTotalNDC + action.totalTipAmtNDC,
            tipAmountDC: action.totalTipAmtDC,
            tipAmountNDC: action.totalTipAmtNDC

         },
         tktTotals: {
            ...state.tktTotals,
            tipTotalDC: action.totalTipAmtDC,
            tipTotalNDC: action.totalTipAmtNDC,
            grandTotalDC: lineItemTotalDC + action.totalTipAmtDC,
            grandTotalNDC: lineItemTotalNDC + action.totalTipAmtNDC
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

      let dCLineItemTaxAmount: number = 0;
      let fCLineItemTaxAmount: number = 0;

      let lineItemEnvTaxAmount: number = 0;
      let fCLineItemEnvTaxAmount: number = 0;

      let lineItemDollarDisplayAmount: number = 0;
      let fCLineItemDollarDisplayAmount: number = 0;

      let totalSavingsDC: number = 0;
      let totalSavingsNDC: number = 0;

      let totalTaxDC: number = 0;
      let totalTaxNDC: number = 0;

      let subTotalDC: number = 0;
      let subTotalNDC: number = 0;

      let dCCouponLineItemDollarAmount: number = 0;
      let fCCouponLineItemDollarAmount: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = tktItem.dCUnitPrice * tktItem.quantity;

      if (action.cpnPct > 0) {
         exchDiscAmtDC = lineItemGrantTotal * action.cpnPct / 100;
         exchDiscAmtNDC = lineitemGrandTotalNDC * action.cpnPct / 100;
      }
      else {
         exchDiscAmtDC = action.cpnAmt;
         exchDiscAmtNDC = action.cpnAmt * exchRate;
      }

      if (state.tktObj.taxExempted) {
         dCLineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;

         dCLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;
      }

      if (state.tktObj.taxExempted) {
         dCLineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;
         lineItemDollarDisplayAmount = (lineItemGrantTotal) - exchDiscAmtDC;
         dCCouponLineItemDollarAmount = exchDiscAmtDC;

         fCLineItemEnvTaxAmount = 0;
         fCCouponLineItemDollarAmount = exchDiscAmtNDC;
      }
      else {
         if (action.logonDataSvc.getExchCouponAfterTax()) {
            dCLineItemTaxAmount = (lineItemGrantTotal) * tktItem.salesTaxPct / 100;
            lineItemEnvTaxAmount = (lineItemGrantTotal) * tktItem.envrnmtlTaxPct / 100;
            lineItemDollarDisplayAmount = (((lineItemGrantTotal + dCLineItemTaxAmount + lineItemEnvTaxAmount) - exchDiscAmtDC) * 100) / 100;

            fCLineItemTaxAmount = (lineitemGrandTotalNDC) * tktItem.salesTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * tktItem.envrnmtlTaxPct / 100;
            fCLineItemDollarDisplayAmount = ((lineitemGrandTotalNDC + fCLineItemTaxAmount + fCLineItemEnvTaxAmount - exchDiscAmtNDC) * 100) / 100;

         }
         else {
            dCLineItemTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.salesTaxPct / 100;
            lineItemEnvTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.envrnmtlTaxPct / 100;
            lineItemDollarDisplayAmount = (((lineItemGrantTotal + dCLineItemTaxAmount + lineItemEnvTaxAmount)) * 100) / 100;

            dCLineItemTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.salesTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100;
            fCLineItemDollarDisplayAmount = ((lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC) + fCLineItemTaxAmount + fCLineItemEnvTaxAmount) * 100) / 100;
         }

         dCCouponLineItemDollarAmount =  exchDiscAmtDC;
         fCCouponLineItemDollarAmount =  exchDiscAmtNDC;

         totalSavingsDC = dCCouponLineItemDollarAmount;
         totalSavingsNDC = fCCouponLineItemDollarAmount;

         state.tktObj.tktList.forEach(item => {
            if (item.salesItemUID != action.saleItemId && item.ticketDetailId != action.tktDtlId) {

               subTotalDC += lineItemGrantTotal;
               subTotalNDC += lineitemGrandTotalNDC;

               lineItemGrantTotal += (item.unitPrice * item.quantity);
               lineitemGrandTotalNDC += (item.unitPrice * item.quantity) * action.logonDataSvc.getExchangeRate();

               totalSavingsDC += item.exchCpnAmountDC + item.vndCpnAmountDC
               totalSavingsNDC += item.exchCpnAmountNDC + item.vndCpnAmountNDC
            }
            totalTaxDC += item.lineItemTaxAmount;
            totalTaxNDC += item.dCLineItemTaxAmount;

         });
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
                     exchangeCouponDiscountPct: Math.round((itm.exchangeCouponDiscountPct > 0 ? action.cpnPct : itm.exchangeCouponDiscountPct) * 100)/100,
                     lineItemDollarDisplayAmount: Math.round((lineItemDollarDisplayAmount + Number.EPSILON) * 100)/100,
                     lineItemTaxAmount: Math.round((dCLineItemTaxAmount + Number.EPSILON) * 100)/100,
                     lineItemEnvTaxAmount: Math.round((lineItemEnvTaxAmount + Number.EPSILON) * 100)/100,

                     dCLineItemTaxAmount: Math.round((dCLineItemTaxAmount + Number.EPSILON) * 100)/100,
                     fCLineItemEnvTaxAmount: Math.round((fCLineItemEnvTaxAmount + Number.EPSILON) * 100)/100,
                     dCCouponLineItemDollarAmount: Math.round((dCCouponLineItemDollarAmount + Number.EPSILON) * 100)/100,

                     exchCpnAmountDC: Math.round((exchDiscAmtDC + Number.EPSILON) * 100)/100,
                     exchCpnAmountNDC: Math.round((exchDiscAmtNDC + Number.EPSILON) * 100)/100,
                  }
               }
               else {
                  return {
                     ...itm
                  }
               }
            })
         },
         tktTotals: {
            ...state.tktTotals,
            grandTotalDC: Math.round((lineItemGrantTotal + Number.EPSILON) * 100)/100,
            grandTotalNDC: Math.round((lineitemGrandTotalNDC + Number.EPSILON) * 100)/100,

            totalSavingsDC: Math.round((totalSavingsDC + Number.EPSILON) * 100)/100,
            totalExchCpnAmtNDC: Math.round((totalSavingsNDC + Number.EPSILON) * 100)/100,

            subTotalDC: Math.round((subTotalDC + Number.EPSILON) * 100)/100,
            subTotalNDC: Math.round((subTotalNDC + Number.EPSILON) * 100)/100,

            totalTaxDC: Math.round((totalTaxDC + Number.EPSILON) * 100)/100,
            totalTaxNDC: Math.round((totalTaxNDC + Number.EPSILON) * 100)/100

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

      let subTotalDC = 0, subTotalNDC = 0, grandTotalDC = 0, grandTotalNDC = 0;
      let totalExchCpnAmtDC = 0, totalExchCpnAmtNDC = 0, totalSavingsDC = 0, totalSavingsNDC = 0;

      let totalTaxDC: number = 0;
      let totalTaxNDC: number = 0;

      let dCLineItemTaxAmount: number = 0;
      let fCLineItemTaxAmount: number = 0;

      let dcLineItemEnvTaxAmount: number = 0;
      let fCLineItemEnvTaxAmount: number = 0;

      let dCCouponLineItemDollarAmount: number = 0;
      let fCCouponLineItemDollarAmount: number = 0;

      let dCLineItemDollarDisplayAmount: number = 0;
      let fCLineItemDollarDisplayAmount: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = tktItem.unitPrice * tktItem.quantity * action.logonDataSvc.getExchangeRate();

      if (action.cpnPct > 0) {
         vndDiscAmtDC = lineItemGrantTotal * action.cpnPct / 100;
         vndDiscAmtNDC = lineitemGrandTotalNDC * action.cpnPct / 100;
      }
      else if (action.cpnAmt > 0) {
         vndDiscAmtDC = action.cpnAmt;
         vndDiscAmtNDC = action.cpnAmt * action.logonDataSvc.getExchangeRate();
      }

      if (state.tktObj.taxExempted) {
         dCLineItemTaxAmount = 0;
         fCLineItemTaxAmount = 0;

         dcLineItemEnvTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;

         dCLineItemDollarDisplayAmount = lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC);
         fCLineItemDollarDisplayAmount = lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);

         dCCouponLineItemDollarAmount = (vndDiscAmtDC + tktItem.exchCpnAmountDC);
         fCCouponLineItemDollarAmount = (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);
      }
      else {

         if (action.logonDataSvc.getVendorCouponAfterTax()) {
            dCLineItemTaxAmount = (lineItemGrantTotal) * tktItem.salesTaxPct / 100;
            fCLineItemTaxAmount = (lineitemGrandTotalNDC) * tktItem.salesTaxPct / 100;

            dcLineItemEnvTaxAmount = (lineItemGrantTotal) * tktItem.envrnmtlTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * tktItem.envrnmtlTaxPct / 100;

            dCLineItemDollarDisplayAmount = (lineItemGrantTotal + dCLineItemTaxAmount + dcLineItemEnvTaxAmount) - (vndDiscAmtDC + tktItem.exchCpnAmountDC);
            fCLineItemDollarDisplayAmount = (lineitemGrandTotalNDC + fCLineItemTaxAmount + fCLineItemEnvTaxAmount) - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);

         } else {

            dCLineItemTaxAmount = (lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC)) * tktItem.salesTaxPct / 100;
            fCLineItemTaxAmount = (lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC)) * tktItem.salesTaxPct / 100;

            dcLineItemEnvTaxAmount = (lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC)) * tktItem.envrnmtlTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100;

            dCLineItemDollarDisplayAmount = (lineItemGrantTotal + dCLineItemTaxAmount + dcLineItemEnvTaxAmount);
            fCLineItemDollarDisplayAmount = (lineitemGrandTotalNDC + fCLineItemEnvTaxAmount + fCLineItemEnvTaxAmount);
         }

         dCCouponLineItemDollarAmount = (vndDiscAmtDC + tktItem.exchCpnAmountDC);
         fCCouponLineItemDollarAmount = (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);
   
         totalSavingsDC = dCCouponLineItemDollarAmount;
         totalSavingsNDC = fCCouponLineItemDollarAmount;

         state.tktObj.tktList.forEach(item => {
            if (item.salesItemUID != action.saleItemId && item.ticketDetailId != action.tktDtlId) {

               lineItemGrantTotal += (item.unitPrice * item.quantity);
               lineitemGrandTotalNDC += (item.unitPrice * item.quantity) * action.logonDataSvc.getExchangeRate();

               totalSavingsDC += item.exchCpnAmountDC + item.vndCpnAmountDC
               totalSavingsNDC += item.exchCpnAmountNDC + item.vndCpnAmountNDC

               subTotalDC += lineItemGrantTotal;
               subTotalNDC += lineitemGrandTotalNDC;
            }
            totalTaxDC += item.lineItemTaxAmount;
            totalTaxNDC += item.dCLineItemTaxAmount;

         });
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
                     lineItemDollarDisplayAmount: dCLineItemDollarDisplayAmount,
                     dCLineItemDollarDisplayAmount: fCLineItemDollarDisplayAmount,

                     lineItemTaxAmount: dCLineItemTaxAmount,
                     lineItemEnvTaxAmount: dcLineItemEnvTaxAmount,

                     fCLineItemTaxAmount: fCLineItemTaxAmount,
                     fCLineItemEnvTaxAmount: fCLineItemEnvTaxAmount,

                     dCCouponLineItemDollarAmount: dCCouponLineItemDollarAmount,
                     fCCouponLineItemDollarAmount: fCCouponLineItemDollarAmount,

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
         },
         tktTotals: {
            ...state.tktTotals,
            subTotalDC: subTotalDC,
            subTotalNDC: subTotalNDC,

            totalTaxDC: totalTaxDC,
            totalTaxNDC: totalTaxNDC,

            grandTotalDC: lineItemGrantTotal,
            grandTotalNDC: lineitemGrandTotalNDC,

            totalSavingsDC: totalSavingsDC,
            totalSavingsNDC: totalSavingsNDC,
         }
      }
   }),
   on(upsertTranExchCpn, (state, action) => {

      let exchRate = action.logonDataSvc.getExchangeRate();
      let dfltCurr = action.logonDataSvc.getDfltCurrCode();
      let IsForeignCurr = action.logonDataSvc.getIsForeignCurr();
      let lineItemGrantTotal: number = 0, lineitemGrandTotalNDC: number = 0;
      let cpnPct = 0, exchDiscAmtDC = 0, exchDiscAmtNDC = 0;
      let subTotalDC = 0, subTotalNDC = 0, grandTotalDC = 0, grandTotalNDC = 0;
      let totalExchCpnAmtDC = 0, totalExchCpnAmtNDC = 0, totalSavingsDC = 0, totalSavingsNDC = 0;
      let tktListCopy: SalesTransactionCheckoutItem[] = JSON.parse(JSON.stringify(state.tktObj.tktList))
      let updateCpn: boolean = false;

      let totalTaxDC: number = 0;
      let totalTaxNDC: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      tktListCopy.forEach(item => {
         item.exchCpnAmountDC = 0;
         item.exchCpnAmountNDC = 0;

         lineItemGrantTotal = item.unitPrice * item.quantity;
         lineitemGrandTotalNDC = item.dCUnitPrice * item.quantity;

         subTotalDC += lineItemGrantTotal;
         subTotalNDC += lineitemGrandTotalNDC;

         if (action.cpnPct > 0) {
            exchDiscAmtDC = lineItemGrantTotal * action.cpnPct / 100;
            exchDiscAmtNDC = lineitemGrandTotalNDC * action.cpnPct / 100;
         }
         else {
            exchDiscAmtDC = action.cpnAmt;
            exchDiscAmtNDC = action.cpnAmt * exchRate * 0.01;
         }
         item.exchCpnAmountDC = exchDiscAmtDC;
         item.exchCpnAmountNDC = exchDiscAmtNDC;

         totalExchCpnAmtDC += exchDiscAmtDC;
         totalExchCpnAmtNDC += exchDiscAmtNDC;

         if (state.tktObj.taxExempted) {
            item.lineItemTaxAmount = 0;
            item.lineItemEnvTaxAmount = 0;
            item.lineItemDollarDisplayAmount = (lineItemGrantTotal) - exchDiscAmtDC;

            item.dCLineItemTaxAmount = 0;
            item.fCLineItemEnvTaxAmount = 0;
            item.dCCouponLineItemDollarAmount = (lineitemGrandTotalNDC) - exchDiscAmtDC;
         }
         else {
            if (action.logonDataSvc.getExchCouponAfterTax()) {
               item.lineItemTaxAmount = (lineItemGrantTotal) * item.salesTaxPct / 100;
               item.dCLineItemTaxAmount = (lineitemGrandTotalNDC) * item.salesTaxPct / 100;

               item.fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * item.envrnmtlTaxPct / 100;
               item.lineItemEnvTaxAmount = (lineItemGrantTotal) * item.envrnmtlTaxPct / 100;

               item.lineItemDollarDisplayAmount = (lineItemGrantTotal + item.lineItemTaxAmount + item.lineItemEnvTaxAmount) - exchDiscAmtDC;
               item.dCLineItemDollarDisplayAmount = lineitemGrandTotalNDC + item.dCLineItemTaxAmount + item.fCLineItemEnvTaxAmount - exchDiscAmtNDC;
            }
            else {
               item.lineItemTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - item.vndCpnAmountDC) * item.salesTaxPct / 100;
               item.dCLineItemTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + item.vndCpnAmountNDC)) * item.salesTaxPct / 100;

               item.fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + item.vndCpnAmountNDC)) * item.envrnmtlTaxPct / 100;
               item.lineItemEnvTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - item.vndCpnAmountDC) * item.envrnmtlTaxPct / 100;

               item.lineItemDollarDisplayAmount = (lineItemGrantTotal + item.lineItemTaxAmount + item.lineItemEnvTaxAmount);
               item.dCLineItemDollarDisplayAmount = lineitemGrandTotalNDC + item.dCLineItemTaxAmount + item.fCLineItemEnvTaxAmount;
            }

            item.dCCouponLineItemDollarAmount = (exchDiscAmtNDC + item.vndCpnAmountNDC)
            item.couponLineItemDollarAmount = (exchDiscAmtDC + item.vndCpnAmountDC)

            totalTaxDC += item.lineItemTaxAmount;
            totalTaxNDC += item.dCLineItemTaxAmount;
         }
         grandTotalDC += item.lineItemDollarDisplayAmount;
         grandTotalNDC += item.dCLineItemDollarDisplayAmount;

         totalSavingsDC += item.couponLineItemDollarAmount;
         totalSavingsNDC += item.dCCouponLineItemDollarAmount;
      });

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            updateCoupons: updateCpn,
            tktList: tktListCopy,
         },
         tktTotals: {
            ...state.tktTotals,
            subTotalDC: subTotalDC,
            subTotalNDC: subTotalNDC,
            grandTotalDC: grandTotalDC,
            grandTotalNDC: grandTotalNDC,
            totalExchCpnAmtDC: totalExchCpnAmtDC,
            totalExchCpnAmtNDC: totalExchCpnAmtNDC,
            totalSavingsDC: totalSavingsDC,
            totalSavingsNDC: totalSavingsNDC,
            totalTaxDC: totalTaxDC,
            totalTaxNDC: totalTaxNDC
         }
      }
   }),
   on(saveTicketSplitSuccess, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            transactionID: action.rslt.transactionId,
            ticketNumber: action.rslt.ticketNumber,
            tktList : state.tktObj.tktList.map(itm => {
               let salesItem = action.rslt.ticketDetailList.filter(obj => obj.salesItemUID === itm.salesItemUID)[0];

               if(itm.srvdByAssociateVal > 0 && itm.salesItemUID == salesItem.salesItemUID && itm.srvdByAssociateVal == salesItem.individualLocationUID) {
                  return {
                     ...itm,
                     ticketDetailId: salesItem.ticketDetailId
                  }
               }
               else {
                  if(itm.salesItemUID == salesItem.salesItemUID) {
                     return {
                        ...itm,
                        ticketDetailId: salesItem.ticketDetailId
                     }
                  }
                  else {
                     return {
                        ...itm
                     }
                  }
               }
            })
            
         },
         saveTktRsltMdl: action.rslt
      }
   }),
   on(updatePartPayData, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            isPartialPay: action.partPayFlag,
            partialAmount: action.partPayAmountDC,
            partialAmountFC: action.partPayAmountNDC
         }
      }
   })
);



export function TktObjReducer(state: saleTranDataInterface, action: Action) {
   return _tktObjReducer(state, action);

}

