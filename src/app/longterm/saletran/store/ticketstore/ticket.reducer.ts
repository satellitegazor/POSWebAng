import { state } from "@angular/animations";
import { compileDeclareNgModuleFromMetadata } from "@angular/compiler";
import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "src/app/global/global.constants";
import { AssociateSaleTips } from "src/app/models/associate.sale.tips";
import { LTC_Customer } from "src/app/models/customer";
import { TenderStatusType, TicketTender, TranStatusType } from "src/app/models/ticket.tender";
import { SalesTransactionCheckoutItem } from "../../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj, addCustomerId, addNewCustomer, addTender, updateSaleitems, updateCheckoutTotals, updateServedByAssociate, upsertAssocTips, delSaleitemZeroQty, updateTaxExempt, upsertSaleItemExchCpn, upsertSaleItemVndCpn, upsertTranExchCpn, saveTicketForGuestCheckSuccess, resetTktObj, updateAssocInAssocTips, updatePartPayData, removeTndrWithSaveCode, saveCompleteTicketSplitSuccess, addPinpadResp, saveTenderObjSuccess, savePinpadResponse, updateTenderRRN, markTendersComplete, markTicketComplete, addTabSerialToTktObj, isSplitPayR5, deleteDeclinedTender, loadTicketSuccess, loadInProgressTendersSuccess, updateShipHandling } from "./ticket.action";
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
            transactionDate: new Date(Date.now()),
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
            ticketNumber: 0,
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
         ltotalSavingsDC += parseFloat((k.exchCpnAmountDC + (action.defCurrSymbl == '$' ? (k.discountAmount + k.lineItmKatsaCpnAmt) : (k.dcDiscountAmount + k.fcLineItmKatsaCpnAmt))).toCPOSFixed(2));
         ltotalSavingsNDC += parseFloat((k.exchCpnAmountNDC + (action.defCurrSymbl == '$' ? (k.dcDiscountAmount + k.fcLineItmKatsaCpnAmt) : (k.discountAmount + k.lineItmKatsaCpnAmt))).toCPOSFixed(2));
         ltotalTaxDC += parseFloat((action.defCurrSymbl == '$' ? (k.lineItemTaxAmount + k.lineItemEnvTaxAmount) : (k.dcLineItemTaxAmount + k.fcLineItemEnvTaxAmount)).toCPOSFixed(2));
         ltotalTaxNDC += parseFloat((action.defCurrSymbl == '$' ? (k.dcLineItemTaxAmount + k.fcLineItemEnvTaxAmount) : (k.lineItemTaxAmount + k.lineItemEnvTaxAmount)).toCPOSFixed(2));

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
      newCheckOutItem.lineItemTaxAmount = parseFloat((state.tktObj.taxExempted ? 0 : (action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))  * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01).toCPOSFixed(2));
      newCheckOutItem.dcLineItemTaxAmount = parseFloat((state.tktObj.taxExempted ? 0 : (action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate)) * newCheckOutItem.quantity * newCheckOutItem.salesTaxPct * 0.01).toCPOSFixed(2));
      
      newCheckOutItem.lineItemDollarDisplayAmount = parseFloat(((((action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) + newCheckOutItem.lineItemTaxAmount).toCPOSFixed(2));
      newCheckOutItem.dcLineItemDollarDisplayAmount = parseFloat(((((action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) + newCheckOutItem.dcLineItemTaxAmount).toCPOSFixed(2));
      
      newCheckOutItem.lineItemEnvTaxAmount = parseFloat(((((action.defCurrSymbl == '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice / action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) * newCheckOutItem.envrnmtlTaxPct * 0.01).toCPOSFixed(2));
      newCheckOutItem.fcLineItemEnvTaxAmount = parseFloat(((((action.defCurrSymbl != '$' ? newCheckOutItem.unitPrice : (newCheckOutItem.unitPrice * action.dailyExchRateObj.exchangeRate))) * newCheckOutItem.quantity) * newCheckOutItem.envrnmtlTaxPct * 0.01).toCPOSFixed(2));
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
      ltotalSavingsDC += parseFloat((newCheckOutItem.exchCpnAmountDC + (action.defCurrSymbl == '$' ? (newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt) : (newCheckOutItem.dcDiscountAmount + newCheckOutItem.fcLineItmKatsaCpnAmt))).toCPOSFixed(2));
      ltotalSavingsNDC += parseFloat((newCheckOutItem.exchCpnAmountNDC + (action.defCurrSymbl != '$' ? (newCheckOutItem.discountAmount + newCheckOutItem.lineItmKatsaCpnAmt) : (newCheckOutItem.dcDiscountAmount + newCheckOutItem.fcLineItmKatsaCpnAmt))).toCPOSFixed(2));
      ltotalTaxDC += parseFloat((action.defCurrSymbl == '$' ? (newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount) : (newCheckOutItem.dcLineItemTaxAmount + newCheckOutItem.fcLineItemEnvTaxAmount)).toCPOSFixed(2));
      ltotalTaxNDC += parseFloat((action.defCurrSymbl != '$' ? (newCheckOutItem.lineItemTaxAmount + newCheckOutItem.lineItemEnvTaxAmount) : (newCheckOutItem.dcLineItemTaxAmount + newCheckOutItem.fcLineItemEnvTaxAmount)).toCPOSFixed(2));

      lsubTotalDC = parseFloat((lgrandTotalDC - ltotalTaxDC).toCPOSFixed(2));
      lsubTotalNDC = parseFloat((lgrandTotalNDC - ltotalTaxNDC).toCPOSFixed(2));

      lgrandTotalDC += action.defCurrSymbl == '$' ? (state.tktObj.shipHandling + state.tktObj.shipHandlingTaxAmt) : (state.tktObj.shipHandlingFC + state.tktObj.shipHandlingTaxAmtFC);
      lgrandTotalNDC += action.defCurrSymbl != '$' ? (state.tktObj.shipHandling + state.tktObj.shipHandlingTaxAmt) : (state.tktObj.shipHandlingFC + state.tktObj.shipHandlingTaxAmtFC);

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
                     lineItemDollarDisplayAmount: parseFloat(((itm.lineItemDollarDisplayAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)), //Number(Number(Number((itm.unitPrice * (itm.quantity + 1)) + (state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity + 1) * itm.salesTaxPct * 0.01)))).toCPOSFixed(2)),
                     lineItemTaxAmount: parseFloat(((itm.lineItemTaxAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),//Number(Number(Number(state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity + 1) * itm.salesTaxPct * 0.01))).toCPOSFixed(2)),
                     couponLineItemDollarAmount: parseFloat(((itm.couponLineItemDollarAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     exchCpnAmountDC: parseFloat(((itm.exchCpnAmountDC / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     exchCpnAmountNDC: parseFloat(((itm.exchCpnAmountNDC / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     discountAmount: parseFloat(((itm.discountAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     dcDiscountAmount: parseFloat(((itm.dcDiscountAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     fcLineItmKatsaCpnAmt: parseFloat(((itm.fcLineItmKatsaCpnAmt / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     lineItmKatsaCpnAmt: parseFloat(((itm.lineItmKatsaCpnAmt / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),
                     dcLineItemTaxAmount: parseFloat(((itm.dcLineItemTaxAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),//Number(Number(state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity + 1) * itm.salesTaxPct * 0.01)).toCPOSFixed(2)),
                     dcLineItemDollarDisplayAmount: parseFloat(((itm.dcLineItemDollarDisplayAmount / itm.quantity) * (itm.quantity + 1)).toCPOSFixed(2)),//Number(Number((unitPriceNDC * (itm.quantity + 1)) + (state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity + 1) * itm.salesTaxPct * 0.01))).toCPOSFixed(2))
                     
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
                     lineItemDollarDisplayAmount: parseFloat(((itm.lineItemDollarDisplayAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)), //Number(Number(Number((itm.unitPrice * (itm.quantity - 1)) + (state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity - 1) * itm.salesTaxPct * 0.01)))).toCPOSFixed(2)),
                     lineItemTaxAmount: parseFloat(((itm.lineItemTaxAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),//Number(Number(Number(state.tktObj.taxExempted ? 0 : (itm.unitPrice * (itm.quantity - 1) * itm.salesTaxPct * 0.01))).toCPOSFixed(2)),
                     couponLineItemDollarAmount: parseFloat(((itm.couponLineItemDollarAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     exchCpnAmountDC: parseFloat(((itm.exchCpnAmountDC / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     exchCpnAmountNDC: parseFloat(((itm.exchCpnAmountNDC / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     discountAmount: parseFloat(((itm.discountAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     dcDiscountAmount: parseFloat(((itm.dcDiscountAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     fcLineItmKatsaCpnAmt: parseFloat(((itm.fcLineItmKatsaCpnAmt / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     lineItmKatsaCpnAmt: parseFloat(((itm.lineItmKatsaCpnAmt / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),
                     dcLineItemTaxAmount: parseFloat(((itm.dcLineItemTaxAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),//Number(Number(state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity - 1) * itm.salesTaxPct * 0.01)).toCPOSFixed(2)),
                     dcLineItemDollarDisplayAmount: parseFloat(((itm.dcLineItemDollarDisplayAmount / itm.quantity) * (itm.quantity - 1)).toCPOSFixed(2)),//Number(Number((unitPriceNDC * (itm.quantity - 1)) + (state.tktObj.taxExempted ? 0 : (unitPriceNDC * (itm.quantity - 1) * itm.salesTaxPct * 0.01))).toCPOSFixed(2))
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
      const transCouponPct = state.tktObj.tCouponPerc || 0;
      const transCouponAmtUsd = state.tktObj.tCouponAmt || 0;
      const transCouponAmtNdc = state.tktObj.tDCouponAmt || 0;
      const isUsd = exchRateObj.dfltCurrCode == 'USD';
      const transCouponDC = isUsd ? transCouponAmtUsd : transCouponAmtNdc;
      const transCouponNDC = isUsd ? transCouponAmtNdc : transCouponAmtUsd;
      const useTransCoupon = transCouponPct > 0 || transCouponDC > 0 || transCouponNDC > 0;

      let eligibleBaseDC = 0;
      let eligibleBaseNDC = 0;
      let remainingCouponDC = transCouponDC;
      let remainingCouponNDC = transCouponNDC;
      let lastEligibleIndex = -1;

      if (useTransCoupon && transCouponPct <= 0) {
         for (let i = 0; i < updatedTktList.length; i++) {
            const isKatusaEligible = (updatedTktList[i].deptName ?? '').toUpperCase() !== 'KATUSA';
            if (!isKatusaEligible) {
               continue;
            }

            const baseDC = ((updatedTktList[i].unitPrice * updatedTktList[i].quantity) * 100) / 100;
            const unitPriceNDC = exchRateObj.dfltCurrCode == 'USD'
               ? (updatedTktList[i].unitPrice * exchRateObj.exchangeRate)
               : (updatedTktList[i].unitPrice / exchRateObj.exchangeRate);
            const baseNDC = ((unitPriceNDC * updatedTktList[i].quantity) * 100) / 100;

            if (baseDC > 0 || baseNDC > 0) {
               eligibleBaseDC += baseDC;
               eligibleBaseNDC += baseNDC;
               lastEligibleIndex = i;
            }
         }
      }

      for (let k = 0; k < updatedTktList.length; k++) {

         const isKatusaLineItem = (updatedTktList[k].deptName ?? '').toUpperCase() === 'KATUSA';

         let subTotalDC = (( updatedTktList[k].unitPrice * updatedTktList[k].quantity) * 100) / 100;
         let exchCpnTotalDC = 0;
         if (useTransCoupon) {
            if (!isKatusaLineItem) {
               if (transCouponPct > 0) {
                  exchCpnTotalDC = ((subTotalDC) * transCouponPct * 0.01 * 100) / 100;
               } else if (k === lastEligibleIndex) {
                  exchCpnTotalDC = remainingCouponDC;
               } else {
                  exchCpnTotalDC = eligibleBaseDC > 0
                     ? Round2DecimalService.round(transCouponDC * (subTotalDC / eligibleBaseDC))
                     : 0;
                  remainingCouponDC = Round2DecimalService.round(remainingCouponDC - exchCpnTotalDC);
               }
            }
         } else {
            exchCpnTotalDC = ((updatedTktList[k].unitPrice * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100;
         }
         let vndDiscountTotalDC = (updatedTktList[k].discountAmount | 0 * 100) / 100;
         if (isKatusaLineItem) {
            exchCpnTotalDC = 0;
         }
         const lineItmKtsCpnDC = isKatusaLineItem ? Math.max(0, (subTotalDC - vndDiscountTotalDC)) : 0;
         let totalDiscountDC = exchCpnTotalDC + vndDiscountTotalDC + lineItmKtsCpnDC;
         let preTaxDiscountDC = (VendCouponsAfterTax ? 0 : vndDiscountTotalDC) + (ExchCouponsAfterTax ? 0 : exchCpnTotalDC);
         if (isKatusaLineItem && !ExchCouponsAfterTax && VendCouponsAfterTax) {
            preTaxDiscountDC += lineItmKtsCpnDC;
         }
         let taxableBaseDC = subTotalDC - preTaxDiscountDC;
         let saleTaxTotalDC = ((taxableBaseDC) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100;
         let envTaxTotalDC = ((taxableBaseDC) * updatedTktList[k].envrnmtlTaxPct * 0.01 * 100) / 100;

         let unitPriceNDC = exchRateObj.dfltCurrCode == 'USD' ? (updatedTktList[k].unitPrice * exchRateObj.exchangeRate) : (updatedTktList[k].unitPrice / exchRateObj.exchangeRate);
         let subTotalNDC = (( unitPriceNDC * updatedTktList[k].quantity) * 100) / 100;
         let exchCpnTotalNDC = 0;
         if (useTransCoupon) {
            if (!isKatusaLineItem) {
               if (transCouponPct > 0) {
                  exchCpnTotalNDC = ((subTotalNDC) * transCouponPct * 0.01 * 100) / 100;
               } else if (k === lastEligibleIndex) {
                  exchCpnTotalNDC = remainingCouponNDC;
               } else {
                  exchCpnTotalNDC = eligibleBaseNDC > 0
                     ? Round2DecimalService.round(transCouponNDC * (subTotalNDC / eligibleBaseNDC))
                     : 0;
                  remainingCouponNDC = Round2DecimalService.round(remainingCouponNDC - exchCpnTotalNDC);
               }
            }
         } else {
            exchCpnTotalNDC = ((unitPriceNDC * updatedTktList[k].quantity) * updatedTktList[k].exchangeCouponDiscountPct * 0.01 * 100) / 100;
         }
         let vndDiscountTotalNDC = (updatedTktList[k].dcDiscountAmount | 0 * 100) / 100;
         if (isKatusaLineItem) {
            exchCpnTotalNDC = 0;
         }
         const lineItmKtsCpnNDC = isKatusaLineItem ? Math.max(0, (subTotalNDC - vndDiscountTotalNDC)) : 0;
         let totalDiscountNDC = exchCpnTotalNDC + vndDiscountTotalNDC + lineItmKtsCpnNDC;
         let preTaxDiscountNDC = (VendCouponsAfterTax ? 0 : vndDiscountTotalNDC) + (ExchCouponsAfterTax ? 0 : exchCpnTotalNDC);
         if (isKatusaLineItem && !ExchCouponsAfterTax && VendCouponsAfterTax) {
            preTaxDiscountNDC += lineItmKtsCpnNDC;
         }
         let taxableBaseNDC = subTotalNDC - preTaxDiscountNDC;
         let saleTaxTotalNDC = ((taxableBaseNDC) * updatedTktList[k].salesTaxPct * 0.01 * 100) / 100;
         let envTaxTotalNDC = ((taxableBaseNDC) * updatedTktList[k].envrnmtlTaxPct * 0.01 * 100) / 100;

         if (taxExepted) {
            saleTaxTotalDC = 0;
            saleTaxTotalNDC = 0;
            envTaxTotalDC = 0;
            envTaxTotalNDC = 0;
         }

         if (isKatusaLineItem && !ExchCouponsAfterTax && !VendCouponsAfterTax) {
            saleTaxTotalDC = 0;
            saleTaxTotalNDC = 0;
            envTaxTotalDC = 0;
            envTaxTotalNDC = 0;
         }

         if (exchRateObj.dfltCurrCode == 'USD') {

            updatedTktList[k].lineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalDC - totalDiscountDC + (taxExepted ? 0 : (saleTaxTotalDC + envTaxTotalDC))) * 100) / 100);
            updatedTktList[k].lineItemTaxAmount = taxExepted ? 0 : saleTaxTotalDC;
            updatedTktList[k].lineItemEnvTaxAmount = taxExepted ? 0 : envTaxTotalDC;
            updatedTktList[k].discountAmount = Round2DecimalService.round(totalDiscountDC);

            updatedTktList[k].dcLineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalNDC - totalDiscountNDC + (taxExepted ? 0 : (saleTaxTotalNDC + envTaxTotalNDC))) * 100) / 100);
            updatedTktList[k].dcLineItemTaxAmount = taxExepted ? 0 : saleTaxTotalNDC;
            updatedTktList[k].fcLineItemEnvTaxAmount = taxExepted ? 0 : envTaxTotalNDC;
            updatedTktList[k].dcDiscountAmount = Round2DecimalService.round(totalDiscountNDC);

            totalSaleDC += Round2DecimalService.round(updatedTktList[k].lineItemDollarDisplayAmount);
            totalSaleNDC += Round2DecimalService.round(updatedTktList[k].dcLineItemDollarDisplayAmount);
         }
         else {
            updatedTktList[k].lineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalNDC - totalDiscountNDC + (taxExepted ? 0 : (saleTaxTotalNDC + envTaxTotalNDC))) * 100) / 100);
            updatedTktList[k].lineItemTaxAmount = taxExepted ? 0 : saleTaxTotalNDC;
            updatedTktList[k].lineItemEnvTaxAmount = taxExepted ? 0 : envTaxTotalNDC;
            updatedTktList[k].discountAmount = Round2DecimalService.round(totalDiscountNDC);

            updatedTktList[k].dcLineItemDollarDisplayAmount = Round2DecimalService.round(((subTotalDC - totalDiscountDC + (taxExepted ? 0 : (saleTaxTotalDC + envTaxTotalDC))) * 100) / 100);
            updatedTktList[k].dcLineItemTaxAmount = taxExepted ? 0 : saleTaxTotalDC;
            updatedTktList[k].fcLineItemEnvTaxAmount = taxExepted ? 0 : envTaxTotalDC;
            updatedTktList[k].dcDiscountAmount = Round2DecimalService.round(totalDiscountDC);

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

      // Ship/Handling amounts are stored as USD (shipHandling*) and non-USD (shipHandling*FC).
      const shipHandlingTaxAmtUsd = taxExepted ? 0 : (state.tktObj.shipHandlingTaxAmt || 0);
      const shipHandlingTaxAmtFc = taxExepted ? 0 : (state.tktObj.shipHandlingTaxAmtFC || 0);
      const shipHandlingAmtUsd = state.tktObj.shipHandling || 0;
      const shipHandlingAmtFc = state.tktObj.shipHandlingFC || 0;

      totalSaleDC += Round2DecimalService.round(shipHandlingAmtUsd + shipHandlingTaxAmtUsd);
      totalSaleNDC += Round2DecimalService.round(shipHandlingAmtFc + shipHandlingTaxAmtFc);

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList,
            shipHandlingTaxAmt: shipHandlingTaxAmtUsd,
            shipHandlingTaxAmtFC: shipHandlingTaxAmtFc,
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

      const lineItemGrantTotalDC = parseFloat((tktItem.unitPrice * tktItem.quantity).toCPOSFixed(2));
      const lineItemGrantTotalNDC = parseFloat((lineItemGrantTotalDC * (isUsd ? exchRate : (1 / exchRate))).toCPOSFixed(2));

      let exchDiscAmtDC = 0;
      let exchDiscAmtNDC = 0;

      if (action.cpnPct > 0) {
         exchDiscAmtDC = parseFloat((lineItemGrantTotalDC * action.cpnPct / 100).toCPOSFixed(2));
         exchDiscAmtNDC = parseFloat((lineItemGrantTotalNDC * action.cpnPct / 100).toCPOSFixed(2));
      } else {
         // Amount always in USD
         exchDiscAmtDC = parseFloat((action.cpnAmt * (isUsd ? (1) : exchRate)).toCPOSFixed(2)); // USD
         exchDiscAmtNDC = parseFloat((action.cpnAmt * (isUsd ? exchRate : (1))).toCPOSFixed(2));
      }

      let lineItemTaxAmount = 0;
      let dcLineItemTaxAmount = 0;

      let lineItemEnvTaxAmount = 0;
      let fCLineItemEnvTaxAmount = 0;

      let lineItemDollarDisplayAmount = 0;
      let dcLineItemDollarDisplayAmount = 0;

      let dcCouponLineItemDollarAmount = 0;

      const vendAfterTax = action.logonDataSvc.getVendorCouponAfterTax();
      const exchAfterTax = action.logonDataSvc.getExchCouponAfterTax();

      const totalDiscountDC = exchDiscAmtDC + (tktItem.vndCpnAmountDC || 0);
      const totalDiscountNDC = exchDiscAmtNDC + (tktItem.vndCpnAmountNDC || 0);

      const preTaxDiscountDC = (vendAfterTax ? 0 : (tktItem.vndCpnAmountDC || 0)) + (exchAfterTax ? 0 : exchDiscAmtDC);
      const preTaxDiscountNDC = (vendAfterTax ? 0 : (tktItem.vndCpnAmountNDC || 0)) + (exchAfterTax ? 0 : exchDiscAmtNDC);

      const taxableBaseDC = lineItemGrantTotalDC - preTaxDiscountDC;
      const taxableBaseNDC = lineItemGrantTotalNDC - preTaxDiscountNDC;

      if (state.tktObj.taxExempted) {

         lineItemTaxAmount = 0;
         lineItemEnvTaxAmount = 0;
         dcLineItemTaxAmount = 0;
         fCLineItemEnvTaxAmount = 0;

         lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotalDC - totalDiscountDC).toCPOSFixed(2));
         dcLineItemDollarDisplayAmount = parseFloat((lineItemGrantTotalNDC - totalDiscountNDC).toCPOSFixed(2));

         dcCouponLineItemDollarAmount = parseFloat(exchDiscAmtDC.toCPOSFixed(2));
      } else {
         lineItemTaxAmount = parseFloat((taxableBaseDC * tktItem.salesTaxPct / 100).toCPOSFixed(2));
         lineItemEnvTaxAmount = parseFloat((taxableBaseDC * tktItem.envrnmtlTaxPct / 100).toCPOSFixed(2));
         lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotalDC - totalDiscountDC + lineItemTaxAmount + lineItemEnvTaxAmount).toCPOSFixed(2));

         dcLineItemTaxAmount = parseFloat((taxableBaseNDC * tktItem.salesTaxPct / 100).toCPOSFixed(2));
         fCLineItemEnvTaxAmount = parseFloat((taxableBaseNDC * tktItem.envrnmtlTaxPct / 100).toCPOSFixed(2));
         dcLineItemDollarDisplayAmount = parseFloat((lineItemGrantTotalNDC - totalDiscountNDC + dcLineItemTaxAmount + fCLineItemEnvTaxAmount).toCPOSFixed(2));

         dcCouponLineItemDollarAmount = parseFloat(exchDiscAmtDC.toCPOSFixed(2));
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
               exchangeCouponDiscountPct: parseFloat((itm.exchangeCouponDiscountPct > 0 ? action.cpnPct : itm.exchangeCouponDiscountPct).toCPOSFixed(2)),

               lineItemDollarDisplayAmount: parseFloat(lineItemDollarDisplayAmount.toCPOSFixed(2)),
               dcLineItemDollarDisplayAmount: parseFloat(dcLineItemDollarDisplayAmount.toCPOSFixed(2)),

               lineItemTaxAmount: parseFloat(lineItemTaxAmount.toCPOSFixed(2)),
               lineItemEnvTaxAmount: parseFloat(lineItemEnvTaxAmount.toCPOSFixed(2)),

               dcLineItemTaxAmount: parseFloat(dcLineItemTaxAmount.toCPOSFixed(2)),
               fCLineItemEnvTaxAmount: parseFloat(fCLineItemEnvTaxAmount.toCPOSFixed(2)),

               dcCouponLineItemDollarAmount: parseFloat(dcCouponLineItemDollarAmount.toCPOSFixed(2)),

               exchCpnAmountDC: parseFloat(exchDiscAmtDC.toCPOSFixed(2)),
               exchCpnAmountNDC: parseFloat(exchDiscAmtNDC.toCPOSFixed(2)),
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
            grandTotalDC: parseFloat(grandTotalDC.toCPOSFixed(2)),
            grandTotalNDC: parseFloat(grandTotalNDC.toCPOSFixed(2)),
            totalSavingsDC: parseFloat(totalSavingsDC.toCPOSFixed(2)),
            totalSavingsNDC: parseFloat(totalSavingsNDC.toCPOSFixed(2)),
            subTotalDC: parseFloat(subTotalDC.toCPOSFixed(2)),
            subTotalNDC: parseFloat(subTotalNDC.toCPOSFixed(2)),
            totalTaxDC: parseFloat(totalTaxDC.toCPOSFixed(2)),
            totalTaxNDC: parseFloat(totalTaxNDC.toCPOSFixed(2)),
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

      let tktListCopy: SalesTransactionCheckoutItem[] = JSON.parse(JSON.stringify(state.tktObj.tktList));

      const totalBaseDC = tktListCopy.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalBaseNDC = tktListCopy.reduce((sum, item) => sum + (item.dcUnitPrice * item.quantity), 0);

      const totalCouponDC = action.cpnPct > 0
         ? 0
         : parseFloat((action.cpnAmt * (dfltCurr == "USD" ? 1 : exchRate)).toCPOSFixed(2));
      const totalCouponNDC = action.cpnPct > 0
         ? 0
         : parseFloat((action.cpnAmt * (dfltCurr == "USD" ? exchRate : (1 / exchRate))).toCPOSFixed(2));

      let remainingCouponDC = totalCouponDC;
      let remainingCouponNDC = totalCouponNDC;

      const vendAfterTax = action.logonDataSvc.getVendorCouponAfterTax();
      const exchAfterTax = action.logonDataSvc.getExchCouponAfterTax();

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      lineItemGrantTotal = tktItem.unitPrice * tktItem.quantity;
      lineitemGrandTotalNDC = parseFloat((tktItem.unitPrice * tktItem.quantity * (dfltCurr == "USD" ? action.logonDataSvc.getExchangeRate() : (1 / action.logonDataSvc.getExchangeRate()))).toCPOSFixed(2));

      const targetLineItemGrantTotal = lineItemGrantTotal;
      const targetLineitemGrandTotalNDC = lineitemGrandTotalNDC;

      if (cpnPct > 0) {
         vndDiscAmtDC = parseFloat((targetLineItemGrantTotal * cpnPct / 100).toCPOSFixed(2));
         vndDiscAmtNDC = parseFloat((targetLineitemGrandTotalNDC * cpnPct / 100).toCPOSFixed(2));
      }
      else if (cpnAmt > 0) {
         vndDiscAmtDC = parseFloat((cpnAmt).toCPOSFixed(2));
         vndDiscAmtNDC = parseFloat((cpnAmt * (dfltCurr == "USD" ? action.logonDataSvc.getExchangeRate() : (1 / action.logonDataSvc.getExchangeRate()))).toCPOSFixed(2));
      }

      let item = state.tktObj.tktList.filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0]

      const itemLineTotalDC = parseFloat((item.unitPrice * item.quantity).toCPOSFixed(2));
      const itemLineTotalNDC = parseFloat((itemLineTotalDC * (dfltCurr == "USD" ? action.logonDataSvc.getExchangeRate() : (1 / action.logonDataSvc.getExchangeRate()))).toCPOSFixed(2));

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
         itemDcLineItemTaxAmount = parseFloat(((itemLineTotalDC - itemDCBeforeTaxDiscount) * item.salesTaxPct / 100).toCPOSFixed(2));
         itemNdcLineItemTaxAmount = parseFloat(((itemLineTotalNDC - itemNDCBeforeTaxDiscount) * item.salesTaxPct / 100).toCPOSFixed(2));

         itemDcLineItemEnvTaxAmount = parseFloat(((itemLineTotalDC - itemDCBeforeTaxDiscount) * item.envrnmtlTaxPct / 100).toCPOSFixed(2));
         itemNdcLineItemEnvTaxAmount = parseFloat(((itemLineTotalNDC - itemNDCBeforeTaxDiscount) * item.envrnmtlTaxPct / 100).toCPOSFixed(2));

         itemDcLineItemDollarDisplayAmount = parseFloat(((itemLineTotalDC - (vndDiscAmtDC + itemExchDiscDC) + itemDcLineItemTaxAmount + itemDcLineItemEnvTaxAmount)).toCPOSFixed(2));
         itemNdcLineItemDollarDisplayAmount = parseFloat(((itemLineTotalNDC - (vndDiscAmtNDC + itemExchDiscNDC) + itemNdcLineItemTaxAmount + itemNdcLineItemEnvTaxAmount)).toCPOSFixed(2));
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
            lineItemGrantTotal = parseFloat((lineItemGrantTotal + (dfltCurr == "USD" ? itemDcLineItemDollarDisplayAmount : itemNdcLineItemDollarDisplayAmount)).toCPOSFixed(2));
            lineitemGrandTotalNDC = parseFloat((lineitemGrandTotalNDC + (dfltCurr == "USD" ? itemNdcLineItemDollarDisplayAmount : itemDcLineItemDollarDisplayAmount)).toCPOSFixed(2));

            subTotalDC = parseFloat((subTotalDC + (dfltCurr == "USD" ? (itemDcLineItemDollarDisplayAmount - (itemDcLineItemTaxAmount + itemDcLineItemEnvTaxAmount)) :
               (itemNdcLineItemDollarDisplayAmount - (itemNdcLineItemTaxAmount + itemNdcLineItemEnvTaxAmount)))).toCPOSFixed(2));
            subTotalNDC = parseFloat((subTotalNDC + (dfltCurr == "USD" ? (itemNdcLineItemDollarDisplayAmount - (itemNdcLineItemTaxAmount + itemNdcLineItemEnvTaxAmount)) :
               (itemDcLineItemDollarDisplayAmount - (itemDcLineItemTaxAmount + itemDcLineItemEnvTaxAmount)))).toCPOSFixed(2));

            totalSavingsDC = parseFloat((totalSavingsDC + (dfltCurr == "USD" ? (itemDcDiscountAmount + itemDcCouponLineItemDollarAmount) : (itemNdcDiscountAmount + itemNdcCouponLineItemDollarAmount))).toCPOSFixed(2));
            totalSavingsNDC = parseFloat((totalSavingsNDC + (dfltCurr == "USD" ? (itemNdcDiscountAmount + itemNdcCouponLineItemDollarAmount) : (itemDcDiscountAmount + itemDcCouponLineItemDollarAmount))).toCPOSFixed(2));

            totalTaxDC = parseFloat((totalTaxDC + (dfltCurr == "USD" ? itemDcLineItemTaxAmount : itemNdcLineItemTaxAmount)).toCPOSFixed(2));
            totalTaxNDC = parseFloat((totalTaxNDC + (dfltCurr == "USD" ? itemNdcLineItemTaxAmount : itemDcLineItemTaxAmount)).toCPOSFixed(2));
         }
         else {
            lineItemGrantTotal = parseFloat((lineItemGrantTotal + (dfltCurr == "USD" ? state.tktObj.tktList[i].lineItemDollarDisplayAmount : state.tktObj.tktList[i].dcLineItemDollarDisplayAmount)).toCPOSFixed(2));
            lineitemGrandTotalNDC = parseFloat((lineitemGrandTotalNDC + (dfltCurr == "USD" ? state.tktObj.tktList[i].dcLineItemDollarDisplayAmount : state.tktObj.tktList[i].lineItemDollarDisplayAmount)).toCPOSFixed(2));

            subTotalDC = parseFloat((subTotalDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].lineItemDollarDisplayAmount - (state.tktObj.tktList[i].lineItemTaxAmount + state.tktObj.tktList[i].lineItemEnvTaxAmount)) :
               (state.tktObj.tktList[i].dcLineItemDollarDisplayAmount - (state.tktObj.tktList[i].dcLineItemTaxAmount + state.tktObj.tktList[i].fcLineItemEnvTaxAmount)))).toCPOSFixed(2));
            subTotalNDC = parseFloat((subTotalNDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].dcLineItemDollarDisplayAmount - (state.tktObj.tktList[i].dcLineItemTaxAmount + state.tktObj.tktList[i].fcLineItemEnvTaxAmount)) :
               (state.tktObj.tktList[i].lineItemDollarDisplayAmount - (state.tktObj.tktList[i].lineItemTaxAmount + state.tktObj.tktList[i].lineItemEnvTaxAmount)))).toCPOSFixed(2));

            totalSavingsDC = parseFloat((totalSavingsDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].discountAmount + state.tktObj.tktList[i].couponLineItemDollarAmount) : (state.tktObj.tktList[i].dcDiscountAmount + state.tktObj.tktList[i].dcCouponLineItemDollarAmount))).toCPOSFixed(2));
            totalSavingsNDC = parseFloat((totalSavingsNDC + (dfltCurr == "USD" ? (state.tktObj.tktList[i].dcDiscountAmount + state.tktObj.tktList[i].dcCouponLineItemDollarAmount) : (state.tktObj.tktList[i].discountAmount + state.tktObj.tktList[i].couponLineItemDollarAmount))).toCPOSFixed(2));

            totalTaxDC = parseFloat((totalTaxDC + (dfltCurr == "USD" ? state.tktObj.tktList[i].lineItemTaxAmount : state.tktObj.tktList[i].dcLineItemTaxAmount)).toCPOSFixed(2));
            totalTaxNDC = parseFloat((totalTaxNDC + (dfltCurr == "USD" ? state.tktObj.tktList[i].dcLineItemTaxAmount : state.tktObj.tktList[i].lineItemTaxAmount)).toCPOSFixed(2));
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
      const vendAfterTax = action.logonDataSvc.getVendorCouponAfterTax();
      const exchAfterTax = action.logonDataSvc.getExchCouponAfterTax();

      const totalBaseDC = tktListCopy.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const totalBaseNDC = tktListCopy.reduce((sum, item) => sum + (item.dcUnitPrice * item.quantity), 0);

      const totalCouponDC = action.cpnPct > 0
         ? 0
         : parseFloat((action.cpnAmt * (dfltCurr == "USD" ? 1 : exchRate)).toCPOSFixed(2));
      const totalCouponNDC = action.cpnPct > 0
         ? 0
         : parseFloat((action.cpnAmt * (dfltCurr == "USD" ? exchRate : 1)).toCPOSFixed(2));

      let remainingCouponDC = totalCouponDC;
      let remainingCouponNDC = totalCouponNDC;

      tktListCopy.forEach((item, idx) => {
         item.exchCpnAmountDC = 0;
         item.exchCpnAmountNDC = 0;
         item.couponLineItemDollarAmount = 0;
         item.dcCouponLineItemDollarAmount = 0;

         lineItemGrantTotal = parseFloat((item.unitPrice * item.quantity).toCPOSFixed(2));
         lineitemGrandTotalNDC = parseFloat((item.dcUnitPrice * item.quantity).toCPOSFixed(2));

         subTotalDC += lineItemGrantTotal;
         subTotalNDC += lineitemGrandTotalNDC;

         if (action.cpnPct > 0) {
            exchDiscAmtDC = parseFloat((lineItemGrantTotal * action.cpnPct / 100).toCPOSFixed(2));
            exchDiscAmtNDC = parseFloat((lineitemGrandTotalNDC * action.cpnPct / 100).toCPOSFixed(2));
         }
         else {
            const isLast = idx === (tktListCopy.length - 1);
            if (!isLast) {
               exchDiscAmtDC = totalBaseDC > 0
                  ? parseFloat((totalCouponDC * (lineItemGrantTotal / totalBaseDC)).toCPOSFixed(2))
                  : 0;
               exchDiscAmtNDC = totalBaseNDC > 0
                  ? parseFloat((totalCouponNDC * (lineitemGrandTotalNDC / totalBaseNDC)).toCPOSFixed(2))
                  : 0;

               remainingCouponDC = parseFloat((remainingCouponDC - exchDiscAmtDC).toCPOSFixed(2));
               remainingCouponNDC = parseFloat((remainingCouponNDC - exchDiscAmtNDC).toCPOSFixed(2));
            }
            else {
               exchDiscAmtDC = parseFloat(remainingCouponDC.toCPOSFixed(2));
               exchDiscAmtNDC = parseFloat(remainingCouponNDC.toCPOSFixed(2));
            }
         }
         item.exchCpnAmountDC = exchDiscAmtDC;
         item.exchCpnAmountNDC = exchDiscAmtNDC;

         totalExchCpnAmtDC += exchDiscAmtDC;
         totalExchCpnAmtNDC += exchDiscAmtNDC;

         const totalDiscountDC = exchDiscAmtDC + (item.vndCpnAmountDC || 0);
         const totalDiscountNDC = exchDiscAmtNDC + (item.vndCpnAmountNDC || 0);

         const preTaxDiscountDC = (vendAfterTax ? 0 : (item.vndCpnAmountDC || 0)) + (exchAfterTax ? 0 : exchDiscAmtDC);
         const preTaxDiscountNDC = (vendAfterTax ? 0 : (item.vndCpnAmountNDC || 0)) + (exchAfterTax ? 0 : exchDiscAmtNDC);

         const taxableBaseDC = lineItemGrantTotal - preTaxDiscountDC;
         const taxableBaseNDC = lineitemGrandTotalNDC - preTaxDiscountNDC;

         if (state.tktObj.taxExempted) {
            item.lineItemTaxAmount = 0;
            item.lineItemEnvTaxAmount = 0;
            item.lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotal - totalDiscountDC).toCPOSFixed(2));

            item.dcLineItemTaxAmount = 0;
            item.fcLineItemEnvTaxAmount = 0;
            item.dcLineItemDollarDisplayAmount = parseFloat((lineitemGrandTotalNDC - totalDiscountNDC).toCPOSFixed(2));
         }
         else {
            item.lineItemTaxAmount = parseFloat((taxableBaseDC * item.salesTaxPct / 100).toCPOSFixed(2));
            item.dcLineItemTaxAmount = parseFloat((taxableBaseNDC * item.salesTaxPct / 100).toCPOSFixed(2));

            item.fcLineItemEnvTaxAmount = parseFloat((taxableBaseNDC * item.envrnmtlTaxPct / 100).toCPOSFixed(2));
            item.lineItemEnvTaxAmount = parseFloat((taxableBaseDC * item.envrnmtlTaxPct / 100).toCPOSFixed(2));

            item.lineItemDollarDisplayAmount = parseFloat((lineItemGrantTotal - totalDiscountDC + item.lineItemTaxAmount + item.lineItemEnvTaxAmount).toCPOSFixed(2));
            item.dcLineItemDollarDisplayAmount = parseFloat((lineitemGrandTotalNDC - totalDiscountNDC + item.dcLineItemTaxAmount + item.fcLineItemEnvTaxAmount).toCPOSFixed(2));
         }

         item.dcCouponLineItemDollarAmount = parseFloat((exchDiscAmtNDC + item.vndCpnAmountNDC).toCPOSFixed(2));
         item.couponLineItemDollarAmount = parseFloat((exchDiscAmtDC + item.vndCpnAmountDC).toCPOSFixed(2));

         totalTaxDC += item.lineItemTaxAmount;
         totalTaxNDC += item.dcLineItemTaxAmount;

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
            tCouponAmt: action.cpnAmt,
            tCouponPct: action.cpnPct,
            tDcouponAmt: action.cpnAmt * (dfltCurr == "USD" ? 1 : exchRate)
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
   }),

   on(updateShipHandling, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            shipHandling: action.shipHandlingAmountUSD,
            shipHandlingFC: action.shipHandlingAmountFC,
            shipHandlingTaxAmt: action.shipHandlingTaxUSD,
            shipHandlingTaxAmtFC: action.shipHandlingTaxFC
         }
      }
   })   
)


export function TktObjReducer(state: saleTranDataInterface, action: Action) {
   return _tktObjReducer(state, action);

}

