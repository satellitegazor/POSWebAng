import { state } from "@angular/animations";
import { compileDeclareNgModuleFromMetadata } from "@angular/compiler";
import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "src/app/global/global.constants";
import { AssociateSaleTips } from "src/app/models/associate.sale.tips";
import { LTC_Customer } from "src/app/models/customer";
import { TenderStatusType, TicketTender, TranStatusType } from "src/app/models/ticket.tender";
import { SalesTransactionCheckoutItem } from "../../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj, addCustomerId, addNewCustomer, addTender, updateSaleitems, updateCheckoutTotals, updateServedByAssociate, upsertAssocTips, delSaleitemZeroQty, updateTaxExempt, upsertSaleItemExchCpn, upsertSaleItemVndCpn, upsertTranExchCpn, saveTicketForGuestCheckSuccess, resetTktObj, updateAssocInAssocTips, updatePartPayData, removeTndrWithSaveCode, saveCompleteTicketSplitSuccess, addPinpadResp, saveTenderObjSuccess, savePinpadResponse, updateTenderRRN, markTendersComplete, markTicketComplete, addTabSerialToTktObj, isSplitPayR5, deleteDeclinedTender, loadTicketSuccess, loadInProgressTendersSuccess } from "./ticket.action";
import { Round2DecimalService } from "src/app/services/round2-decimal.service";
import { tktObjInitialState, saleTranDataInterface } from "./ticket.state";
import { ExchCardTndr } from "src/app/models/exch.card.tndr";
import { UtilService } from "src/app/services/util.service";
import { mapLtcTicketToTicketSplit, TicketSplit } from "src/app/models/ticket.split";
import { timeInterval } from "rxjs";

