import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TicketSplit } from "src/app/models/ticket.split";
import { Round2DecimalService } from "src/app/services/round2-decimal.service";
import { SalesTransactionCheckoutItem } from "../../../models/salesTransactionCheckoutItem";
import { saleTranDataInterface } from "./ticket.state";

export const TKT_OBJ_STATE = 'TktObjState'
const getTktObjState = createFeatureSelector<saleTranDataInterface>(TKT_OBJ_STATE)

export const getTktObjSelector = createSelector(getTktObjState,
  (state) => {
    return state ? state.tktObj : null;
  });

export const getCheckoutItemsSelector = createSelector(getTktObjState,
  (state) => {
    return state.tktObj ? state.tktObj.tktList : null;
  });

export const getTicketTendersSelector = createSelector(getTktObjState,
  (state) => {
    return state.tktObj ? state.tktObj.ticketTenderList : null;
  });


export const getBalanceDue = createSelector(getTktObjState,
  (state) => {
    let tenderTotal: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += tndr.tenderAmount);
    return Round2DecimalService.round(state.tktObj.balanceDue);
  });

export const getBalanceDueFC = createSelector(getTktObjState,
  (state) => {
    let tenderTotalFC: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += tndr.fcTenderAmount);
    return Round2DecimalService.round(state.tktObj.balanceDue);
  });

// export const getRemainingBalanceDC = createSelector(getTktObjState,
//   (state) => {
//     let tenderTotal: number = 0;
//     state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += parseFloat((tndr.tenderAmount).toFixed(2)));
//     let ticketTotal: number = 0;
//     state.tktObj.tktList.forEach(itm => ticketTotal += itm.lineItemDollarDisplayAmount);
//     return Round2DecimalService.round(ticketTotal + state.tktObj.tipAmountDC - tenderTotal);
//   });

// export const getRemainingBalanceFC = createSelector(getTktObjState,
//   (state) => {
//     let tenderTotalFC: number = 0;
//     state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += parseFloat((tndr.fcTenderAmount).toFixed(2)));
//     let ticketTotalFC: number = 0;
//     state.tktObj.tktList.forEach(itm => ticketTotalFC += itm.dCLineItemDollarDisplayAmount);
//     return Round2DecimalService.round(ticketTotalFC + state.tktObj.tipAmountNDC - tenderTotalFC);
//   });

  export interface AmountDCNDC{
    amountDC: number;
    amountNDC: number;
  }

  export const getRemainingBal = createSelector(getTktObjState,
  (state) => {
    
    let tenderTotal: number = 0;
    let tipTotal: number = 0;
    let tenderTotalFC: number = 0;
    let ticketTotal: number = 0;
    let ticketTotalFC: number = 0;
    let tipTotalFC: number = 0;

    state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += parseFloat((tndr.tenderTypeCode != "SV" ? tndr.tenderAmount : 0).toFixed(2)));
    state.tktObj.tktList.forEach(itm => ticketTotal += parseFloat((itm.lineItemDollarDisplayAmount).toFixed(2)));
    state.tktObj.associateTips.forEach(tip => tipTotal += parseFloat((tip.tipAmount).toFixed(2)));

    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += parseFloat((tndr.tenderTypeCode != "SV" ? tndr.fcTenderAmount : 0).toFixed(2)));
    state.tktObj.tktList.forEach(itm => ticketTotalFC += parseFloat((itm.dCLineItemDollarDisplayAmount).toFixed(2)));
    state.tktObj.associateTips.forEach(tip => tipTotalFC += parseFloat((tip.tipAmtLocCurr).toFixed(2)));

    if (state.tktObj.isPartialPay) {
      ticketTotal = state.tktObj.partialAmount;
      ticketTotalFC = state.tktObj.partialAmountFC;
    }

    return {
      amountDC: Round2DecimalService.round(ticketTotal + tipTotal  - tenderTotal),
      amountNDC: Round2DecimalService.round(ticketTotalFC + tipTotalFC  - tenderTotalFC)
    } as AmountDCNDC;
  });

export const getCheckoutItemsCount = createSelector(getTktObjState,
  (state) => {
    return state.tktObj.tktList.length;
  });

export const getTicketTotals = createSelector(getTktObjState,
  (state) => {
    return state.tktTotals;
  })

export const getSavedTicketResult = createSelector(getTktObjState,
  (state) => {
    return state.saveTktRsltMdl;
  })

export const getAssocTipList = createSelector(getTktObjState,
  (state) => {
    return state.tktObj.associateTips;
  })

export const getIsCustomerAddedToTicket = createSelector(getTktObjState,
  (state) => {
    return state.tktObj.customerId > 0 || state.tktObj.updateCustomer || (state.tktObj.customer.cLastName != undefined);

  })

  export const getTicketTotalToPayDC = createSelector(getTktObjState,
    (state) => {
      let ticketTotal: number = 0;
      state.tktObj.tktList.forEach(itm => ticketTotal += itm.lineItemDollarDisplayAmount);
      let tipTotal: number = 0;
      state.tktObj.associateTips.forEach(tip => tipTotal += tip.tipAmount);
      
      return Round2DecimalService.round(ticketTotal + state.tktObj.tipAmountDC);
    });

    export const getTicketTotalToPayNDC = createSelector(getTktObjState,
      (state) => {
        let ticketTotalFC: number = 0;
        state.tktObj.tktList.forEach(itm => ticketTotalFC += itm.dCLineItemDollarDisplayAmount);
        let tipTotalFC: number = 0;
        state.tktObj.associateTips.forEach(tip => tipTotalFC += tip.tipAmtLocCurr);
       
        return Round2DecimalService.round(ticketTotalFC + state.tktObj.tipAmountNDC);
      });
    