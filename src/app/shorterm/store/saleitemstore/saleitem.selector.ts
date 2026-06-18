import { createFeatureSelector, createSelector } from "@ngrx/store";
import { RovSaleItemsState } from "./saleitem.state";


export const SHARED_SALE_ITEMS_MENU_STATE = 'sharedSaleItemsMenuState'
const getSaleItemsState = createFeatureSelector<RovSaleItemsState>(SHARED_SALE_ITEMS_MENU_STATE)
export const GET_SALE_ITEM_MENU = 'GetSaleItemMenu'

export const getSaleItemListSelector = createSelector(getSaleItemsState, 
    (state) => {
    return state ? state.saleItemRsltsMdl : null;
});

