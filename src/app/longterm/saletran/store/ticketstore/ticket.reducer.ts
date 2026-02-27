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
         ltotalSavingsDC += parseFloat((k.exchCpnAmountDC + (action.defCurrSymbl == '$' ? (k.discountAmount + k.lineItmKatsaCpnAmt) : (k.dcDiscountAmount + k.fcLineItmKatsaCpnAmt))).toFixed(2));
         ltotalSavingsNDC += parseFloat((k.exchCpnAmountNDC + (action.defCurrSymbl == '$' ? (k.dcDiscountAmount + k.fcLineItmKatsaCpnAmt) : (k.discountAmount + k.lineItmKatsaCpnAmt))).toFixed(2));
         ltotalTaxDC += parseFloat((action.defCurrSymbl == '$' ? (k.lineItemTaxAmount + k.lineItemEnvTaxAmount) : (k.dcLineItemTaxAmount + k.fcLineItemEnvTaxAmount)).toFixed(2));
         ltotalTaxNDC += parseFloat((action.defCurrSymbl == '$' ? (k.dcLineItemTaxAmount + k.fcLineItemEnvTaxAmount) : (k.lineItemTaxAmount + k.lineItemEnvTaxAmount)).toFixed(2));

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
      newCheckOutItem.lineItemTaxAmount = parseFloat((state.tktObj.taxExempted ? 0 : (action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))  * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01).toFixed(2));
      newCheckOutItem.dcLineItemTaxAmount = parseFloat((state.tktObj.taxExempted ? 0 : (action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate)) * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01).toFixed(2));
      
      newCheckOutItem.lineItemDollarDisplayAmount = parseFloat(((((action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) + newCheckOutItem.lineItemTaxAmount).toFixed(2));
      newCheckOutItem.dcLineItemDollarDisplayAmount = parseFloat(((((action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) + newCheckOutItem.dcLineItemTaxAmount).toFixed(2));
      
      newCheckOutItem.lineItemEnvTaxAmount = parseFloat(((((action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) * newCheckOutItem.envrnmtlTaxPct * 0.01).toFixed(2));
      newCheckOutItem.fcLineItemEnvTaxAmount = parseFloat(((((action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) * newCheckOutItem.envrnmtlTaxPct * 0.01).toFixed(2));
      newCheckOutItem.discountAmount = 0;
      newCheckOutItem.dcDiscountAmount = 0;
      newCheckOutItem.exchCpnAmountDC = 0;
      newCheckOutItem.exchCpnAmountNDC = 0;
      newCheckOutItem.couponLineItemDollarAmount = 0;
      newCheckOutItem.lineItmKatsaCpnAmt = 0;
      newCheckOutItem.fcLineItmKatsaCpnAmt = 0;


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
      ltotalSavingsDC += parseFloat((newCheckOutItem.exchCpnAmountDC + (action.defCurrSymbl == '$' ? (newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt) : (newCheckOutItem.dcDiscountAmount + newCheckOutItem.fcLineItmKatsaCpnAmt))).toFixed(2));
      ltotalSavingsNDC += parseFloat((newCheckOutItem.exchCpnAmountNDC + (action.defCurrSymbl != '$' ? (newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt) : (newCheckOutItem.dcDiscountAmount + newCheckOutItem.fcLineItmKatsaCpnAmt))).toFixed(2));
      ltotalTaxDC += parseFloat((action.defCurrSymbl == '$' ? (newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount) : (newCheckOutItem.dcLineItemTaxAmount + newCheckOutItem.fcLineItemEnvTaxAmount)).toFixed(2));
      ltotalTaxNDC += parseFloat((action.defCurrSymbl != '$' ? (newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount) : (newCheckOutItem.dcLineItemTaxAmount + newCheckOutItem.fcLineItemEnvTaxAmount)).toFixed(2));

      lsubTotalDC = parseFloat((lgrandTotalDC - ltotalTaxDC).toFixed(2));
      lsubTotalNDC = parseFloat((lgrandTotalNDC - ltotalTaxNDC).toFixed(2));

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
                     lineItemDollarDisplayAmount: parseFloat(((itm.lineItemDollarDisplayAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)), //Number(Number(Number((itm.unitPrice * (itm.quantity + 1)) + (state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity + 1) * itm.salesTaxPct * 0.01)))).toFixed(2)),
                     lineItemTaxAmount: parseFloat(((itm.lineItemTaxAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)),//Number(Number(Number(state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity + 1) * itm.salesTaxPct * 0.01))).toFixed(2)),
                     couponLineItemDollarAmount: parseFloat(((itm.couponLineItemDollarAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     exchCpnAmountDC: parseFloat(((itm.exchCpnAmountDC / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     exchCpnAmountNDC: parseFloat(((itm.exchCpnAmountNDC / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     discountAmount: parseFloat(((itm.discountAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     dcDiscountAmount: parseFloat(((itm.dcDiscountAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     fcLineItmKatsaCpnAmt: parseFloat(((itm.fcLineItmKatsaCpnAmt / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     lineItmKatsaCpnAmt: parseFloat(((itm.lineItmKatsaCpnAmt / itm.quantity) * (itm.quantity + 1)).toFixed(2)),
                     dcLineItemTaxAmount: parseFloat(((itm.dcLineItemTaxAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)),//Number(Number(state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity + 1) * itm.salesTaxPct * 0.01)).toFixed(2)),
                     dcLineItemDollarDisplayAmount: parseFloat(((itm.dcLineItemDollarDisplayAmount / itm.quantity) * (itm.quantity + 1)).toFixed(2)),//Number(Number((unitPriceNDC * (itm.quantity + 1)) + (state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity + 1) * itm.salesTaxPct * 0.01))).toFixed(2))
                     
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
                     lineItemDollarDisplayAmount: parseFloat(((itm.lineItemDollarDisplayAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)), //Number(Number(Number((itm.unitPrice * (itm.quantity - 1)) + (state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity - 1) * itm.salesTaxPct * 0.01)))).toFixed(2)),
                     lineItemTaxAmount: parseFloat(((itm.lineItemTaxAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)),//Number(Number(Number(state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity - 1) * itm.salesTaxPct * 0.01))).toFixed(2)),
                     couponLineItemDollarAmount: parseFloat(((itm.couponLineItemDollarAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     exchCpnAmountDC: parseFloat(((itm.exchCpnAmountDC / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     exchCpnAmountNDC: parseFloat(((itm.exchCpnAmountNDC / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     discountAmount: parseFloat(((itm.discountAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     dcDiscountAmount: parseFloat(((itm.dcDiscountAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     fcLineItmKatsaCpnAmt: parseFloat(((itm.fcLineItmKatsaCpnAmt / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     lineItmKatsaCpnAmt: parseFloat(((itm.lineItmKatsaCpnAmt / itm.quantity) * (itm.quantity - 1)).toFixed(2)),
                     dcLineItemTaxAmount: parseFloat(((itm.dcLineItemTaxAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)),//Number(Number(state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity - 1) * itm.salesTaxPct * 0.01)).toFixed(2)),
                     dcLineItemDollarDisplayAmount: parseFloat(((itm.dcLineItemDollarDisplayAmount / itm.quantity) * (itm.quantity - 1)).toFixed(2)),//Number(Number((unitPriceNDC * (itm.quantity - 1)) + (state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity - 1) * itm.salesTaxPct * 0.01))).toFixed(2))
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

         if (exchRateObj.dfltCurrCode == 'USD') {

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
      const exchRate = action.logonDataSvc.getExchangeRate();
      const dfltCurr = action.logonDataSvc.getDfltCurrCode(); // "USD" or not
      const isUsd = dfltCurr === "USD";

      const tktItem = state.tktObj.tktList
         .filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0];

      const lineItemGrantTotalDC = parseFloat((tktItem.unitPrice * tktItem.quantity).toFixed(2));
      const lineItemGrantTotalNDC = parseFloat((lineItemGrantTotalDC * (isUsd ? exchRate : (1 / exchRate))).toFixed(2));

      let exchDiscAmtDC = 0;
      let exchDiscAmtNDC = 0;

      if (action.cpnPct > 0) {
         exchDiscAmtDC = parseFloat((lineItemGrantTotalDC * action.cpnPct / 100).toFixed(2));
         exchDiscAmtNDC = parseFloat((lineItemGrantTotalNDC * action.cpnPct / 100).toFixed(2));
      } else {
         // Amount always in USD
         exchDiscAmtDC = parseFloat((action.cpnAmt * (isUsd ? (1 / exchRate) : exchRate)).toFixed(2)); // USD
         exchDiscAmtNDC = parseFloat((action.cpnAmt * (isUsd ? exchRate : (1 / exchRate))).toFixed(2));
      }

      let lineItemTaxAmount = 0;
      let dcLineItemTaxAmount = 0;

      let lineItemEnvTaxAmount = 0;
      let fCLineItemEnvTaxAmount = 0;

      let lineItemDollarDisplayAmount = 0;
      let dcLineItemDollarDisplayAmount = 0;

      let dcCouponLineItemDollarAmount = 0;

      if (state.tktObj.taxExempted) {

         lineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;
         dcLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;

         lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotalDC - exchDiscAmtDC).toFixed(2));
         dcLineItemDollarDisplayAmount = parseFloat((lineItemGrantTotalNDC - exchDiscAmtNDC).toFixed(2));

         dcCouponLineItemDollarAmount = parseFloat(exchDiscAmtDC.toFixed(2));
      } else {
         if (action.logonDataSvc.getExchCouponAfterTax()) {
            lineItemTaxAmount = parseFloat((lineItemGrantTotalDC * tktItem.salesTaxPct / 100).toFixed(2));
            lineItemEnvTaxAmount = parseFloat((lineItemGrantTotalDC * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            lineItemDollarDisplayAmount = parseFloat(((lineItemGrantTotalDC + lineItemTaxAmount + lineItemEnvTaxAmount) - exchDiscAmtDC).toFixed(2));

            dcLineItemTaxAmount = parseFloat((lineItemGrantTotalNDC * tktItem.salesTaxPct / 100).toFixed(2));
            fCLineItemEnvTaxAmount = parseFloat((lineItemGrantTotalNDC * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            dcLineItemDollarDisplayAmount = parseFloat(((lineItemGrantTotalNDC + dcLineItemTaxAmount + fCLineItemEnvTaxAmount) - exchDiscAmtNDC).toFixed(2));
         } else {
            lineItemTaxAmount = parseFloat(((lineItemGrantTotalDC - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.salesTaxPct / 100).toFixed(2));
            lineItemEnvTaxAmount = parseFloat(((lineItemGrantTotalDC - exchDiscAmtDC - tktItem.vndCpnAmountDC) * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            lineItemDollarDisplayAmount = parseFloat(((lineItemGrantTotalDC + lineItemTaxAmount + lineItemEnvTaxAmount)).toFixed(2));

            dcLineItemTaxAmount = parseFloat(((lineItemGrantTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.salesTaxPct / 100).toFixed(2));
            fCLineItemEnvTaxAmount = parseFloat(((lineItemGrantTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC)) * tktItem.envrnmtlTaxPct / 100).toFixed(2));
            dcLineItemDollarDisplayAmount = parseFloat(((lineItemGrantTotalNDC - (exchDiscAmtNDC + tktItem.vndCpnAmountNDC) + dcLineItemTaxAmount + fCLineItemEnvTaxAmount)).toFixed(2));
         }

         dcCouponLineItemDollarAmount = parseFloat(exchDiscAmtDC.toFixed(2));
      }

      let grandTotalDC = 0;
      let grandTotalNDC = 0;
      let totalSavingsDC = 0;
      let totalSavingsNDC = 0;
      let subTotalDC = 0;
      let subTotalNDC = 0;
      let totalTaxDC = 0;
      let totalTaxNDC = 0;

      const updatedList = state.tktObj.tktList.map(itm => {
         if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
            return {
               ...itm,
               exchangeCouponDiscountPct: parseFloat((itm.exchangeCouponDiscountPct > 0 ? action.cpnPct : itm.exchangeCouponDiscountPct).toFixed(2)),

               lineItemDollarDisplayAmount: parseFloat(lineItemDollarDisplayAmount.toFixed(2)),
               dcLineItemDollarDisplayAmount: parseFloat(dcLineItemDollarDisplayAmount.toFixed(2)),

               lineItemTaxAmount: parseFloat(lineItemTaxAmount.toFixed(2)),
               lineItemEnvTaxAmount: parseFloat(lineItemEnvTaxAmount.toFixed(2)),

               dcLineItemTaxAmount: parseFloat(dcLineItemTaxAmount.toFixed(2)),
               fCLineItemEnvTaxAmount: parseFloat(fCLineItemEnvTaxAmount.toFixed(2)),

               dcCouponLineItemDollarAmount: parseFloat(dcCouponLineItemDollarAmount.toFixed(2)),

               exchCpnAmountDC: parseFloat(exchDiscAmtDC.toFixed(2)),
               exchCpnAmountNDC: parseFloat(exchDiscAmtNDC.toFixed(2)),
            };
         }
         else {
            return { ...itm };
         }
      });

      for (let i = 0; i < updatedList.length; i++) {
         const item = updatedList[i];

         const itemLineDisplayDC = item.lineItemDollarDisplayAmount;
         const itemLineDisplayNDC = item.dcLineItemDollarDisplayAmount;

         const itemTaxDC = item.lineItemTaxAmount + item.lineItemEnvTaxAmount;
         const itemTaxNDC = item.dcLineItemTaxAmount + item.fcLineItemEnvTaxAmount;

         const itemSavingsDC = item.vndCpnAmountDC + item.exchCpnAmountDC;
         const itemSavingsNDC = item.vndCpnAmountNDC + item.exchCpnAmountNDC;

         if (isUsd) {
            grandTotalDC += itemLineDisplayDC;
            grandTotalNDC += itemLineDisplayNDC;

            subTotalDC += (itemLineDisplayDC - itemTaxDC);
            subTotalNDC += (itemLineDisplayNDC - itemTaxNDC);

            totalTaxDC += itemTaxDC;
            totalTaxNDC += itemTaxNDC;

            totalSavingsDC += itemSavingsDC;
            totalSavingsNDC += itemSavingsNDC;
         } else {
            grandTotalDC += itemLineDisplayNDC;
            grandTotalNDC += itemLineDisplayDC;

            subTotalDC += (itemLineDisplayNDC - itemTaxNDC);
            subTotalNDC += (itemLineDisplayDC - itemTaxDC);

            totalTaxDC += itemTaxNDC;
            totalTaxNDC += itemTaxDC;

            totalSavingsDC += itemSavingsNDC;
            totalSavingsNDC += itemSavingsDC;
         }
      }

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            updateCoupons: true,
            tktList: updatedList
         },
         tktTotals: {
            ...state.tktTotals,
            grandTotalDC: parseFloat(grandTotalDC.toFixed(2)),
            grandTotalNDC: parseFloat(grandTotalNDC.toFixed(2)),
            totalSavingsDC: parseFloat(totalSavingsDC.toFixed(2)),
            totalSavingsNDC: parseFloat(totalSavingsNDC.toFixed(2)),
            subTotalDC: parseFloat(subTotalDC.toFixed(2)),
            subTotalNDC: parseFloat(subTotalNDC.toFixed(2)),
            totalTaxDC: parseFloat(totalTaxDC.toFixed(2)),
            totalTaxNDC: parseFloat(totalTaxNDC.toFixed(2)),
         }
      };
   }),

   on(upsertSaleItemVndCpn, (state, action) => {

      let exchRate = action.logonDataSvc.getExchangeRate();
      let dfltCurr = action.logonDataSvc.getDfltCurrCode();
      let IsForeignCurr = action.logonDataSvc.getIsForeignCurr();
      let lineItemGrantTotal: number = 0, lineitemGrandTotalNDC: number = 0;
      let vndDiscAmtDC = 0, vndDiscAmtNDC = 0;
      let tktItem: SalesTransactionCheckoutItem = state.tktObj.tktList.filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0];
      let updateCpn: boolean = false;
      let cpnAmt = Number(action.cpnAmt) || 0;
      let cpnPct = Number(action.cpnPct) || 0;

      let subTotalDC = 0, subTotalNDC = 0, grandTotalDC = 0, grandTotalNDC = 0;
      let totalExchCpnAmtDC = 0, totalExchCpnAmtNDC = 0, totalSavingsDC = 0, totalSavingsNDC = 0;

      let totalTaxDC: number = 0;
      let totalTaxNDC: number = 0;

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = parseFloat((tktItem.unitPrice * tktItem.quantity * (dfltCurr == "USD" ? action.logonDataSvc.getExchangeRate() : (1 / action.logonDataSvc.getExchangeRate()))).toFixed(2));

      const targetLineItemGrantTotal = lineItemGrantTotal;
      const targetLineitemGrandTotalNDC = lineitemGrandTotalNDC;

      if (cpnPct > 0) {
         vndDiscAmtDC = parseFloat((targetLineItemGrantTotal * cpnPct / 100).toFixed(2));
         vndDiscAmtNDC = parseFloat((targetLineitemGrandTotalNDC * cpnPct / 100).toFixed(2));
      }
      else if (cpnAmt > 0) {
         vndDiscAmtDC = parseFloat((cpnAmt).toFixed(2));
         vndDiscAmtNDC = parseFloat((cpnAmt * (dfltCurr == "USD" ? action.logonDataSvc.getExchangeRate() : (1 / action.logonDataSvc.getExchangeRate()))).toFixed(2));
      }

      const vendAfterTax = action.logonDataSvc.getVendorCouponAfterTax();
      const exchAfterTax = action.logonDataSvc.getExchCouponAfterTax();

      let item = state.tktObj.tktList.filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0]

      const itemLineTotalDC = parseFloat((item.unitPrice * item.quantity).toFixed(2));
      const itemLineTotalNDC = parseFloat((itemLineTotalDC * (dfltCurr == "USD" ? action.logonDataSvc.getExchangeRate() : (1 / action.logonDataSvc.getExchangeRate()))).toFixed(2));

      const itemExchDiscDC = item.exchCpnAmountDC;
      const itemExchDiscNDC = item.exchCpnAmountNDC;

      const itemDCBeforeTaxDiscount = (vendAfterTax ? 0 : vndDiscAmtDC) + (exchAfterTax ? 0 : itemExchDiscDC);
      const itemNDCBeforeTaxDiscount = (vendAfterTax ? 0 : vndDiscAmtNDC) + (exchAfterTax ? 0 : itemExchDiscNDC);

      let itemDcLineItemTaxAmount = 0;
      let itemNdcLineItemTaxAmount = 0;
      let itemDcLineItemEnvTaxAmount = 0;
      let itemNdcLineItemEnvTaxAmount = 0;
      let itemDcLineItemDollarDisplayAmount = 0;
      let itemNdcLineItemDollarDisplayAmount = 0;

      if (state.tktObj.taxExempted) {
         itemDcLineItemDollarDisplayAmount = itemLineTotalDC - (vndDiscAmtDC + itemExchDiscDC);
         itemNdcLineItemDollarDisplayAmount = itemLineTotalNDC - (vndDiscAmtNDC + itemExchDiscNDC);
      }
      else {
         itemDcLineItemTaxAmount = parseFloat(((itemLineTotalDC - itemDCBeforeTaxDiscount) * item.salesTaxPct / 100).toFixed(2));
         itemNdcLineItemTaxAmount = parseFloat(((itemLineTotalNDC - itemNDCBeforeTaxDiscount) * item.salesTaxPct / 100).toFixed(2));

         itemDcLineItemEnvTaxAmount = parseFloat(((itemLineTotalDC - itemDCBeforeTaxDiscount) * item.envrnmtlTaxPct / 100).toFixed(2));
         itemNdcLineItemEnvTaxAmount = parseFloat(((itemLineTotalNDC - itemNDCBeforeTaxDiscount) * item.envrnmtlTaxPct / 100).toFixed(2));

         itemDcLineItemDollarDisplayAmount = parseFloat(((itemLineTotalDC - (vndDiscAmtDC + itemExchDiscDC) + itemDcLineItemTaxAmount + itemDcLineItemEnvTaxAmount)).toFixed(2));
         itemNdcLineItemDollarDisplayAmount = parseFloat(((itemLineTotalNDC - (vndDiscAmtNDC + itemExchDiscNDC) + itemNdcLineItemTaxAmount + itemNdcLineItemEnvTaxAmount)).toFixed(2));
      }

      const itemDcDiscountAmount = vndDiscAmtDC;
      const itemNdcDiscountAmount = vndDiscAmtNDC;
      const itemDcCouponLineItemDollarAmount = itemExchDiscDC;
      const itemNdcCouponLineItemDollarAmount = itemExchDiscNDC;

      lineItemGrantTotal = 0;
      lineitemGrandTotalNDC = 0;
      subTotalDC = 0;
      subTotalNDC = 0;
      totalSavingsDC = 0;
      totalSavingsNDC = 0;
      totalTaxDC = 0;
      totalTaxNDC = 0;
      for (let i = 0; i < state.tktObj.tktList.length; i++) {
         if (state.tktObj.tktList[i].salesItemUID == action.saleItemId && state.tktObj.tktList[i].ticketDetailId == action.tktDtlId) {
            lineItemGrantTotal = parseFloat((lineItemGrantTotal + (dfltCurr == "USD" ? itemDcLineItemDollarDisplayAmount : itemNdcLineItemDollarDisplayAmount)).toFixed(2));
            lineitemGrandTotalNDC = parseFloat((lineitemGrandTotalNDC + (dfltCurr == "USD" ? itemNdcLineItemDollarDisplayAmount : itemDcLineItemDollarDisplayAmount)).toFixed(2));

            subTotalDC = parseFloat((subTotalDC + (dfltCurr == "USD" ? (itemDcLineItemDollarDisplayAmount - (itemDcLineItemTaxAmount + itemDcLineItemEnvTaxAmount)) :
               (itemNdcLineItemDollarDisplayAmount - (itemNdcLineItemTaxAmount + itemNdcLineItemEnvTaxAmount)))).toFixed(2));
            subTotalNDC = parseFloat((subTotalNDC + (dfltCurr == "USD" ? (itemNdcLineItemDollarDisplayAmount - (itemNdcLineItemTaxAmount + itemNdcLineItemEnvTaxAmount)) :
               (itemDcLineItemDollarDisplayAmount - (itemDcLineItemTaxAmount + itemDcLineItemEnvTaxAmount)))).toFixed(2));

            totalSavingsDC = parseFloat((totalSavingsDC + (dfltCurr == "USD" ? (itemDcDiscountAmount + itemDcCouponLineItemDollarAmount) : (itemNdcDiscountAmount + itemNdcCouponLineItemDollarAmount))).toFixed(2));
            totalSavingsNDC = parseFloat((totalSavingsNDC + (dfltCurr == "USD" ? (itemNdcDiscountAmount + itemNdcCouponLineItemDollarAmount) : (itemDcDiscountAmount + itemDcCouponLineItemDollarAmount))).toFixed(2));

            totalTaxDC = parseFloat((totalTaxDC + (dfltCurr == "USD" ? itemDcLineItemTaxAmount : itemNdcLineItemTaxAmount)).toFixed(2));
            totalTaxNDC = parseFloat((totalTaxNDC + (dfltCurr == "USD" ? itemNdcLineItemTaxAmount : itemDcLineItemTaxAmount)).toFixed(2));
         }
         else {
            lineItemGrantTotal = parseFloat((lineItemGrantTotal + (dfltCurr == "USD" ? state.tktObj.tktList[i].lineItemDollarDisplayAmount : state.tktObj.tktList[i].dcLineItemDollarDisplayAmount)).toFixed(2));
            lineitemGrandTotalNDC = parseFloat((lineitemGrandTotalNDC + (dfltCurr == "USD" ? state.tktObj.tktList[i].dcLineItemDollarDisplayAmount : state.tktObj.tktList[i].lineItemDollarDisplayAmount)).toFixed(2));

            subTotalDC = parseFloat((subTotalDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].lineItemDollarDisplayAmount - (state.tktObj.tktList[i].lineItemTaxAmount + state.tktObj.tktList[i].lineItemEnvTaxAmount)) :
               (state.tktObj.tktList[i].dcLineItemDollarDisplayAmount - (state.tktObj.tktList[i].dcLineItemTaxAmount + state.tktObj.tktList[i].fcLineItemEnvTaxAmount)))).toFixed(2));
            subTotalNDC = parseFloat((subTotalNDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].dcLineItemDollarDisplayAmount - (state.tktObj.tktList[i].dcLineItemTaxAmount + state.tktObj.tktList[i].fcLineItemEnvTaxAmount)) :
               (state.tktObj.tktList[i].lineItemDollarDisplayAmount - (state.tktObj.tktList[i].lineItemTaxAmount + state.tktObj.tktList[i].lineItemEnvTaxAmount)))).toFixed(2));

            totalSavingsDC = parseFloat((totalSavingsDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].discountAmount + state.tktObj.tktList[i].couponLineItemDollarAmount) : (state.tktObj.tktList[i].dcDiscountAmount + state.tktObj.tktList[i].dcCouponLineItemDollarAmount))).toFixed(2));
            totalSavingsNDC = parseFloat((totalSavingsNDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].dcDiscountAmount + state.tktObj.tktList[i].dcCouponLineItemDollarAmount) : (state.tktObj.tktList[i].discountAmount + state.tktObj.tktList[i].couponLineItemDollarAmount))).toFixed(2));

            totalTaxDC = parseFloat((totalTaxDC + (dfltCurr == "USD" ? state.tktObj.tktList[i].lineItemTaxAmount : state.tktObj.tktList[i].dcLineItemTaxAmount)).toFixed(2));
            totalTaxNDC = parseFloat((totalTaxNDC + (dfltCurr == "USD" ? state.tktObj.tktList[i].dcLineItemTaxAmount : state.tktObj.tktList[i].lineItemTaxAmount)).toFixed(2));
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

                     lineItemDollarDisplayAmount: dfltCurr == "USD" ? itemDcLineItemDollarDisplayAmount : itemNdcLineItemDollarDisplayAmount,
                     dcLineItemDollarDisplayAmount: dfltCurr == "USD" ? itemNdcLineItemDollarDisplayAmount : itemDcLineItemDollarDisplayAmount,

                     lineItemTaxAmount: dfltCurr == "USD" ? itemDcLineItemTaxAmount : itemNdcLineItemTaxAmount,
                     lineItemEnvTaxAmount: dfltCurr == "USD" ? itemDcLineItemEnvTaxAmount : itemNdcLineItemEnvTaxAmount,
                     fCLineItemTaxAmount: dfltCurr == "USD" ? itemNdcLineItemTaxAmount : itemDcLineItemTaxAmount,
                     fcLineItemEnvTaxAmount: dfltCurr == "USD" ? itemNdcLineItemEnvTaxAmount : itemDcLineItemEnvTaxAmount,

                     dcCouponLineItemDollarAmount: dfltCurr == "USD" ? itemDcCouponLineItemDollarAmount : itemNdcCouponLineItemDollarAmount,
                     fCCouponLineItemDollarAmount: dfltCurr == "USD" ? itemNdcCouponLineItemDollarAmount : itemDcCouponLineItemDollarAmount,

                     discountAmount: dfltCurr == "USD" ? vndDiscAmtDC : vndDiscAmtNDC,
                     dcDiscountAmount: dfltCurr == "USD" ? vndDiscAmtNDC : vndDiscAmtDC,

                     vndCpnAmountDC: dfltCurr == "USD" ? vndDiscAmtDC : vndDiscAmtNDC,
                     vndCpnAmountNDC: dfltCurr == "USD" ? vndDiscAmtNDC : vndDiscAmtDC,

                     vendorCouponDiscountPct: cpnPct > 0 ? cpnPct : itm.vendorCouponDiscountPct
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

         lineItemGrantTotal = parseFloat((item.unitPrice * item.quantity).toFixed(2));
         lineitemGrandTotalNDC = parseFloat((item.dcUnitPrice * item.quantity).toFixed(2));

         subTotalDC += lineItemGrantTotal;
         subTotalNDC += lineitemGrandTotalNDC;

         if (action.cpnPct > 0) {
            exchDiscAmtDC = parseFloat((lineItemGrantTotal * action.cpnPct / 100).toFixed(2));
            exchDiscAmtNDC = parseFloat((lineitemGrandTotalNDC * action.cpnPct / 100).toFixed(2));
         }
         else {
            exchDiscAmtDC = parseFloat(action.cpnAmt.toFixed(2));
            exchDiscAmtNDC = parseFloat((action.cpnAmt * (dfltCurr == "USD" ? exchRate : (1 / exchRate))).toFixed(2));
         }
         item.exchCpnAmountDC = exchDiscAmtDC;
         item.exchCpnAmountNDC = exchDiscAmtNDC;

         totalExchCpnAmtDC += exchDiscAmtDC;
         totalExchCpnAmtNDC += exchDiscAmtNDC;

         if (state.tktObj.taxExempted) {
            item.lineItemTaxAmount = 0;
            item.lineItemEnvTaxAmount = 0;
            item.lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotal - exchDiscAmtDC).toFixed(2));

            item.dcLineItemTaxAmount = 0;
            item.fcLineItemEnvTaxAmount = 0;
            item.dcCouponLineItemDollarAmount = parseFloat((lineitemGrandTotalNDC - exchDiscAmtDC).toFixed(2));
         }
         else {
            if (action.logonDataSvc.getExchCouponAfterTax()) {
               item.lineItemTaxAmount = parseFloat(((lineItemGrantTotal) * item.salesTaxPct / 100).toFixed(2));
               item.dcLineItemTaxAmount = parseFloat(((lineitemGrandTotalNDC) * item.salesTaxPct / 100).toFixed(2));

               item.fcLineItemEnvTaxAmount = parseFloat(((lineitemGrandTotalNDC) * item.envrnmtlTaxPct / 100).toFixed(2));
               item.lineItemEnvTaxAmount = parseFloat(((lineItemGrantTotal) * item.envrnmtlTaxPct / 100).toFixed(2));

               item.lineItemDollarDisplayAmount = parseFloat(((lineItemGrantTotal + item.lineItemTaxAmount + item.lineItemEnvTaxAmount) - exchDiscAmtDC).toFixed(2));
               item.dcLineItemDollarDisplayAmount = parseFloat((lineitemGrandTotalNDC + item.dcLineItemTaxAmount + item.fcLineItemEnvTaxAmount - exchDiscAmtNDC).toFixed(2));
            }
            else {
               item.lineItemTaxAmount = parseFloat(((lineItemGrantTotal - exchDiscAmtDC - item.vndCpnAmountDC) * item.salesTaxPct / 100).toFixed(2));
               item.dcLineItemTaxAmount = parseFloat(((lineitemGrandTotalNDC - (exchDiscAmtNDC + item.vndCpnAmountNDC)) * item.salesTaxPct / 100).toFixed(2));

               item.fcLineItemEnvTaxAmount = parseFloat(((lineitemGrandTotalNDC - (exchDiscAmtNDC + item.vndCpnAmountNDC)) * item.envrnmtlTaxPct / 100).toFixed(2));
               item.lineItemEnvTaxAmount = parseFloat(((lineItemGrantTotal - exchDiscAmtDC - item.vndCpnAmountDC) * item.envrnmtlTaxPct / 100).toFixed(2));

               item.lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotal + item.lineItemTaxAmount + item.lineItemEnvTaxAmount).toFixed(2));
               item.dcLineItemDollarDisplayAmount = parseFloat((lineitemGrandTotalNDC + item.dcLineItemTaxAmount + item.fcLineItemEnvTaxAmount).toFixed(2));
            }

            item.dcCouponLineItemDollarAmount = parseFloat((exchDiscAmtNDC + item.vndCpnAmountNDC).toFixed(2));
            item.couponLineItemDollarAmount = parseFloat((exchDiscAmtDC + item.vndCpnAmountDC).toFixed(2));

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

