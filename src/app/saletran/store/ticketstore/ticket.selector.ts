import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TicketSplit } from "src/app/models/ticket.split";
import { Round2DecimalService } from "src/app/services/round2-decimal.service";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
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

export const getBalanceDue = createSelector(getTktObjState,
  (state) => {
    let tenderTotal: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += tndr.tenderAmount);
    return Round2DecimalService.round(state.tktObj.balanceDue);
  });

export const getBalanceDueFC = createSelector(getTktObjState,
  (state) => {
    let tenderTotalFC: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += tndr.fCTenderAmount);
    return Round2DecimalService.round(state.tktObj.balanceDue);
  });

  export const getRemainingBalance = createSelector(getTktObjState,
    (state) => {
      let tenderTotal: number = 0;
      state.tktObj.ticketTenderList.forEach(tndr => tenderTotal += tndr.tenderAmount);
      let ticketTotal: number = 0;
      state.tktObj.tktList.forEach(itm => ticketTotal += itm.lineItemDollarDisplayAmount);
      return Round2DecimalService.round(ticketTotal + state.tktObj.tipAmountDC - tenderTotal);
    });
  
    export const getRemainingBalanceFC = createSelector(getTktObjState,
      (state) => {
        let tenderTotalFC: number = 0;
        state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += tndr.fCTenderAmount);
        let ticketTotalFC: number = 0;
        state.tktObj.tktList.forEach(itm => ticketTotalFC += itm.dCLineItemDollarDisplayAmount);
        return Round2DecimalService.round(ticketTotalFC + state.tktObj.tipAmountNDC - tenderTotalFC);
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
    return state.tktObj.customerId > 0 || state.tktObj.updateCustomer || (state.tktObj.customer.cLastName != undefined) ;

})

