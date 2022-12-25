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
  })