export const _tktObjReducer = createReducer(
   tktObjInitialState,
   on(initTktObj, (state, action) => {
      let _utilSvc = new UtilService();
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            locationUID: action.locConfig.locationUID,
            individualUID: action.individualUID,
            cliTimeVar: GlobalConstants.GetClientTimeVariance(),
            transactionDate: new Date(Date.now()),
            ticketRRN: _utilSvc.getUniqueRRN(),
            tranStatus: TranStatusType.InProgress,
            voidType: '',
            voidTypeDesc: ''
         }
      }
   }),



   on(removeTndrWithSaveCode, (state, action) => {
      let tndrCode: string = action.tndrCode;
      //console.log("removeTndrWithSaveCode called with code: " + tndrCode);
      state.tktObj.ticketTenderList.forEach(tndr => { console.log("Tender Code: " + tndr.tenderTypeCode); });

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.length == 1 ? [] : state.tktObj.ticketTenderList.filter(tndr => tndr.tenderTypeCode != tndrCode)
         }
      }
   }),

   

      on(resetTktObj, (state, action) => {

      //console.log("resetTktObj called");

      let _utilSvc = new UtilService();

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
            tipAmountDC: 0,
            tipAmountNDC: 0,
            ticketRRN: _utilSvc.getUniqueRRN(),
            tranStatus: TranStatusType.InProgress,
            voidType: '',
            voidTypeDesc: '',
            vMTndr: [] as ExchCardTndr[]
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

   on(addTabSerialToTktObj, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tabSerialNum: action.tabSerialNum,
            iPAddress: action.ipAddress,
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
         _totalSaleAmt += action.defCurrSymbl == '$' ? k.lineItemDollarDisplayAmount : k.dcLineItemDollarDisplayAmount;
         lgrandTotalDC += action.defCurrSymbl == '$' ? k.lineItemDollarDisplayAmount : k.dcLineItemDollarDisplayAmount;
         lgrandTotalNDC += action.defCurrSymbl == '$' ? k.dcLineItemDollarDisplayAmount : k.lineItemDollarDisplayAmount;
         ltotalExchCpnAmtDC += k.exchCpnAmountDC;
         ltotalExchCpnAmtNDC += k.exchCpnAmountNDC;
         ltotalSavingsDC += k.exchCpnAmountDC + (action.defCurrSymbl == '$' ? (k.discountAmount + k.lineItmKatsaCpnAmt) : (k.dcDiscountAmount + k.fcLineItmKatsaCpnAmt));
         ltotalSavingsNDC += k.exchCpnAmountNDC + (action.defCurrSymbl == '$' ? (k.dcDiscountAmount + k.fcLineItmKatsaCpnAmt) : (k.discountAmount + k.lineItmKatsaCpnAmt));
         ltotalTaxDC += (action.defCurrSymbl == '$' ? (k.lineItemTaxAmount + k.lineItemEnvTaxAmount) : (k.dcLineItemTaxAmount + k.fcLineItemEnvTaxAmount));
         ltotalTaxNDC += (action.defCurrSymbl == '$' ? (k.dcLineItemTaxAmount + k.fcLineItemEnvTaxAmount) : (k.lineItemTaxAmount + k.lineItemEnvTaxAmount));

         if(saleAssocAry.filter(assoc => assoc.indivLocId == k.srvdByAssociateVal).length > 0) {
            saleAssocAry.filter(assoc => assoc.indivLocId == k.srvdByAssociateVal)[0]?.tipSaleItemIdList.push(k.salesItemUID);
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
      newCheckOutItem.lineItemTaxAmount = Number(Number(state.tktObj.taxExempted ? 0 : (action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))  * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01).toFixed(2));
      newCheckOutItem.dcLineItemTaxAmount = Number(Number(state.tktObj.taxExempted ? 0 : (action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate)) * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01).toFixed(2));
      
      newCheckOutItem.lineItemDollarDisplayAmount = Number(Number((((action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) + newCheckOutItem.lineItemTaxAmount).toFixed(2));
      newCheckOutItem.dcLineItemDollarDisplayAmount = Number(Number((((action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) + newCheckOutItem.dcLineItemTaxAmount).toFixed(2));
      
      newCheckOutItem.lineItemEnvTaxAmount = Number(Number((((action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) * newCheckOutItem.envrnmtlTaxPct * 0.01).toFixed(2));
      newCheckOutItem.fcLineItemEnvTaxAmount = Number(Number((((action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) * newCheckOutItem.envrnmtlTaxPct * 0.01).toFixed(2));

      if(saleAssocAry.filter(assoc => assoc.indivLocId == newCheckOutItem.srvdByAssociateVal).length > 0) {
         saleAssocAry.filter(assoc => assoc.indivLocId == newCheckOutItem.srvdByAssociateVal)[0]?.tipSaleItemIdList.push(newCheckOutItem.salesItemUID);
      }
      else {
         let saleAssoc: AssociateSaleTips = new AssociateSaleTips();
         saleAssoc.indivLocId = newCheckOutItem.srvdByAssociateVal;
         saleAssoc.tipSaleItemIdList.push(newCheckOutItem.salesItemUID);
         saleAssocAry.push(saleAssoc);
      }

      lgrandTotalDC += action.defCurrSymbl == '$' ? newCheckOutItem.lineItemDollarDisplayAmount : newCheckOutItem.dcLineItemDollarDisplayAmount;
      lgrandTotalNDC += action.defCurrSymbl != '$' ? newCheckOutItem.lineItemDollarDisplayAmount : newCheckOutItem.dcLineItemDollarDisplayAmount;
      ltotalExchCpnAmtDC += newCheckOutItem.exchCpnAmountDC;
      ltotalExchCpnAmtNDC += newCheckOutItem.exchCpnAmountNDC;
      ltotalSavingsDC += Number(Number(newCheckOutItem.exchCpnAmountDC + (action.defCurrSymbl == '$' ? (newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt) : (newCheckOutItem.dcDiscountAmount + newCheckOutItem.fcLineItmKatsaCpnAmt))).toFixed(2));
      ltotalSavingsNDC += Number(Number(newCheckOutItem.exchCpnAmountNDC + (action.defCurrSymbl != '$' ? (newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt) : (newCheckOutItem.dcDiscountAmount + newCheckOutItem.fcLineItmKatsaCpnAmt))).toFixed(2));
      ltotalTaxDC += Number(Number(action.defCurrSymbl == '$' ? (newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount) : (newCheckOutItem.dcLineItemTaxAmount + newCheckOutItem.fcLineItemEnvTaxAmount)).toFixed(2));
      ltotalTaxNDC += Number(Number(action.defCurrSymbl != '$' ? (newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount) : (newCheckOutItem.dcLineItemTaxAmount + newCheckOutItem.fcLineItemEnvTaxAmount)).toFixed(2));

      lsubTotalDC = Number(Number(lgrandTotalDC - ltotalTaxDC).toFixed(2));
      lsubTotalNDC = Number(Number(lgrandTotalNDC - ltotalTaxNDC).toFixed(2));

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: [...state.tktObj?.tktList,
               newCheckOutItem],
            totalSale: action.defCurrSymbl == '$' ? lgrandTotalDC : lgrandTotalNDC,
            totalSaleFC: action.defCurrSymbl == '$' ? lgrandTotalNDC : lgrandTotalDC,
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
            grandTotalNDC: lgrandTotalNDC
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
         let aTips = assocTipsAry.filter(obj => obj.indivLocId == val.srvdByAssociateVal)[0];         

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
               let unitPriceNDC = action.defCurrSymbl == '$' ? itm.unitPrice * action.dailyExchRateObj.exchangeRate : (itm.unitPrice / action.dailyExchRateObj.exchangeRate);
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
                  return {
                     ...itm,
                     quantity: itm.quantity + 1,
                     lineItemDollarDisplayAmount: Number(Number(itm.lineItemDollarDisplayAmount / itm.quantity).toFixed(2)) * (itm.quantity + 1), //Number(Number(Number((itm.unitPrice * (itm.quantity + 1)) + (state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity + 1) * itm.salesTaxPct * 0.01)))).toFixed(2)),
                     lineItemTaxAmount: Number(Number(itm.lineItemTaxAmount / itm.quantity).toFixed(2)) * (itm.quantity + 1),//Number(Number(Number(state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity + 1) * itm.salesTaxPct * 0.01))).toFixed(2)),
                     couponLineItemDollarAmount: Number(Number(itm.couponLineItemDollarAmount * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     exchCpnAmountDC: Number(Number(itm.exchCpnAmountDC * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     exchCpnAmountNDC: Number(Number(itm.exchCpnAmountNDC * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     discountAmount: Number(Number(itm.discountAmount * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     dcDiscountAmount: Number(Number(itm.dcDiscountAmount * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     fcLineItmKatsaCpnAmt: Number(Number(itm.fcLineItmKatsaCpnAmt * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     lineItmKatsaCpnAmt: Number(Number(itm.lineItmKatsaCpnAmt * (itm.quantity + 1) / itm.quantity).toFixed(2)),
                     dcLineItemTaxAmount: Number(Number(itm.dcLineItemTaxAmount / itm.quantity).toFixed(2)) * (itm.quantity + 1),//Number(Number(state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity + 1) * itm.salesTaxPct * 0.01)).toFixed(2)),
                     dcLineItemDollarDisplayAmount: Number(Number(itm.dcLineItemDollarDisplayAmount / itm.quantity).toFixed(2)) * (itm.quantity + 1),//Number(Number((unitPriceNDC * (itm.quantity + 1)) + (state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity + 1) * itm.salesTaxPct * 0.01))).toFixed(2))
                     
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
                     quantity: itm.quantity - 1,
                     lineItemDollarDisplayAmount: Number(Number(itm.lineItemDollarDisplayAmount / itm.quantity).toFixed(2)) * (itm.quantity - 1), //Number(Number(Number((itm.unitPrice * (itm.quantity - 1)) + (state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity - 1) * itm.salesTaxPct * 0.01)))).toFixed(2)),
                     lineItemTaxAmount: Number(Number(itm.lineItemTaxAmount / itm.quantity).toFixed(2)) * (itm.quantity - 1),//Number(Number(Number(state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity - 1) * itm.salesTaxPct * 0.01))).toFixed(2)),
                     couponLineItemDollarAmount: Number(Number(itm.couponLineItemDollarAmount * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     exchCpnAmountDC: Number(Number(itm.exchCpnAmountDC * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     exchCpnAmountNDC: Number(Number(itm.exchCpnAmountNDC * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     discountAmount: Number(Number(itm.discountAmount * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     dcDiscountAmount: Number(Number(itm.dcDiscountAmount * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     fcLineItmKatsaCpnAmt: Number(Number(itm.fcLineItmKatsaCpnAmt * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     lineItmKatsaCpnAmt: Number(Number(itm.lineItmKatsaCpnAmt * (itm.quantity - 1) / itm.quantity).toFixed(2)),
                     dcLineItemTaxAmount: Number(Number(itm.dcLineItemTaxAmount / itm.quantity).toFixed(2)) * (itm.quantity - 1),//Number(Number(state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity - 1) * itm.salesTaxPct * 0.01)).toFixed(2)),
                     dcLineItemDollarDisplayAmount: Number(Number(itm.dcLineItemDollarDisplayAmount / itm.quantity).toFixed(2)) * (itm.quantity - 1),//Number(Number((unitPriceNDC * (itm.quantity - 1)) + (state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity - 1) * itm.salesTaxPct * 0.01))).toFixed(2))
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

   on(isSplitPayR5, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,  
            isSplitPayR5: action.isSplitPayR5
         }
      }
   }),

   on(addTender, (state, action) => {

      let tenderListCopy: TicketTender[] = JSON.parse(JSON.stringify(state.tktObj.ticketTenderList));
      tenderListCopy = tenderListCopy.filter(tndr => tndr.tenderTypeCode != "SV");
      
      if(tenderListCopy.filter(tndr => (tndr.rrn == action.tndrObj.rrn)).length > 0) {
         let tndrObj: TicketTender = tenderListCopy.filter(tndr => tndr.rrn == action.tndrObj.rrn || tndr.ticketTenderId == action.tndrObj.ticketTenderId)[0];
         tndrObj.authNbr = action.tndrObj.authNbr;
         tndrObj.cardEndingNbr = action.tndrObj.cardEndingNbr;
         tndrObj.tndMaintTimestamp = new Date(Date.now());
         tndrObj.tenderTypeCode = action.tndrObj.tenderTypeCode;
         tndrObj.tenderTypeDesc = action.tndrObj.tenderTypeDesc;
         tndrObj.cardEntryMode = action.tndrObj.cardEntryMode;
         tndrObj.tenderStatus = action.tndrObj.tenderStatus;
         tndrObj.tenderAmount = action.tndrObj.tenderAmount;
         tndrObj.fcTenderAmount = action.tndrObj.fcTenderAmount;
         tndrObj.ticketTenderId = tndrObj.ticketTenderId > 0 ? tndrObj.ticketTenderId : -1 * (tenderListCopy.length + 1);
         tndrObj.isAuthorized = action.tndrObj.isAuthorized;
         tndrObj.exchCardPymntType = action.tndrObj.exchCardPymntType !== null ? action.tndrObj.exchCardPymntType : '';
         tndrObj.inStoreCardNbrTmp = action.tndrObj.inStoreCardNbrTmp !== null ? action.tndrObj.inStoreCardNbrTmp : '';

      }
      else {
         tenderListCopy.push(action.tndrObj);
      }

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: tenderListCopy,
            transactionDate: new Date(Date.now())                        
         }
      }
   }),

   on(deleteDeclinedTender, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.filter(tndr => tndr.rrn != action.rrn)
         }
      }
   }),

   // on(savePinpadResponse, (state, action) => {

   

   //    return {
   //       ...state,
   //       tktObj: {
   //          ...state.tktObj,
   //          vMTndr: respObj
   //       }
   //    }
   // }

   // ),

   on(addPinpadResp, (state, action) => {
   
      let respObj: ExchCardTndr = JSON.parse(JSON.stringify(action.respObj));
      respObj.ticketTenderId = state.tktObj.ticketTenderList.filter(tndr => tndr.rrn == respObj.INVOICE)[0]?.ticketTenderId
      respObj.transactionId = state.tktObj.transactionID;

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            vMTndr: [...state.tktObj.vMTndr, respObj]
         }
      }
   }),
   

   on(updateCheckoutTotals, (state, action) => {

      let ExchCouponsAfterTax = action.logonDataSvc.getExchCouponAfterTax();
      let VendCouponsAfterTax = action.logonDataSvc.getVendorCouponAfterTax();
      let exchRateObj = action.logonDataSvc.getDailyExchRate()
      let exchangeRate: number = Round2DecimalService.round(exchRateObj.dfltCurrCode == 'USD' ? exchRateObj.exchangeRate : 1 / exchRateObj.exchangeRate) * 10000 / 10000;

      var updatedTktList: SalesTransactionCheckoutItem[] = JSON.parse(JSON.stringify([...state.tktObj.tktList]));
      let totalSaleDC: number = 0;
      let totalSaleNDC: number = 0;

      const taxExepted = state.tktObj.taxExempted;

      for (let k = 0; k < updatedTktList.length; k++) {

         let subTotalDC = (( updatedTktList[k].unitPrice * updatedTktList[k].quantity) * 100) / 100;
         let exchCpnTotalDC = ((updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100;
         let saleTaxTotalDC = ((updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100;
         let vndDiscountTotalDC = (updatedTktList[k].discountAmount | 0 * 100) / 100;

         let unitPriceNDC = exchRateObj.dfltCurrCode == 'USD' ? (updatedTktList[k].unitPrice * exchRateObj.exchangeRate) : (updatedTktList[k].unitPrice / exchRateObj.exchangeRate);
         let subTotalNDC = (( unitPriceNDC * updatedTktList[k].quantity) * 100) / 100;
         let exchCpnTotalNDC = ((unitPriceNDC * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100;
         let saleTaxTotalNDC = ((unitPriceNDC * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100;
         let vndDiscountTotalNDC = (updatedTktList[k].dcDiscountAmount | 0 * 100) / 100;

         if (exchRateObj.dfltCurrCode == '$') {

            updatedTktList[k].lineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalDC - exchCpnTotalDC - vndDiscountTotalDC + (taxExepted ? 0 : saleTaxTotalDC)) * 100) / 100);
            updatedTktList[k].lineItemTaxAmount = saleTaxTotalDC;
            updatedTktList[k].discountAmount = Round2DecimalService.round(exchCpnTotalDC + vndDiscountTotalDC);

            updatedTktList[k].dcLineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalNDC - exchCpnTotalNDC - vndDiscountTotalNDC + (taxExepted ? 0 : saleTaxTotalNDC)) * 100) / 100);
            updatedTktList[k].dcLineItemTaxAmount = saleTaxTotalNDC;
            updatedTktList[k].dcDiscountAmount = Round2DecimalService.round(exchCpnTotalNDC + vndDiscountTotalNDC);

            totalSaleDC += Round2DecimalService.round(updatedTktList[k].lineItemDollarDisplayAmount);
            totalSaleNDC += Round2DecimalService.round(updatedTktList[k].dcLineItemDollarDisplayAmount);
         }
         else {
            updatedTktList[k].lineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalNDC - exchCpnTotalNDC - vndDiscountTotalNDC + (taxExepted ? 0 : saleTaxTotalNDC)) * 100) / 100);
            updatedTktList[k].lineItemTaxAmount = saleTaxTotalNDC;
            updatedTktList[k].discountAmount = Round2DecimalService.round(exchCpnTotalNDC + vndDiscountTotalNDC);

            updatedTktList[k].dcLineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalDC - exchCpnTotalDC - vndDiscountTotalDC + (taxExepted ? 0 : saleTaxTotalDC)) * 100) / 100);
            updatedTktList[k].dcLineItemTaxAmount = saleTaxTotalDC;
            updatedTktList[k].dcDiscountAmount = Round2DecimalService.round(exchCpnTotalDC + vndDiscountTotalDC);

            totalSaleDC += Round2DecimalService.round(updatedTktList[k].dcLineItemDollarDisplayAmount);
            totalSaleNDC += Round2DecimalService.round(updatedTktList[k].lineItemDollarDisplayAmount);
         }
         

         

         // let subTotalFC = Round2DecimalService.round(((updatedTktList[k].dcUnitPrice * updatedTktList[k].quantity) * 100) / 100);
         // let exchCpnTotalFC = Round2DecimalService.round(((updatedTktList[k].dcUnitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100);
         // let saleTaxTotalFC = Round2DecimalService.round(((updatedTktList[k].dcUnitPrice * updatedTktList[k].quantity) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100);
         // let vndDiscountTotalFC = Round2DecimalService.round((updatedTktList[k].dcDiscountAmount | 0 * 100) / 100);

         // let subTotalFC = Round2DecimalService.round(((subTotalDC * (exchangeRate) ) * 100) / 100);
         // let exchCpnTotalFC = Round2DecimalService.round(((exchCpnTotalDC * exchangeRate) * 100) / 100);
         // let saleTaxTotalFC = Round2DecimalService.round(((saleTaxTotalDC * exchangeRate) * 100) / 100);
         // let vndDiscountTotalFC = Round2DecimalService.round((vndDiscountTotalDC * exchangeRate * 100) / 100);

         // updatedTktList[k].dcLineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalFC - exchCpnTotalFC - vndDiscountTotalFC + saleTaxTotalFC) * 100) / 100);
         // updatedTktList[k].dcLineItemTaxAmount = (saleTaxTotalFC * 100) / 100;
         // updatedTktList[k].dcDiscountAmount = (exchCpnTotalFC + vndDiscountTotalFC * 100) / 100;

         // totalSaleNDC += Round2DecimalService.round((updatedTktList[k].dcLineItemDollarDisplayAmount * 100) / 100);
      }

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList,
            totalSale: totalSaleDC,
            totalSaleFC: totalSaleNDC,
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
         lineItemTotalDC += action.logonDataSvc.getDfltCurrCode() == 'USD' ? val.lineItemDollarDisplayAmount : val.dcLineItemDollarDisplayAmount;
         lineItemTotalNDC += action.logonDataSvc.getDfltCurrCode() == 'USD' ? val.dcLineItemDollarDisplayAmount : val.lineItemDollarDisplayAmount;
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

      let dcLineItemTaxAmount: number = 0;
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

      let dcCouponLineItemDollarAmount: number = 0;
      let fCCouponLineItemDollarAmount: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = tktItem.dcUnitPrice * tktItem.quantity;

      if (action.cpnPct > 0) {
         exchDiscAmtDC = lineItemGrantTotal * action.cpnPct / 100;
         exchDiscAmtNDC = lineitemGrandTotalNDC * action.cpnPct / 100;
      }
      else {
         exchDiscAmtDC = action.cpnAmt;
         exchDiscAmtNDC = action.cpnAmt * exchRate;
      }

      if (state.tktObj.taxExempted) {
         dcLineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;

         dcLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;
      }

      if (state.tktObj.taxExempted) {
         dcLineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;
         lineItemDollarDisplayAmount = (lineItemGrantTotal) - exchDiscAmtDC;
         dcCouponLineItemDollarAmount = exchDiscAmtDC;

         fCLineItemEnvTaxAmount = 0;
         fCCouponLineItemDollarAmount = exchDiscAmtNDC;
      }
      else {
         if (action.logonDataSvc.getExchCouponAfterTax()) {
            dcLineItemTaxAmount = Number(Number((lineItemGrantTotal) * tktItem.salesTaxPct / 100).toFixed(2)) 
            lineItemEnvTaxAmount = Number(Number((lineItemGrantTotal) * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            lineItemDollarDisplayAmount = Number(Number((lineItemGrantTotal + dcLineItemTaxAmount + lineItemEnvTaxAmount) - exchDiscAmtDC).toFixed(2));

            fCLineItemTaxAmount = Number(Number((lineitemGrandTotalNDC) * tktItem.salesTaxPct / 100).toFixed(2));
            fCLineItemEnvTaxAmount = Number(Number((lineitemGrandTotalNDC) * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            fCLineItemDollarDisplayAmount = Number(Number(((lineitemGrandTotalNDC + fCLineItemTaxAmount + fCLineItemEnvTaxAmount - exchDiscAmtNDC) * 100) / 100).toFixed(2));

         }
         else {
            dcLineItemTaxAmount = Number(Number((lineItemGrantTotal - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.salesTaxPct / 100).toFixed(2));
            lineItemEnvTaxAmount = Number(Number((lineItemGrantTotal - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            lineItemDollarDisplayAmount = Number(Number((((lineItemGrantTotal + dcLineItemTaxAmount + lineItemEnvTaxAmount)) * 100) / 100).toFixed(2));

            dcLineItemTaxAmount = Number(Number((lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.salesTaxPct / 100).toFixed(2));
            fCLineItemEnvTaxAmount = Number(Number((lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            fCLineItemDollarDisplayAmount = Number(Number(((lineitemGrandTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC) + fCLineItemTaxAmount + fCLineItemEnvTaxAmount) * 100) / 100).toFixed(2));
         }

         dcCouponLineItemDollarAmount =  exchDiscAmtDC;
         fCCouponLineItemDollarAmount =  exchDiscAmtNDC;

         totalSavingsDC = dcCouponLineItemDollarAmount;
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
            totalTaxNDC += item.dcLineItemTaxAmount;

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
                     lineItemTaxAmount: Math.round((dcLineItemTaxAmount + Number.EPSILON) * 100)/100,
                     lineItemEnvTaxAmount: Math.round((lineItemEnvTaxAmount + Number.EPSILON) * 100)/100,

                     dcLineItemTaxAmount: Math.round((dcLineItemTaxAmount + Number.EPSILON) * 100)/100,
                     fCLineItemEnvTaxAmount: Math.round((fCLineItemEnvTaxAmount + Number.EPSILON) * 100)/100,
                     dcCouponLineItemDollarAmount: Math.round((dcCouponLineItemDollarAmount + Number.EPSILON) * 100)/100,

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

      let dcLineItemTaxAmount: number = 0;
      let fCLineItemTaxAmount: number = 0;

      let dcLineItemEnvTaxAmount: number = 0;
      let fCLineItemEnvTaxAmount: number = 0;

      let dcCouponLineItemDollarAmount: number = 0;
      let fCCouponLineItemDollarAmount: number = 0;

      let dcLineItemDollarDisplayAmount: number = 0;
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
         dcLineItemTaxAmount = 0;
         fCLineItemTaxAmount = 0;

         dcLineItemEnvTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;

         dcLineItemDollarDisplayAmount = lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC);
         fCLineItemDollarDisplayAmount = lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);

         dcCouponLineItemDollarAmount = (vndDiscAmtDC + tktItem.exchCpnAmountDC);
         fCCouponLineItemDollarAmount = (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);
      }
      else {

         if (action.logonDataSvc.getVendorCouponAfterTax()) {
            dcLineItemTaxAmount = (lineItemGrantTotal) * tktItem.salesTaxPct / 100;
            fCLineItemTaxAmount = (lineitemGrandTotalNDC) * tktItem.salesTaxPct / 100;

            dcLineItemEnvTaxAmount = (lineItemGrantTotal) * tktItem.envrnmtlTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * tktItem.envrnmtlTaxPct / 100;

            dcLineItemDollarDisplayAmount = (lineItemGrantTotal + dcLineItemTaxAmount + dcLineItemEnvTaxAmount) - (vndDiscAmtDC + tktItem.exchCpnAmountDC);
            fCLineItemDollarDisplayAmount = (lineitemGrandTotalNDC + fCLineItemTaxAmount + fCLineItemEnvTaxAmount) - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);

         } else {

            dcLineItemTaxAmount = (lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC)) * tktItem.salesTaxPct / 100;
            fCLineItemTaxAmount = (lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC)) * tktItem.salesTaxPct / 100;

            dcLineItemEnvTaxAmount = (lineItemGrantTotal - (vndDiscAmtDC + tktItem.exchCpnAmountDC)) * tktItem.envrnmtlTaxPct / 100;
            fCLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (vndDiscAmtNDC + tktItem.exchCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100;

            dcLineItemDollarDisplayAmount = (lineItemGrantTotal + dcLineItemTaxAmount + dcLineItemEnvTaxAmount);
            fCLineItemDollarDisplayAmount = (lineitemGrandTotalNDC + fCLineItemEnvTaxAmount + fCLineItemEnvTaxAmount);
         }

         dcCouponLineItemDollarAmount = (vndDiscAmtDC + tktItem.exchCpnAmountDC);
         fCCouponLineItemDollarAmount = (vndDiscAmtNDC + tktItem.exchCpnAmountNDC);
   
         totalSavingsDC = dcCouponLineItemDollarAmount;
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
            totalTaxNDC += item.dcLineItemTaxAmount;

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
                     lineItemDollarDisplayAmount: dcLineItemDollarDisplayAmount,
                     dcLineItemDollarDisplayAmount: fCLineItemDollarDisplayAmount,

                     lineItemTaxAmount: dcLineItemTaxAmount,
                     lineItemEnvTaxAmount: dcLineItemEnvTaxAmount,

                     fCLineItemTaxAmount: fCLineItemTaxAmount,
                     fcLineItemEnvTaxAmount: fCLineItemEnvTaxAmount,

                     dcCouponLineItemDollarAmount: dcCouponLineItemDollarAmount,
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
         lineitemGrandTotalNDC = item.dcUnitPrice * item.quantity;

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

            item.dcLineItemTaxAmount = 0;
            item.fcLineItemEnvTaxAmount = 0;
            item.dcCouponLineItemDollarAmount = (lineitemGrandTotalNDC) - exchDiscAmtDC;
         }
         else {
            if (action.logonDataSvc.getExchCouponAfterTax()) {
               item.lineItemTaxAmount = (lineItemGrantTotal) * item.salesTaxPct / 100;
               item.dcLineItemTaxAmount = (lineitemGrandTotalNDC) * item.salesTaxPct / 100;

               item.fcLineItemEnvTaxAmount = (lineitemGrandTotalNDC) * item.envrnmtlTaxPct / 100;
               item.lineItemEnvTaxAmount = (lineItemGrantTotal) * item.envrnmtlTaxPct / 100;

               item.lineItemDollarDisplayAmount = (lineItemGrantTotal + item.lineItemTaxAmount + item.lineItemEnvTaxAmount) - exchDiscAmtDC;
               item.dcLineItemDollarDisplayAmount = lineitemGrandTotalNDC + item.dcLineItemTaxAmount + item.fcLineItemEnvTaxAmount - exchDiscAmtNDC;
            }
            else {
               item.lineItemTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - item.vndCpnAmountDC) * item.salesTaxPct / 100;
               item.dcLineItemTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + item.vndCpnAmountNDC)) * item.salesTaxPct / 100;

               item.fcLineItemEnvTaxAmount = (lineitemGrandTotalNDC - (exchDiscAmtNDC + item.vndCpnAmountNDC)) * item.envrnmtlTaxPct / 100;
               item.lineItemEnvTaxAmount = (lineItemGrantTotal - exchDiscAmtDC - item.vndCpnAmountDC) * item.envrnmtlTaxPct / 100;

               item.lineItemDollarDisplayAmount = (lineItemGrantTotal + item.lineItemTaxAmount + item.lineItemEnvTaxAmount);
               item.dcLineItemDollarDisplayAmount = lineitemGrandTotalNDC + item.dcLineItemTaxAmount + item.fcLineItemEnvTaxAmount;
            }

            item.dcCouponLineItemDollarAmount = (exchDiscAmtNDC + item.vndCpnAmountNDC)
            item.couponLineItemDollarAmount = (exchDiscAmtDC + item.vndCpnAmountDC)

            totalTaxDC += item.lineItemTaxAmount;
            totalTaxNDC += item.dcLineItemTaxAmount;
         }
         grandTotalDC += item.lineItemDollarDisplayAmount;
         grandTotalNDC += item.dcLineItemDollarDisplayAmount;

         totalSavingsDC += item.couponLineItemDollarAmount;
         totalSavingsNDC += item.dcCouponLineItemDollarAmount;
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
   on(saveTenderObjSuccess, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.map(tndr => {
               
               if (action.data != null && action.data.data != null 
                     && action.data.data.rrn != null && tndr.rrn == action.data.data.rrn) {
                  console.log("Updating tender with RRN:", tndr.rrn, "with ticketTenderId:", action.data.data.ticketTenderId);
                  return {
                     ...tndr,
                     ticketTenderId: action.data.data.ticketTenderId,                  
                  };
               }
               else {
                  console.log("No match for tender with RRN:", tndr.rrn);
                  return tndr
               }
            }),
         },
      }
   }),
   on(saveCompleteTicketSplitSuccess, (state, action) => {
      
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            transactionID: action.rslt.transactionId,
            ticketNumber: action.rslt.ticketNumber,            
         },
         saveTktRsltMdl: action.rslt
      }
   }),
   on(saveTicketForGuestCheckSuccess, (state, action) => {
      //console.log("saveTicketForGuestCheckSuccess", action.rslt);
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            transactionID: action.rslt.transactionId,
            ticketNumber: action.rslt.ticketNumber,
            ticketTenderList: [] as TicketTender[],
            tktList : state.tktObj.tktList.map(itm => {
               if(action.rslt.ticketDetailList == null || action.rslt.ticketDetailList.length == 0) {
                  console.warn("No ticket details found in the response");
                  return { ...itm }
               }
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
   }),
   on(updateTenderRRN, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.map(tndr => {
               if (tndr.rrn == action.oldRRN) {
                  
                  return {
                     ...tndr,
                     rrn: action.newRRN
                  };
               }
               else {
                  return tndr;
               }
            })
         }
      }
   }),
   on(markTendersComplete, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,            
            ticketTenderList: state.tktObj.ticketTenderList.map(tndr => {
               return {
                  ...tndr,
                  tenderStatus: TenderStatusType.Complete
               };
            })
         }
      }
   }),
   on(markTicketComplete, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tranStatus: TranStatusType.Complete
         }
      }
   }),

   on(loadTicketSuccess, (state, { tktObj: loadedTktObj }) => {

      const cancelledTenderTypeIds = new Set([10, 11, 1, 2]);
      const normalizeAuthNbr = (authNbr?: string | null) => (authNbr ?? '').trim();

      const tenderList = TicketTender.deepCopyTenderList(loadedTktObj.tenders).map(tndr => {
         const isAuthMissing = normalizeAuthNbr(tndr.authNbr).length === 0;

         if (tndr.tenderTypeId === 5 || (cancelledTenderTypeIds.has(tndr.tenderTypeId) && isAuthMissing)) {
            return {
               ...tndr,
               tenderStatus: TenderStatusType.Cancelled
            };
         }

         return tndr;
      });

      return {...state,
         tktObj: {
            ...state.tktObj,
            transactionID: loadedTktObj.transactionID,
            ticketNumber: loadedTktObj.ticketNumber,
            cancelTransactionID: 0,
            isRefund: false,
            balanceDue: loadedTktObj.balanceDue,
            customerId: loadedTktObj.customer != null ? loadedTktObj.customer.customerUID : 0,
            shipHandling: loadedTktObj.shipHandling ?? 0,
            shipHandlingFC: loadedTktObj.fCShipHandling,
            shipHandlingTaxAmt: loadedTktObj.shipHandlingTaxAmt,
            shipHandlingTaxAmtFC: loadedTktObj.fCShipHandlingTaxAmt,
            taxExempted: loadedTktObj.taxExempted == 1,
            transactionDate: loadedTktObj.transactionDate ? new Date(loadedTktObj.transactionDate) : new Date(),
            tranStatus: TranStatusType.InProgress,
            ticketTenderList: tenderList,
            tktList: SalesTransactionCheckoutItem.deepCopySaleItemList(loadedTktObj.items),
            customer: loadedTktObj.customer ? { ...loadedTktObj.customer } : {} as LTC_Customer
         }
      }
   })

   ,

   on(loadInProgressTendersSuccess, (state, { tenders }) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: TicketTender.deepCopyTenderList(tenders)
         }
      }
   })

   
)


export function TktObjReducer(state: saleTranDataInterface, action: Action) {
   return _tktObjReducer(state, action);

}

