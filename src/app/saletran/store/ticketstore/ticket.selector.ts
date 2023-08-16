import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TicketSplit } from "src/app/models/ticket.split";
import { Round2DecimalService } from "src/app/services/round2-decimal.service";
import { SalesTransactionCheckoutItem } from "../../models/salesTransactionCheckoutItem";
import { tktObjInterface } from "./ticket.state";

export const TKT_OBJ_STATE = 'TktObjState'
const getTktObjState = createFeatureSelector<tktObjInterface>(TKT_OBJ_STATE)

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
    return Round2DecimalService.round((state.tktObj.isPartialPay ? state.tktObj.partialAmount : (state.tktObj.totalSale - state.tktObj.balanceDue))  - tenderTotal);
  });

export const getBalanceDueFC = createSelector(getTktObjState,
  (state) => {
    let tenderTotalFC: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += tndr.fCTenderAmount);
    return Round2DecimalService.round((state.tktObj.isPartialPay ? state.tktObj.partialAmountFC : (state.tktObj.totalSaleFC - state.tktObj.balanceDue))  - tenderTotalFC);
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