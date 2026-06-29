import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ROV_POSTicketSplit } from "../../models/rticket.split";
import { EventConfig } from "../../models/event.config";
import { RSaveTicketResultsModel, RTicketTotals } from "../../models/rticket.split";
import { Round2DecimalService } from "../../../services-misc/round2-decimal.service";
import { Rov_SalesTranCheckoutItem } from "../../models/r-salestran-checkout-item";
import { RovSaleTranDataInterface } from "./rticket.state";

export const ROV_TKT_OBJ_STATE = 'RovTktObjState'
const getRTktObjState = createFeatureSelector<RovSaleTranDataInterface>(ROV_TKT_OBJ_STATE)

export const getRTktObjSelector = createSelector(getRTktObjState,
  (state) => {
    return state ? state.tktObj : null;
  });

export const getRCheckoutItemsSelector = createSelector(getRTktObjState,
  (state) => {
    return state.tktObj ? state.tktObj.tktList : null;
  });

export const getRTicketTendersSelector = createSelector(getRTktObjState,
  (state) => {
    return state.tktObj ? state.tktObj.ticketTenderList : null;
  });


export const getRBalanceDue = createSelector(getRTktObjState,
  (state) => {
    let tenderTotal: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += tndr.tenderAmount);
    return Round2DecimalService.round(state.tktObj.balanceDue);
  });

export const getRBalanceDueFC = createSelector(getRTktObjState,
  (state) => {
    let tenderTotalFC: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += tndr.fcTenderAmount);
    return Round2DecimalService.round(state.tktObj.balanceDue);
  });

// export const getRemainingBalanceDC = createSelector(getRTktObjState,
//   (state) => {
//     let tenderTotal: number = 0;
//     state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += parseFloat((tndr.tenderAmount).toCPOSFixed(2)));
//     let ticketTotal: number = 0;
//     state.tktObj.tktList.forEach(itm => ticketTotal += itm.lineItemDollarDisplayAmount);
//     return Round2DecimalService.round(ticketTotal + state.tktObj.tipAmountDC - tenderTotal);
//   });

// export const getRemainingBalanceFC = createSelector(getRTktObjState,
//   (state) => {
//     let tenderTotalFC: number = 0;
//     state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += parseFloat((tndr.fcTenderAmount).toCPOSFixed(2)));
//     let ticketTotalFC: number = 0;
//     state.tktObj.tktList.forEach(itm => ticketTotalFC += itm.dCLineItemDollarDisplayAmount);
//     return Round2DecimalService.round(ticketTotalFC + state.tktObj.tipAmountNDC - tenderTotalFC);
//   });

export interface AmountUSDFC {
    amountUSD: number;
    amountFC: number;
  }

  export const getRRemainingBal = createSelector(getRTktObjState,
  (state) => {
    if (!state || !state.tktObj) {
      return {
        amountUSD: 0,
        amountFC: 0
      } as AmountUSDFC;
    }
    
    let tenderTotalUSD: number = 0;
    let tipTotalUSD: number = 0;
    let ticketTotalUSD: number = 0;

    let tenderTotalFC: number = 0;
    let ticketTotalFC: number = 0;
    let tipTotalFC: number = 0;

    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalUSD += parseFloat((tndr.tenderTypeCode != "SV" ? tndr.tenderAmount : 0).toCPOSFixed(2)));
    state.tktObj.tktList.forEach(itm => ticketTotalUSD += parseFloat((itm.lineItemDollarDisplayAmount ?? 0).toCPOSFixed(2)));
    state.tktObj.associateTips.forEach(tip => tipTotalUSD += parseFloat((tip.tipAmount).toCPOSFixed(2)));

    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += parseFloat((tndr.tenderTypeCode != "SV" ? tndr.fcTenderAmount : 0).toCPOSFixed(2)));
    state.tktObj.tktList.forEach(itm => ticketTotalFC += parseFloat((itm.dCLineItemDollarDisplayAmount ?? 0).toCPOSFixed(2)));
    state.tktObj.associateTips.forEach(tip => tipTotalFC += parseFloat((tip.tipAmtLocCurr).toCPOSFixed(2)));

    if (state.tktObj.isPartialPay) {
      ticketTotalUSD = state.tktObj.partialAmount;
      ticketTotalFC = state.tktObj.partialAmountFC;
    }

    return {
      amountUSD: Round2DecimalService.round(ticketTotalUSD + tipTotalUSD + state.tktObj.shipHandling + state.tktObj.shipHandlingTaxAmt - tenderTotalUSD),
      amountFC: Round2DecimalService.round(ticketTotalFC + tipTotalFC + state.tktObj.shipHandlingFC + state.tktObj.shipHandlingTaxAmtFC - tenderTotalFC)
    } as AmountUSDFC;
  });

export const getRCheckoutItemsCount = createSelector(getRTktObjState,
  (state) => {
    return state.tktObj.tktList.length;
  });

export const getRTicketTotals = createSelector(getRTktObjState,
  (state) => {
    return state.tktTotals;
  })

export const getRSavedTicketResult = createSelector(getRTktObjState,
  (state) => {
    return state.saveTktRsltMdl;
  })

export const getAssocTipList = createSelector(getRTktObjState,
  (state) => {
    return state.tktObj.associateTips;
  })

export const getRIsCustomerAddedToTicket = createSelector(getRTktObjState,
  (state) => {
    return state.tktObj.customerId > 0 || state.tktObj.updateCustomer || (state.tktObj.customer?.cLastName != undefined);

  })

  export const getRTicketTotalToPayUSD = createSelector(getRTktObjState,
    (state) => {
      if(state.tktObj.isPartialPay) {
        return Round2DecimalService.round(state.tktObj.partialAmount);
      }
      let ticketTotal: number = 0;
      state.tktObj.tktList.forEach(itm => ticketTotal += itm.lineItemDollarDisplayAmount);
      let tipTotal: number = 0;
      state.tktObj.associateTips.forEach(tip => tipTotal += tip.tipAmount);
      
      return Round2DecimalService.round(ticketTotal + tipTotal + state.tktObj.shipHandling + state.tktObj.shipHandlingTaxAmt);
    });

    export const getRTicketTotalToPayFC = createSelector(getRTktObjState,
      (state) => {
        if(state.tktObj.isPartialPay) {
          return Round2DecimalService.round(state.tktObj.partialAmountFC);
        }
        let ticketTotalFC: number = 0;
        state.tktObj.tktList.forEach(itm => ticketTotalFC += itm.dCLineItemDollarDisplayAmount);
        let tipTotalFC: number = 0;
        state.tktObj.associateTips.forEach(tip => tipTotalFC += tip.tipAmtLocCurr);
       
        return Round2DecimalService.round(ticketTotalFC + tipTotalFC + state.tktObj.shipHandlingFC + state.tktObj.shipHandlingTaxAmtFC);
      });

  export const getRIsSplitPayR5 = createSelector(getRTktObjState,
    (state) => {
      return state.tktObj.isSplitPayR5;
    }); 

  export const getRTranIdTicketNumber = createSelector(getRTktObjState,
    (state) => {
      return { tranId: state.tktObj.transactionID, ticketNumber: state.tktObj.ticketNumber, locationId: state.tktObj.eventId };
    });
    