import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TicketSplit } from "src/app/models/ticket.split";
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
    return state.tktObj.totalSale - state.tktObj.balanceDue - tenderTotal;
  });

export const getBalanceDueFC = createSelector(getTktObjState,
  (state) => {
    let tenderTotalFC: number = 0;
    state.tktObj.ticketTenderList.forEach(tndr => tenderTotalFC += tndr.fCTenderAmount);
    return state.tktObj.totalSaleFC - tenderTotalFC;
  });

export const getCheckoutItemsCount = createSelector(getTktObjState,
  (state) => {
    return state.tktObj.tktList.length;
  });