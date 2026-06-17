import { state } from "@angular/animations";
import { compileDeclareNgModuleFromMetadata } from "@angular/compiler";
import { act } from "@ngrx/effects";
import { Action, createReducer, on } from "@ngrx/store";
import { GlobalConstants } from "../../../../global/global.constants";
import { AssociateSaleTips } from "../../../..//models/associate.sale.tips";
import { LTC_Customer } from "../../../../models/customer";
import { TenderStatusType, TicketTender, TranStatusType } from "../../../../models/ticket.tender";
import { SalesTransactionCheckoutItem } from "../../../models/salesTransactionCheckoutItem";
import { addSaleItem, incSaleitemQty, decSaleitemQty, initTktObj, addCustomerId, addNewCustomer, addTender, updateSaleitems, updateCheckoutTotals, updateServedByAssociate, upsertAssocTips, delSaleitemZeroQty, updateTaxExempt, upsertSaleItemExchCpn, upsertSaleItemVndCpn, upsertTranExchCpn, saveTicketForGuestCheckSuccess, resetTktObj, updateAssocInAssocTips, updatePartPayData, removeTndrWithSaveCode, saveCompleteTicketSplitSuccess, addPinpadResp, saveTenderObjSuccess, saveTicketDetailSuccess, inactiveTicketDetailSuccess, savePinpadResponse, updateTenderRRN, markTendersComplete, markTicketComplete, addTabSerialToTktObj, isSplitPayR5, deleteDeclinedTenderFromStore, loadTicketSuccess, loadInProgressTendersSuccess, updateShipHandling, addRefundReason } from "./ticket.action";
import { Round2DecimalService } from "../../../../services-misc/round2-decimal.service";
import { tktObjInitialState, saleTranDataInterface } from "./ticket.state";
import { ExchCardTndr } from "../../../../models/exch.card.tndr";
import { UtilService } from "../../../../services-misc/util.service";
import { mapLtcTicketToTicketSplit, TicketDetailListAry, TicketSplit } from "../../../../models/ticket.split";
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
            individualUID: action.locConfig.individualUID,
            cliTimeVar: GlobalConstants.GetClientTimeVariance(),
            transactionDate: new Date(Date.now()),
            ticketRRN: _utilSvc.getUniqueRRN(),
            tranStatus: TranStatusType.InProgress,
            voidType: '',
            voidTypeDesc: '',
            tktList: [] as SalesTransactionCheckoutItem[],
            ticketTenderList: [] as TicketTender[],
            associateTips: [] as AssociateSaleTips[],
            vMTndr: [] as ExchCardTndr[],
            shipHandling: 0,
            shipHandlingTaxAmt: 0,
            shipHandlingFC: 0,
            shipHandlingTaxAmtFC: 0

         }
      }
   }),



   on(removeTndrWithSaveCode, (state, action) => {
      let tndrCode: string = action.tndrCode;
      //console.log("removeTndrWithSaveCode called with code: " + tndrCode);
      state.tktObj.ticketTenderList.forEach((tndr: TicketTender) => { console.log("Tender Code: " + tndr.tenderTypeCode); });

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.length == 1 ? [] : state.tktObj.ticketTenderList.filter((tndr: TicketTender) => tndr.tenderTypeCode != tndrCode)
         }
      }
   }),

   

      on(resetTktObj, (state, action) => {

      //console.log("resetTktObj called");

      let _utilSvc = new UtilService();

      //let logonDataSvc = action._logonDataSvc;
      let locationCnfg = action.locConfig;
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            locationUID: locationCnfg.locationUID,
            individualUID: locationCnfg.individualUID,
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
            tranExchCpnAmtDC: 0,
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


      var saleAssocAry: AssociateSaleTips[] = [];
      _tktObj.tktList.forEach((k: SalesTransactionCheckoutItem) => {

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
      newCheckOutItem.fcDiscountAmount = 0;
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

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: [...state.tktObj?.tktList,
               newCheckOutItem],
            associateTips: saleAssocAry,
         },
      };
   }),
   
   on(updateServedByAssociate, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
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
            tktList: state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
               let unitPriceNDC = action.defCurrSymbl == '$' ? itm.unitPrice * action.dailyExchRateObj.exchangeRate : (itm.unitPrice / action.dailyExchRateObj.exchangeRate);
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
                  return {
                     ...itm,
                     quantity: itm.quantity + 1,
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
            tktList: state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId && itm.quantity > 1) {
                  return {
                     ...itm,
                     quantity: itm.quantity - 1,
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
            tktList: state.tktObj.tktList.filter((itm: SalesTransactionCheckoutItem) => (itm.salesItemUID != action.saleItemId && (action.tktDtlId == 0 || itm.ticketDetailId != action.tktDtlId)))
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
      
      if(tenderListCopy.filter(tndr => (tndr.ticketTenderId == action.tndrObj.ticketTenderId || tndr.rrn == action.tndrObj.rrn)).length > 0) {
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
         tndrObj.gcExpiryYear = action.tndrObj.gcExpiryYear || tndrObj.gcExpiryYear;
         tndrObj.gcExpiryMonth = action.tndrObj.gcExpiryMonth || tndrObj.gcExpiryMonth;
         tndrObj.tenderTransactionId = (action.tndrObj.tenderTransactionId !== null && action.tndrObj.tenderTransactionId > 0) ? action.tndrObj.tenderTransactionId : state.tktObj.transactionID;

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

   on(deleteDeclinedTenderFromStore, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.filter((tndr: TicketTender) => tndr.rrn != action.rrn)
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
      respObj.ticketTenderId = state.tktObj.ticketTenderList.filter((tndr: TicketTender) => tndr.rrn == respObj.INVOICE)[0]?.ticketTenderId;
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
      /**
       * updateCheckoutTotals
       * - Calculates per-line amounts and ticket totals.
       * - Applies KATUSA coupon first (100% discount for KATUSA dept items).
       * - Vendor + Exchange coupons apply after KATUSA.
       * - Exchange coupon is either line-level OR transaction-level, not both.
       * - Transaction exchange coupon percent applies on subtotal or grand total
       *   depending on ExchangeCouponAfterTax flag.
       * - Transaction exchange coupon amount is distributed by net base (unitPrice * qty).
       */

      const dfltCurrCode = action.logonDataSvc.getDfltCurrCode(); // "USD" or not
      const exchCouponAfterTax = action.logonDataSvc.getExchCouponAfterTax();
      const vendCouponAfterTax = action.logonDataSvc.getVendorCouponAfterTax();

      const exchRateObj = action.logonDataSvc.getDailyExchRate();
      const exchangeRate = exchRateObj.exchangeRate;
      const taxExempted = state.tktObj.taxExempted;

      // Transaction exchange coupon (percent or amount)
      const transExchPct = state.tktObj.tCouponPerc || 0;
      const transExchAmtUsd = state.tktObj.tCouponAmt || 0;
      const transExchAmtNdc = state.tktObj.tDCouponAmt || 0;

      const isUsd = dfltCurrCode == "USD";
      const transExchDC = isUsd ? transExchAmtUsd : transExchAmtNdc;
      const transExchNDC = isUsd ? transExchAmtNdc : transExchAmtUsd;

      const useTransExch = transExchPct > 0 || transExchDC > 0 || transExchNDC > 0;

      // Copy list
      const updatedTktList: SalesTransactionCheckoutItem[] = JSON.parse(
         JSON.stringify([...state.tktObj.tktList])
      );

      // Totals (DC)
      let subtotalDC = 0;
      let taxTotalDC = 0;
      let envTaxTotalDC = 0;
      let totalSavingsDC = 0;
      let grandTotalDC = 0;

      // Totals (NDC/FC)
      let subtotalNDC = 0;
      let taxTotalNDC = 0;
      let envTaxTotalNDC = 0;
      let totalSavingsNDC = 0;
      let grandTotalNDC = 0;

      // Base for transaction exchange coupon distribution (exclude KATUSA)
      let eligibleBaseDC = 0;
      let eligibleBaseNDC = 0;

      for (const item of updatedTktList) {
         const isKatusa = (item.deptName ?? "").toUpperCase() === "KATUSA";
         const lineSubDC = Round2DecimalService.round(item.unitPrice * item.quantity);
         const unitPriceNDC = isUsd ? (item.unitPrice * exchangeRate) : (item.unitPrice / exchangeRate);
         const lineSubNDC = Round2DecimalService.round(unitPriceNDC * item.quantity);

         if (!isKatusa) {
            eligibleBaseDC += lineSubDC;
            eligibleBaseNDC += lineSubNDC;
         }
      }

      // Determine transaction exchange coupon total (percent or amount)
      let transExchTotalDC = 0;
      let transExchTotalNDC = 0;

      if (useTransExch) {
         if (transExchPct > 0) {
            // Percent base can be subtotal or grand total
            const baseDC = exchCouponAfterTax
               ? Round2DecimalService.round(
                  eligibleBaseDC +
                  (taxExempted ? 0 : 0) // taxes will be computed per line; no ship tax yet
               )
               : Round2DecimalService.round(eligibleBaseDC);

            transExchTotalDC = Round2DecimalService.round(baseDC * (transExchPct / 100));

            const baseNDC = exchCouponAfterTax
               ? Round2DecimalService.round(
                  eligibleBaseNDC +
                  (taxExempted ? 0 : 0)
               )
               : Round2DecimalService.round(eligibleBaseNDC);

            transExchTotalNDC = Round2DecimalService.round(baseNDC * (transExchPct / 100));
         } else {
            transExchTotalDC = Round2DecimalService.round(transExchDC);
            transExchTotalNDC = Round2DecimalService.round(transExchNDC);
         }

         // If transaction coupon is used, zero out line-level exchange coupons
         for (const item of updatedTktList) {
            item.exchangeCouponDiscountPct = 0;
            item.couponLineItemDollarAmount = 0;
            item.fcCouponLineItemDollarAmount = 0;
            item.exchCpnAmountDC = 0;
            item.exchCpnAmountNDC = 0;
         }
      }

      // Distribute transaction exchange coupon across eligible items
      if (useTransExch && eligibleBaseDC > 0) {
         let remainingDC = transExchTotalDC;
         let remainingNDC = transExchTotalNDC;

         let lastEligibleIndex = -1;
         for (let i = 0; i < updatedTktList.length; i++) {
            const isKatusa = (updatedTktList[i].deptName ?? "").toUpperCase() === "KATUSA";
            const lineSubDC = Round2DecimalService.round(updatedTktList[i].unitPrice * updatedTktList[i].quantity);
            if (!isKatusa && lineSubDC > 0) lastEligibleIndex = i;
         }

         for (let i = 0; i < updatedTktList.length; i++) {
            const item = updatedTktList[i];
            const isKatusa = (item.deptName ?? "").toUpperCase() === "KATUSA";
            if (isKatusa) continue;

            const lineSubDC = Round2DecimalService.round(item.unitPrice * item.quantity);
            const unitPriceNDC = isUsd ? item.unitPrice * exchangeRate : item.unitPrice / exchangeRate;
            const lineSubNDC = Round2DecimalService.round(unitPriceNDC * item.quantity);

            if (lineSubDC <= 0) continue;

            const dcShare = (i === lastEligibleIndex)
               ? remainingDC
               : Round2DecimalService.round(transExchTotalDC * (lineSubDC / eligibleBaseDC));

            const ndcShare = (i === lastEligibleIndex)
               ? remainingNDC
               : Round2DecimalService.round(transExchTotalNDC * (lineSubNDC / eligibleBaseNDC));

            item.exchCpnAmountDC = dcShare;
            item.exchCpnAmountNDC = ndcShare;

            //couponLineItemDollarAmount and fcCouponLineItemDollarAmount will be used to store line-level exchange coupon for display; 
            //for transaction-level exchange coupon, these placeholders shall be empty to avoid confusion
            item.couponLineItemDollarAmount = 0;
            item.fcCouponLineItemDollarAmount = 0;

            remainingDC = Round2DecimalService.round(remainingDC - dcShare);
            remainingNDC = Round2DecimalService.round(remainingNDC - ndcShare);
         }
      }

      // Main loop: calculate per-line
      for (const item of updatedTktList) {
         const isKatusa = (item.deptName ?? "").toUpperCase() === "KATUSA";

         // DC values
         const lineSubDC = Round2DecimalService.round(item.unitPrice * item.quantity);

         const vendorPct = Number(item.vendorCouponDiscountPct) || 0;
         let vendorDiscDC = vendorPct > 0
            ? Round2DecimalService.round(lineSubDC * (vendorPct / 100))
            : Round2DecimalService.round(dfltCurrCode == "USD" ? item.discountAmount || 0 : item.fcDiscountAmount || 0);
         let exchDiscDC = 0;

         if (!useTransExch) {
            if (item.exchangeCouponDiscountPct > 0) {
               exchDiscDC = Round2DecimalService.round(lineSubDC * (item.exchangeCouponDiscountPct / 100));
            } else {
               exchDiscDC = Round2DecimalService.round(item.couponLineItemDollarAmount || 0);
            }
         } else {
            exchDiscDC = Round2DecimalService.round(item.exchCpnAmountDC || 0);
         }

         let katusaCpnDC = 0;
         if (isKatusa) {
            katusaCpnDC = lineSubDC;
            vendorDiscDC = 0;
            exchDiscDC = 0;
         }

         let preTaxDiscountDC = 0;
         if (isKatusa) {
            preTaxDiscountDC = lineSubDC;
         } else {
            preTaxDiscountDC += (vendCouponAfterTax ? 0 : vendorDiscDC);
            preTaxDiscountDC += (exchCouponAfterTax ? 0 : exchDiscDC);
         }

         let taxableBaseDC = Round2DecimalService.round(lineSubDC - preTaxDiscountDC);

         let lineTaxDC = Round2DecimalService.round(taxableBaseDC * (item.salesTaxPct / 100));
         let lineEnvTaxDC = Round2DecimalService.round(taxableBaseDC * (item.envrnmtlTaxPct / 100));

         if (taxExempted || isKatusa) {
            lineTaxDC = 0;
            lineEnvTaxDC = 0;
         }

         const lineSavingsDC = Round2DecimalService.round(vendorDiscDC + exchDiscDC + katusaCpnDC);
         const lineTotalDC = Round2DecimalService.round(
            lineSubDC + lineTaxDC + lineEnvTaxDC - (vendorDiscDC + exchDiscDC + katusaCpnDC)
         );

         // NDC/FC values
         const unitPriceNDC = isUsd ? item.unitPrice * exchangeRate : item.unitPrice / exchangeRate;
         const lineSubNDC = Round2DecimalService.round(unitPriceNDC * item.quantity);

         const vendorDiscNDC = vendorPct > 0
            ? Round2DecimalService.round(lineSubNDC * (vendorPct / 100))
            : Round2DecimalService.round(dfltCurrCode == "USD" ? item.fcDiscountAmount || 0 : item.discountAmount || 0);
         const exchDiscNDC = useTransExch
            ? Round2DecimalService.round(item.exchCpnAmountNDC || 0)
            : (item.exchangeCouponDiscountPct > 0
               ? Round2DecimalService.round(lineSubNDC * (item.exchangeCouponDiscountPct / 100))
               : Round2DecimalService.round(item.fcCouponLineItemDollarAmount || 0));

         let katusaCpnNDC = 0;
         if (isKatusa) {
            katusaCpnNDC = lineSubNDC;
         }

         let preTaxDiscountNDC = 0;
         if (isKatusa) {
            preTaxDiscountNDC = lineSubNDC;
         } else {
            preTaxDiscountNDC += (vendCouponAfterTax ? 0 : vendorDiscNDC);
            preTaxDiscountNDC += (exchCouponAfterTax ? 0 : exchDiscNDC);
         }

         let taxableBaseNDC = Round2DecimalService.round(lineSubNDC - preTaxDiscountNDC);

         let lineTaxNDC = Round2DecimalService.round(taxableBaseNDC * (item.salesTaxPct / 100));
         let lineEnvTaxNDC = Round2DecimalService.round(taxableBaseNDC * (item.envrnmtlTaxPct / 100));

         if (taxExempted || isKatusa) {
            lineTaxNDC = 0;
            lineEnvTaxNDC = 0;
         }

         const lineSavingsNDC = Round2DecimalService.round(vendorDiscNDC + exchDiscNDC + katusaCpnNDC);
         const lineTotalNDC = Round2DecimalService.round(
            lineSubNDC + lineTaxNDC + lineEnvTaxNDC - (vendorDiscNDC + exchDiscNDC + katusaCpnNDC)
         );

         // Write DC fields
         item.lineItemTaxAmount = isUsd ? lineTaxDC : lineTaxNDC;
         item.lineItemEnvTaxAmount = isUsd ? lineEnvTaxDC : lineEnvTaxNDC;
         item.lineItmKatsaCpnAmt = isUsd ? katusaCpnDC : katusaCpnNDC;
         item.discountAmount = isUsd ? vendorDiscDC : vendorDiscNDC;
         if (!useTransExch) {
            item.couponLineItemDollarAmount = isUsd ? exchDiscDC : exchDiscNDC;
         }
         item.lineItemDollarDisplayAmount = isUsd ? lineTotalDC : lineTotalNDC;

         item.fcLineItemTaxAmount = isUsd ? lineTaxNDC : lineTaxDC;
         item.fcLineItemEnvTaxAmount = isUsd ? lineEnvTaxNDC : lineEnvTaxDC;
         item.fcLineItmKatsaCpnAmt = isUsd ? katusaCpnNDC : katusaCpnDC;
         item.fcDiscountAmount = isUsd ? vendorDiscNDC : vendorDiscDC;
         if (!useTransExch) {
            item.fcCouponLineItemDollarAmount = isUsd ? exchDiscNDC : exchDiscDC;
         }
         item.fcLineItemDollarDisplayAmount = isUsd ? lineTotalNDC : lineTotalDC;

         // Accumulate totals
         subtotalDC += lineSubDC;
         taxTotalDC += lineTaxDC;
         envTaxTotalDC += lineEnvTaxDC;
         totalSavingsDC += lineSavingsDC;
         grandTotalDC += lineTotalDC;

         subtotalNDC += lineSubNDC;
         taxTotalNDC += lineTaxNDC;
         envTaxTotalNDC += lineEnvTaxNDC;
         totalSavingsNDC += lineSavingsNDC;
         grandTotalNDC += lineTotalNDC;
      }

      // Add ship/handling to totals
      const shipHandlingTaxAmtUsd = taxExempted ? 0 : (state.tktObj.shipHandlingTaxAmt || 0);
      const shipHandlingTaxAmtFc = taxExempted ? 0 : (state.tktObj.shipHandlingTaxAmtFC || 0);
      
      const shipHandlingAmtUsd = state.tktObj.shipHandling || 0;
      const shipHandlingAmtFc = state.tktObj.shipHandlingFC || 0;

      taxTotalDC += isUsd ? shipHandlingTaxAmtUsd : shipHandlingTaxAmtFc;
      taxTotalNDC += isUsd ? shipHandlingTaxAmtFc : shipHandlingTaxAmtUsd;

      grandTotalDC = Round2DecimalService.round(subtotalDC + taxTotalDC - totalSavingsDC + (isUsd ? shipHandlingAmtUsd : shipHandlingAmtFc));
      grandTotalNDC = Round2DecimalService.round(subtotalNDC + taxTotalNDC - totalSavingsNDC + (isUsd ? shipHandlingAmtFc : shipHandlingAmtUsd));

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: updatedTktList,
            shipHandlingTaxAmt: shipHandlingTaxAmtUsd,
            shipHandlingTaxAmtFC: shipHandlingTaxAmtFc,
            totalSale: grandTotalDC,
            totalSaleFC: grandTotalNDC,
            tCouponAmt: transExchTotalDC,
            tDCouponAmt: transExchTotalNDC,
            tCouponPerc: transExchPct
         },
         tktTotals: {
            ...state.tktTotals,
            subTotalDC: Round2DecimalService.round(subtotalDC),
            subTotalNDC: Round2DecimalService.round(subtotalNDC),
            totalTaxDC: Round2DecimalService.round(taxTotalDC),
            totalTaxNDC: Round2DecimalService.round(taxTotalNDC),
            totalSavingsDC: Round2DecimalService.round(totalSavingsDC),
            totalSavingsNDC: Round2DecimalService.round(totalSavingsNDC),
            tranExchCpnAmtDC: Round2DecimalService.round(transExchTotalDC),
            tranExchCpnAmtNDC: Round2DecimalService.round(transExchTotalNDC),
            grandTotalDC: Round2DecimalService.round(grandTotalDC),
            grandTotalNDC: Round2DecimalService.round(grandTotalNDC)
         }
      };
   }),

   on(updateSaleitems, (state, action) => {

      const updatedTktList = state.tktObj.tktList.map((stateItem: SalesTransactionCheckoutItem) => stateItem.salesItemUID == action.item.salesItemUID ? action.item : stateItem);
      let assocTips: AssociateSaleTips = new AssociateSaleTips();
      assocTips.indivLocId = action.item.srvdByAssociateVal;
      
      const updatedAssocSaleTips = state.tktObj.associateTips.map((stateTips: AssociateSaleTips) => stateTips.indivLocId == action.item.srvdByAssociateVal ? stateTips : assocTips);

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
         lineItemTotalDC += action.logonDataSvc.getDfltCurrCode() == 'USD' ? val.lineItemDollarDisplayAmount : val.fcLineItemDollarDisplayAmount;
         lineItemTotalNDC += action.logonDataSvc.getDfltCurrCode() == 'USD' ? val.fcLineItemDollarDisplayAmount : val.lineItemDollarDisplayAmount;
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
         .filter((item: SalesTransactionCheckoutItem) => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0];

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

      const updatedList = state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
         if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
            return {
               ...itm,
               exchangeCouponDiscountPct: parseFloat((itm.exchangeCouponDiscountPct > 0 ? action.cpnPct : itm.exchangeCouponDiscountPct).toCPOSFixed(2)),

               lineItemDollarDisplayAmount: parseFloat(lineItemDollarDisplayAmount.toCPOSFixed(2)),
               fcLineItemDollarDisplayAmount: parseFloat(dcLineItemDollarDisplayAmount.toCPOSFixed(2)),

               lineItemTaxAmount: parseFloat(lineItemTaxAmount.toCPOSFixed(2)),
               lineItemEnvTaxAmount: parseFloat(lineItemEnvTaxAmount.toCPOSFixed(2)),

               fcLineItemTaxAmount: parseFloat(dcLineItemTaxAmount.toCPOSFixed(2)),
               fCLineItemEnvTaxAmount: parseFloat(fCLineItemEnvTaxAmount.toCPOSFixed(2)),

               fcCouponLineItemDollarAmount: parseFloat(dcCouponLineItemDollarAmount.toCPOSFixed(2)),

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
         const itemLineDisplayNDC = item.fcLineItemDollarDisplayAmount;

         const itemTaxDC = item.lineItemTaxAmount + item.lineItemEnvTaxAmount;
         const itemTaxNDC = item.fcLineItemTaxAmount + item.fcLineItemEnvTaxAmount;

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
         // tktTotals: {
         //    ...state.tktTotals,
         //    grandTotalDC: parseFloat(grandTotalDC.toCPOSFixed(2)),
         //    grandTotalNDC: parseFloat(grandTotalNDC.toCPOSFixed(2)),
         //    totalSavingsDC: parseFloat(totalSavingsDC.toCPOSFixed(2)),
         //    totalSavingsNDC: parseFloat(totalSavingsNDC.toCPOSFixed(2)),
         //    subTotalDC: parseFloat(subTotalDC.toCPOSFixed(2)),
         //    subTotalNDC: parseFloat(subTotalNDC.toCPOSFixed(2)),
         //    totalTaxDC: parseFloat(totalTaxDC.toCPOSFixed(2)),
         //    totalTaxNDC: parseFloat(totalTaxNDC.toCPOSFixed(2)),
         // }
      };
   }),

   on(upsertSaleItemVndCpn, (state, action) => {

      let exchRate = action.logonDataSvc.getExchangeRate();
      let dfltCurrCode = action.logonDataSvc.getDfltCurrCode();
      let IsForeignCurr = action.logonDataSvc.getIsForeignCurr();
      // let lineItemGrantTotal: number = 0, lineitemGrandTotalNDC: number = 0;
      // let vndDiscAmtDC = 0, vndDiscAmtNDC = 0;
      // let tktItem: SalesTransactionCheckoutItem = state.tktObj.tktList.filter(item => item.salesItemUID == action.saleItemId && item.ticketDetailId == action.tktDtlId)[0];
      let updateCpn: boolean = false;
      let cpnAmt = Number(action.cpnAmt) || 0;
      let cpnPct = Number(action.cpnPct) || 0;

      // let subTotalDC = 0, subTotalNDC = 0, grandTotalDC = 0, grandTotalNDC = 0;
      // let totalExchCpnAmtDC = 0, totalExchCpnAmtNDC = 0, totalSavingsDC = 0, totalSavingsNDC = 0;

      // let totalTaxDC: number = 0;
      // let totalTaxNDC: number = 0;

      // let tktListCopy: SalesTransactionCheckoutItem[] = JSON.parse(JSON.stringify(state.tktObj.tktList));

      // const totalBaseDC = tktListCopy.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      // const totalBaseNDC = tktListCopy.reduce((sum, item) => sum + (item.fcUnitPrice * item.quantity), 0);

      // const totalCouponDC = action.cpnPct > 0
      //    ? 0
      //    : parseFloat((action.cpnAmt * (dfltCurr == "USD" ? 1 : exchRate)).toCPOSFixed(2));
      // const totalCouponNDC = action.cpnPct > 0
      //    ? 0
      //    : parseFloat((action.cpnAmt * (dfltCurr == "USD" ? exchRate : (1 / exchRate))).toCPOSFixed(2));

      // let remainingCouponDC = totalCouponDC;
      // let remainingCouponNDC = totalCouponNDC;

      // const vendAfterTax = action.logonDataSvc.getVendorCouponAfterTax();
      // const exchAfterTax = action.logonDataSvc.getExchCouponAfterTax();

      if (action.logonDataSvc.getLoadTicket() && state.tktTotals.amtPaidDC == 0) {
         updateCpn = true;
      }

      let cpnAmtNDC = 0;

      if(action.cpnPct > 0) {
         cpnAmtNDC = 0;
      }
      else {
         cpnAmtNDC = parseFloat((cpnAmt * (dfltCurrCode == "USD" ? exchRate : (1 / exchRate))).toCPOSFixed(2));
      }

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            updateCoupons: updateCpn,
            tktList: state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
               if (itm.salesItemUID == action.saleItemId && itm.ticketDetailId == action.tktDtlId) {
                  return {
                     ...itm,

                     discountAmount: dfltCurrCode == "USD" ? cpnAmt : cpnAmtNDC,
                     fcDiscountAmount: dfltCurrCode == "USD" ? cpnAmtNDC : cpnAmt,

                     vndCpnAmountDC: dfltCurrCode == "USD" ? cpnAmt : cpnAmtNDC,
                     vndCpnAmountNDC: dfltCurrCode == "USD" ? cpnAmtNDC : cpnAmt,

                     vendorCouponDiscountPct: cpnPct > 0 ? cpnPct : 0
                  }
               }
               else {
                  return {
                     ...itm
                  }
               }
            })
         },
      }
   }),
   on(upsertTranExchCpn, (state, action) => {

      let exchRate = action.logonDataSvc.getExchangeRate();
      let dfltCurr = action.logonDataSvc.getDfltCurrCode();
      let IsForeignCurr = action.logonDataSvc.getIsForeignCurr();

      let exchDiscAmtDC = 0;
      let exchDiscAmtNDC = 0;

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            updateCoupons: true,
            tCouponAmt: action.cpnAmt,
            tCouponPerc: action.cpnPct,
            tDCouponAmt: parseFloat((action.cpnAmt * exchRate).toCPOSFixed(2))
         },
         tktTotals: {
            ...state.tktTotals,
            tranExchCpnAmtDC: action.cpnAmt,
            tranExchCpnAmtNDC: parseFloat((action.cpnAmt * exchRate).toCPOSFixed(2)),
         }
      }
   }),

   on(saveTenderObjSuccess, (state, action) => {

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            ticketTenderList: state.tktObj.ticketTenderList.map((tndr: TicketTender) => {
               
               if (action.data != null && action.data.data != null) {
                  if(action.data.data.ticketTenderId != null && tndr.ticketTenderId == action.data.data.ticketTenderId) {
                     return {
                        ...tndr
                     };
                  }
                  else if(action.data.data.rrn != null && tndr.rrn == action.data.data.rrn) {
                     console.log("Updating tender with RRN:", tndr.rrn, "with ticketTenderId:", action.data.data.ticketTenderId);
                     return {
                        ...tndr,
                        ticketTenderId: action.data.data.ticketTenderId,                  
                     };
                  }
                  else {
                     return {
                        ...tndr
                     };                     
                  }
               }
               else {
                  console.log("No match for tender with RRN:", tndr.rrn);
                  return {
                     ...tndr
                  };
               }
            }),
         },
      }
   }),
   on(saveTicketDetailSuccess, (state, action) => {
      let isMapped = false;
      const requestItemDescription = (action.request.itemDescription || '').trim().toLowerCase();

      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            transactionID: action.data.transactionId || state.tktObj.transactionID,
            tktList: state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
               const isSameSalesItem = itm.salesItemUID === action.data.salesItemId;
               const isMiscByDescription = itm.isMiscellaneous &&
                  (itm.salesItemDesc || '').trim().toLowerCase() === requestItemDescription;
               const isUnresolvedTempItem = itm.ticketDetailId < 0;

               if (!isMapped && isUnresolvedTempItem && (isMiscByDescription || isSameSalesItem)) {
                  isMapped = true;
                  return {
                     ...itm,
                     salesItemUID: action.data.salesItemId,
                     ticketDetailId: action.data.ticketDetailId,
                     tktTransactionID: action.data.transactionId,
                     itemSaved: true
                  };
               }

               return itm;
            })
         }
      };
   }),
   on(inactiveTicketDetailSuccess, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            tktList: state.tktObj.tktList.filter((itm: SalesTransactionCheckoutItem) => itm.ticketDetailId !== action.request.ticketDetailId)
         }
      };
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
            tktList : state.tktObj.tktList.map((itm: SalesTransactionCheckoutItem) => {
               if(action.rslt.ticketDetailList == null || action.rslt.ticketDetailList.length == 0) {
                  console.warn("No ticket details found in the response");
                  return { ...itm }
               }
               let salesItem = action.rslt.ticketDetailList.filter((obj: TicketDetailListAry) => obj.salesItemUID === itm.salesItemUID)[0];
               if(itm.isMiscellaneous && (salesItem == null || typeof salesItem == 'undefined')) {
                  salesItem = action.rslt.ticketDetailList.filter((obj: TicketDetailListAry) => obj.salesItemDesc === itm.salesItemDesc)[0];
                  return {
                     ...itm,
                     salesItemUID: salesItem.salesItemUID,
                     ticketDetailId: salesItem.ticketDetailId
                  }
               }

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
            ticketTenderList: state.tktObj.ticketTenderList.map((tndr: TicketTender) => {
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
   on(addRefundReason, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,
            refundCode: action.refundCode,
            refundReason: action.refundReason,
            isRefund: true
         }
      }
   }),
   on(markTendersComplete, (state, action) => {
      return {
         ...state,
         tktObj: {
            ...state.tktObj,            
            ticketTenderList: state.tktObj.ticketTenderList.map((tndr: TicketTender) => {
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
            tranStatus: action.status
         }
      }
   }),

   on(loadTicketSuccess, (state, { tktObj: loadedTktObj }) => {

      const cancelledTenderTypeIds = new Set(['XC', 'XR', 'MS', 'MR', 'GC'].map(type => (type)));
      const normalizeAuthNbr = (authNbr?: string | null) => (authNbr ?? '').trim();
      const rawLoadedTicket = loadedTktObj as any;
      const shipHandlingFc = rawLoadedTicket.fCShipHandling ?? rawLoadedTicket.fcShipHandling ?? rawLoadedTicket.shipHandlingFC ?? 0;
      const shipHandlingTaxAmtFc = rawLoadedTicket.fCShipHandlingTaxAmt ?? rawLoadedTicket.fcShipHandlingTaxAmt ?? rawLoadedTicket.shipHandlingTaxAmtFC ?? 0;

      const tenderList = TicketTender.deepCopyTenderList(loadedTktObj.tenders).map(tndr => {
         const isAuthMissing = normalizeAuthNbr(tndr.authNbr).length === 0;

         if (cancelledTenderTypeIds.has(tndr.tenderTypeCode) && isAuthMissing) {
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
            shipHandlingFC: shipHandlingFc,
            shipHandlingTaxAmt: loadedTktObj.shipHandlingTaxAmt ?? 0,
            shipHandlingTaxAmtFC: shipHandlingTaxAmtFc,
            taxExempted: loadedTktObj.taxExempted == 1,
            transactionDate: loadedTktObj.transactionDate ? new Date(loadedTktObj.transactionDate) : new Date(),
            tranStatus: TranStatusType.InProgress,
            ticketTenderList: tenderList,
            tktList: SalesTransactionCheckoutItem.deepCopySaleItemList(loadedTktObj.items),
            customer: loadedTktObj.customer ? { ...loadedTktObj.customer } : {} as LTC_Customer,
            
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
            shipHandling: action.dfltCurrSymbl == '$' ? action.shipHandlingAmountDC : action.shipHandlingAmountNDC,
            shipHandlingFC: action.dfltCurrSymbl == '$' ? action.shipHandlingAmountNDC : action.shipHandlingAmountDC,
            shipHandlingTaxAmt: action.dfltCurrSymbl == '$' ? action.shipHandlingTaxDC : action.shipHandlingTaxNDC,
            shipHandlingTaxAmtFC: action.dfltCurrSymbl == '$' ? action.shipHandlingTaxNDC : action.shipHandlingTaxDC
         },
         tktTotals: {   
            ...state.tktTotals,
            shipHandlingDC: action.shipHandlingAmountDC,
            shipHandlingNDC: action.shipHandlingAmountNDC,
            shipHandlingTaxDC: action.shipHandlingTaxDC,
            shipHandlingTaxNDC: action.shipHandlingTaxNDC,
            // totalTaxDC: state.tktTotals.totalTaxDC + action.shipHandlingTaxDC,
            // totalTaxNDC: state.tktTotals.totalTaxNDC + action.shipHandlingTaxNDC,
            // grandTotalDC: state.tktTotals.grandTotalDC + action.shipHandlingAmountDC + action.shipHandlingTaxDC,
            // grandTotalNDC: state.tktTotals.grandTotalNDC + action.shipHandlingAmountNDC + action.shipHandlingTaxNDC
         }

      }
   })   
)


export function TktObjReducer(state: saleTranDataInterface, action: Action) {
   return _tktObjReducer(state, action);

}

